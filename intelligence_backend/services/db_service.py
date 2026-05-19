from intelligence_backend.modules.db import DBManager

db_man = DBManager()

def get_unclustered_reports(limit : int = 100):
    '''Get the 100 reports with type = "pending"'''
    reports = db_man.get_reports_by_type("pending")

    return reports

def get_all_reports():
    return db_man.get_reports()

def get_reports_within_radius_of(radius_m: int, lng: float, lat: float):
    return db_man.get_reports_nearby(lng, lat, radius_m)

def get_nearest_incident(lng: float, lat:float, type: str, radius_m: int = 25):
    return db_man.get_incident_near(lng, lat, type, radius_m)

def create_new_incident(lng: float, lat: float, type: str):
    return db_man.create_incident(lng, lat, type)

def update_existing_incident(id: int, new_pas: float):
    return db_man.update_existing_incident(id, new_pas)

def update_existing_report(id: int, status: str):
    return db_man.update_existing_report(id, status)

def get_all_incidents():
    return db_man.get_incidents()