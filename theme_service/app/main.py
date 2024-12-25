from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .routes import theme, assets
from .services.theme_service import ThemeService

app = FastAPI(
    title="JARVIS Theme Service",
    description="Theme management service for JARVIS UI",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
theme_service = ThemeService()

# Include routers
app.include_router(theme.router, prefix="/api/theme", tags=["theme"])
app.include_router(assets.router, prefix="/api/assets", tags=["assets"])

@app.get("/")
async def root():
    return {
        "service": "JARVIS Theme Service",
        "status": "operational",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 