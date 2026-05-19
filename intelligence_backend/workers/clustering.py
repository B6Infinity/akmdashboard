'''
This script runs every `INTERVAL_SECONDS` seconds. It fetches the recent `REPORTS_LIMIT`(100) reports, clusters them and updates the DB. 
'''
from time import sleep
import os
import requests
from collections import deque

# Tunable parameters

INCIDENT_PAS_K = 0.7 # Higher the value, faster the score will increase
INCIDENT_PAS_M = 0.5 # Increase this if user base increases (no. of reports per unit time increases)

class IncidentClusteringWorker:
    RUN_FLAG = "intelligence_backend/workers/run.flag" # Run the worker till this file exists
    REPORTS_LIMIT = 100
    LOG = True
    INTERVAL_SECONDS = 5

    def __init__(self) -> None:
        self.reports_queue : deque = deque([])

    def get_reports_to_cluster(self):
        res = requests.get("http://localhost:4001/db/reports_to_cluster")
        self.reports_queue = deque(res.json()["data"])

        if self.LOG: print("[LOG] Reports to cluster: ",len(self.reports_queue))

    def get_reports_nearby(self, lng, lat, radius_m : int = 25):
        res = requests.post(
            "http://localhost:4001/db/reports_nearby",
            json = {
                "lng": lng,
                "lat": lat,
                "radius_m": radius_m
            }
        )

        return res.json()["data"]

    def set_report_status_analysed(self, report_id : int):
        res = requests.post(
            "http://localhost:4001/db/update_report",
            json = {
                "id": report_id,
                "status": "analysed",
            }
        )

    def get_nearest_incident(self, lng, lat, type, radius_m : int = 10):
        res = requests.post(
            "http://localhost:4001/db/nearby_incident",
            json={
                "lng": lng,
                "lat": lat,
                "type": type,
                "radius_m": radius_m
            }
        )

        return res.json()["data"]

    def create_new_incident(self, lng, lat, type):
        res = requests.post(
            "http://localhost:4001/db/create_incident",
            json={
                "lng": lng,
                "lat": lat,
                "type": type,
            }
        )

        return res.json()["success"]

    def update_incident_public_att_scr(self, incident_id, incident_current_pas : float, incident_no_of_reports : int, incident_location : tuple[float, float], report_location: tuple[float, float]):
        


        updated_centroid_lng = None
        updated_centroid_lat = None

        print(incident_current_pas, incident_no_of_reports)
        
        # Sigmoid Curve "The viral curve"
        delta_PAS = INCIDENT_PAS_K * (incident_current_pas - INCIDENT_PAS_M) * (1 - (incident_current_pas - 1) / 9)

        updated_pas = incident_current_pas + delta_PAS
        


        res = requests.post(
            "http://localhost:4001/db/update_incident",
            json = {
                "id": incident_id,
                "new_pas": updated_pas,
            }
        )



    def loop(self):
        print("[ReportClusteringWorker] Entering Loop...")

        while os.path.exists(self.RUN_FLAG):
            sleep(self.INTERVAL_SECONDS)
            if self.LOG: print("[LOG] Clustering worker heartbeat.")
            
            # Perform Clustering
            self.get_reports_to_cluster()


            for report in self.reports_queue:
                print(report["remarks"])
                
                report_lng = report["lng"]
                report_lat = report["lat"]
                report_type = report["type"]

                nearest_incident = self.get_nearest_incident(report["lng"], report["lat"], report["type"])

                if self.LOG: print("[LOG] Nearest Incident: ", nearest_incident[0])

                if len(nearest_incident) == 0:
                    # Create incident from report
                    self.create_new_incident(report_lng, report_lat, report_type)
                else:
                    # Update incident public attention score and centroid
                    nearest_incident = nearest_incident[0]
                    
                    self.update_incident_public_att_scr(nearest_incident["id"], nearest_incident["public_attention_score"], nearest_incident["no_of_reports"], (nearest_incident["lng"], nearest_incident["lat"]), (report_lng, report_lat))
                
                
                # Set Report Status to "analysed"
                self.set_report_status_analysed(report["id"])

w = IncidentClusteringWorker()
w.loop()