from fastapi import APIRouter
from pydantic import BaseModel
from intelligence_backend.services.gis_service import get_ward_from_gps, get_nearby_reports_from_gps

router = APIRouter(prefix="/analysis")

# POST Data models --------------------------------------
class GPSRequest(BaseModel):
    lng: float
    lat: float

class GPSNearbyRequest(BaseModel):
    lng: float
    lat: float
    radius_m: int

# Routes --------------------------------------
@router.post("/getward")
async def get_ward(data: GPSRequest):
    ward = get_ward_from_gps(data.lng, data.lat)
    return {
        "success": True,
        "ward": ward
    }

@router.post("/nearbyreports")
async def get_nearby_reports(data: GPSNearbyRequest):
    reports = get_nearby_reports_from_gps(data.lng, data.lat, data.radius_m)

    return {
        "reports": reports
    }