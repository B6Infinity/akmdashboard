from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from intelligence_backend.routes.analysis import router as analysis_router

app = FastAPI()

# 1. Define allowed origins (where your React app is running)
origins = [
    "http://localhost:4000", # Default Express Server port
    "http://127.0.0.1:4000",
    "http://localhost:5173", # Default Admin Panel port
    "http://127.0.0.1:5173",
]

# 2. Add the middleware to the app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows specific origins
    allow_credentials=True,
    allow_methods=["*"],              # Allows all methods, including POST and OPTIONS
    allow_headers=["*"],              # Allows all headers
)

# 3. Include Routers
app.include_router(analysis_router)



@app.get("/")
async def root():
    return {"message": "AKM Analysis Service Running"}