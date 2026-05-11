from fastapi import FastAPI
from intelligence_backend.routes.analysis import router as analysis_router

app = FastAPI()
app.include_router(analysis_router)

@app.get("/")
async def root():
    return {"message": "AKM Analysis Service Running"}