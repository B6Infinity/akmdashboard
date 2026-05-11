import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import requests

# wards_gdf = gpd.read_file("app/data/wards.geojson")


print("[INFO] Fetching Wards geoJSON from node backend")
WARDS_URL = "http://localhost:4000/api/map/wards"
try:
    response = requests.get(WARDS_URL)
    wards_gdf = gpd.GeoDataFrame.from_features(response.json()["data"]["features"])
    wards_gdf.crs = "EPSG:4326"

except:
    print(f"[ERROR] Failed to load geoJSON from node backend. Check if running on port 4000\n[LOG] URL: {WARDS_URL}")
    wards_gdf = None


def get_ward_from_gps(lng, lat):
    if wards_gdf is None:
        return None


    point = Point(lng, lat)
    point_df = gpd.GeoDataFrame(
        {'geometry': [point]}, 
        crs="EPSG:4326"
    )
    # 'predicate=intersects' checks if the point is inside or touching the ward
    result = gpd.sjoin(point_df, wards_gdf, how="left", predicate="intersects")

    # print("Ward:",result["ward_no"], type(result["ward_no"]))
    if pd.isna(result["ward_no"][0]):
        ward_id = None
    else:
        ward_id = int(result["ward_no"][0])

    return ward_id

def get_nearby_reports_from_gps(lng, lat, radius_m):
    return []