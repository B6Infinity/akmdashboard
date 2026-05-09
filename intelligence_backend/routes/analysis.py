from fastapi import APIRouter
from pydantic import BaseModel
from intelligence_backend.services.gis_service import get_ward_from_gps

router = APIRouter(prefix="/analysis")

class GPSRequest(BaseModel):
    lat: float
    lng: float

@router.post("/getward")
async def get_ward(data: GPSRequest):
    ward = get_ward_from_gps(data.lat, data.lng)

    return {
        "success": True,
        "ward": ward
    }