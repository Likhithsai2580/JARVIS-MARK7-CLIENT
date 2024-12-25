# JARVIS Theme Service

A FastAPI-based service for managing JARVIS UI themes using Figma designs.

## Features

- Extract UI components and styles from Figma designs
- Process and optimize theme assets
- Apply themes to the JARVIS UI
- Reset to default theme
- Theme history management

## Prerequisites

- Python 3.8+
- Figma API access token
- Virtual environment (recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jarvis-theme-service
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
- Copy `.env.example` to `.env`
- Add your Figma API key to `.env`:
```
FIGMA_API_KEY=your_figma_api_key_here
```

## Running the Service

1. Start the FastAPI server:
```bash
uvicorn app.main:app --reload
```

2. Access the API documentation:
- OpenAPI UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `GET /`: Service information
- `GET /health`: Health check
- `GET /api/themes`: List all themes
- `GET /api/themes/current`: Get current theme
- `POST /api/themes`: Create new theme from Figma URL
- `PUT /api/themes/{theme_id}`: Update theme
- `DELETE /api/themes/{theme_id}`: Delete theme
- `POST /api/themes/apply/{theme_id}`: Apply theme
- `POST /api/themes/reset`: Reset to default theme

## Development

1. Run tests:
```bash
pytest
```

2. Format code:
```bash
black .
```

3. Check types:
```bash
mypy .
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
