from fastapi import APIRouter
from pydantic import BaseModel
from intelligence_backend.services.db_service import get_unclustered_reports, get_all_reports, get_reports_within_radius_of, get_nearest_incident, create_new_incident, update_existing_incident, update_existing_report, get_all_incidents

router = APIRouter(prefix="/db")


# Reports ------------------------------------------------

@router.get("/reports_to_cluster")
async def get_reports_to_cluster():
    
    rows = get_unclustered_reports()

    return {
        "success": True,
        "data": rows
    }


@router.get("/all_reports")
async def all_reports():

    rows = get_all_reports()

    return {
        "success": True,
        "data": rows
    }

class ReportsNearbyRequest(BaseModel):
    lng: float
    lat: float
    radius_m: int

@router.post("/reports_nearby")
async def reports_nearby(data: ReportsNearbyRequest):
    rows = get_reports_within_radius_of(data.radius_m, data.lng, data.lat)

    return {
        "success": True,
        "data": rows
    }

# Incidents ------------------------------------------------------------

@router.get("/all_incidents")
async def all_incidents():
    rows = get_all_incidents()

    return {
        "success": True,
        "data": rows
    }


class IncidentsNearbyRequest(BaseModel):
    lng: float
    lat: float
    type: str
    radius_m : int

@router.post("/nearby_incident")
async def nearby_incident(data: IncidentsNearbyRequest):
    rows = get_nearest_incident(data.lng, data.lat, data.type)
    
    return{
        "success": True,
        "data": rows
    }

class IncidentsCreateRequest(BaseModel):
    lng: float
    lat: float
    type: str

@router.post("/create_incident")
async def create_incident(data: IncidentsCreateRequest):
    success = create_new_incident(data.lng, data.lat, data.type)
    return{
        "success": success
    }


class IncidentUpdateRequest(BaseModel):
    id: int
    new_pas: float

@router.post("/update_incident")
async def update_incident(data: IncidentUpdateRequest):
    success = update_existing_incident(data.id, data.new_pas)
    return{
        "success": success
    }

class ReportUpdateRequest(BaseModel):
    id: int
    status: str

@router.post("/update_report")
async def update_report(data: ReportUpdateRequest):
    success = update_existing_report(data.id, data.status)
    return{
        "success": success
    }