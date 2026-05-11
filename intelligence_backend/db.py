import os
import psycopg2
from dotenv import load_dotenv

class DBManager:
    def __init__(self) -> None:

        print("[INFO] Loading .env file")        
        load_dotenv()

        self._conn = psycopg2.connect(
            os.getenv("DATABASE_URL")
        )
        self.cur = self._conn.cursor()

    def get_reports(self, limit : int | None = None) -> list:

        if limit is None:
            self.cur.execute("""
                SELECT *
                FROM reports
            """)
        else:
            self.cur.execute(f"""
                SELECT *
                FROM reports limit {limit}
            """)


        rows = self.cur.fetchall()
        return rows
    
    # def _commit(self):
    #     self._conn.commit()
