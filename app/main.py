import traceback
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routers import themes
from .services.theme_service import ThemeService

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JARVIS Theme Service",
    description="Service for managing JARVIS UI themes",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize theme service
try:
    theme_service = ThemeService()
    logger.info("Theme service initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize theme service: {str(e)}")
    logger.error(traceback.format_exc())
    raise

# Include routers
app.include_router(themes.router, prefix="/api/themes", tags=["themes"])

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )

@app.get("/")
async def root():
    return {
        "message": "Welcome to JARVIS Theme Service",
        "version": "1.0.0",
        "status": "operational"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "theme_service",
        "version": "1.0.0"
    } 