import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv


class DBManager:
    # TODO: Prevent SQL injection

    report_column_format = """id, status, created_at, remarks, photo_url, type, ward_no,
        ST_X(location::geometry) AS lng,
        ST_Y(location::geometry) AS lat"""

    incident_column_format = """id, created_at, type, no_of_reports, public_attention_score, ST_X(centroid::geometry) AS lng, ST_Y(centroid::geometry) AS lat
    """

    def __init__(self) -> None:

        print("[INFO] Loading .env file")        
        load_dotenv()

        self._conn = psycopg2.connect(
            os.getenv("DATABASE_URL")
        )
        self.cur = self._conn.cursor(cursor_factory=RealDictCursor)


    # Reports ---------------------------------------------
    def get_reports(self, limit : int | None = None) -> list:

        if limit is None:
            self.cur.execute(f"""
                SELECT {self.report_column_format}
                FROM reports
            """)
        else:
            self.cur.execute(f"""
                SELECT {self.report_column_format}
                FROM reports limit {limit}
            """)

        rows = self.cur.fetchall()
        return rows
    
    def get_reports_by_type(self, type: str, limit : int = 100):
        
        self.cur.execute(f"""
            SELECT {self.report_column_format} FROM reports WHERE status = '{type}' limit {limit}
        """)

        rows = self.cur.fetchall()

        return rows

    def get_reports_nearby(self, lng: float, lat: float, radius_m: int):

        self.cur.execute(f"""SELECT {self.report_column_format}
            FROM reports
            WHERE ST_DWithin(
                location::geography,
                ST_SetSRID(ST_MakePoint({lng}, {lat}), 4326)::geography,
                {radius_m}
            );
        """)

        rows = self.cur.fetchall()

        return rows

    def update_existing_report(self, id: int, status: str):
        self.cur.execute(f"""
        UPDATE reports
        SET status = %s
        WHERE id = %s;   
        """, (status, id))

        self._commit
        return True

    # Incidents ---------------------------------------------
    def get_incidents(self):
        
        self.cur.execute(f"""SELECT {self.incident_column_format} FROM incident;""")
        rows = self.cur.fetchall()

        return rows

    def get_incident_near(self, lng: float, lat:float, type: str, radius_m: int = 10):

        self.cur.execute(f"""
            SELECT {self.incident_column_format}, ST_Distance(centroid::geography, ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography) AS distance FROM incident
            WHERE type = %s AND ST_DWithin(
                centroid::geography,
                ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                %s
            )
            ORDER BY distance ASC;
        """, (lng, lat, type, lng, lat, radius_m))

        rows = self.cur.fetchall()
        
        return rows
    
    def create_incident(self, lng : float, lat : float, type: str):
        self.cur.execute(f"""
        INSERT INTO incident (type, centroid, public_attention_score)
        VALUES (%s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s);
        """, (type, lng, lat, 1.0))

        self._commit()

        return True

    def update_existing_incident(self, incident_id: int, new_pas: float):

        self.cur.execute("""
        UPDATE incident 
        SET public_attention_score = %s, no_of_reports = no_of_reports + 1
        WHERE id = %s;
        """, (new_pas, incident_id))

        self._commit()

        return True
    


    # Commit ---------------------------------------------
    def _commit(self):
        self._conn.commit()
