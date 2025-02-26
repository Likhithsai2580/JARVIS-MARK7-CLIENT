"""Main React app generator module."""

import os
import json
from pathlib import Path
from typing import Dict, List, Any

from .templates.app_template import generate_app_template
from .styles.cyberpunk import generate_cyberpunk_styles
from .utils.file_utils import create_directory, write_file

class ReactGenerator:
    def __init__(self, output_path: str):
        self.output_path = output_path
        self.app_path = os.path.join(output_path, 'ReactApp')
    
    def create_directory_structure(self):
        """Create the React app directory structure."""
        directories = [
            'src',
            'src/components',
            'src/styles',
            'src/assets',
            'public'
        ]
        
        for directory in directories:
            create_directory(os.path.join(self.app_path, directory))
    
    def create_index_html(self):
        """Create the index.html file."""
        content = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated by Figma to React Converter" />
    <title>JARVIS Interface</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div class="cyber-grid"></div>
    <div class="particles"></div>
    <div class="cursor"></div>
    <div id="root"></div>
    <div class="scan-line"></div>
  </body>
</html>"""
        write_file(os.path.join(self.app_path, 'public', 'index.html'), content)
    
    def create_package_json(self):
        """Create package.json with required dependencies."""
        content = {
            "name": "jarvis-interface",
            "version": "0.1.0",
            "private": True,
            "dependencies": {
                "react": "^18.2.0",
                "react-dom": "^18.2.0",
                "styled-components": "^6.0.7",
                "framer-motion": "^10.16.1",
                "@mui/material": "^5.14.5",
                "@emotion/react": "^11.11.1",
                "@emotion/styled": "^11.11.0"
            },
            "scripts": {
                "start": "vite",
                "build": "tsc && vite build",
                "serve": "vite preview",
                "lint": "eslint src --ext ts,tsx",
                "format": "prettier --write 'src/**/*.{ts,tsx}'",
                "test": "vitest"
            },
            "devDependencies": {
                "@types/react": "^18.2.21",
                "@types/react-dom": "^18.2.7",
                "@types/styled-components": "^5.1.26",
                "@typescript-eslint/eslint-plugin": "^6.5.0",
                "@typescript-eslint/parser": "^6.5.0",
                "@vitejs/plugin-react": "^4.0.4",
                "eslint": "^8.48.0",
                "prettier": "^3.0.3",
                "typescript": "^5.2.2",
                "vite": "^4.4.9",
                "vitest": "^0.34.3"
            }
        }
        write_file(os.path.join(self.app_path, 'package.json'), json.dumps(content, indent=2))
    
    def create_app_component(self):
        """Create the main App component."""
        content = generate_app_template()
        write_file(os.path.join(self.app_path, 'src', 'App.tsx'), content)
    
    def create_styles(self):
        """Create cyberpunk styles."""
        content = generate_cyberpunk_styles()
        write_file(os.path.join(self.app_path, 'src', 'styles', 'cyberpunk.css'), content)
    
    def create_vite_config(self):
        """Create Vite configuration."""
        content = """import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  }
});"""
        write_file(os.path.join(self.app_path, 'vite.config.ts'), content)
    
    def create_tsconfig(self):
        """Create TypeScript configuration."""
        content = {
            "compilerOptions": {
                "target": "ES2020",
                "useDefineForClassFields": True,
                "lib": ["ES2020", "DOM", "DOM.Iterable"],
                "module": "ESNext",
                "skipLibCheck": True,
                "moduleResolution": "bundler",
                "allowImportingTsExtensions": True,
                "resolveJsonModule": True,
                "isolatedModules": True,
                "noEmit": True,
                "jsx": "react-jsx",
                "strict": True,
                "noUnusedLocals": True,
                "noUnusedParameters": True,
                "noFallthroughCasesInSwitch": True
            },
            "include": ["src"],
            "references": [{ "path": "./tsconfig.node.json" }]
        }
        write_file(os.path.join(self.app_path, 'tsconfig.json'), json.dumps(content, indent=2))
    
    def generate(self, figma_data: List[Dict[str, Any]] = None) -> bool:
        """Generate the complete React application."""
        try:
            self.create_directory_structure()
            self.create_index_html()
            self.create_package_json()
            self.create_app_component()
            self.create_styles()
            self.create_vite_config()
            self.create_tsconfig()
            
            if figma_data:
                # TODO: Process Figma data to generate components
                pass
            
            return True
        except Exception as e:
            print(f"Error generating React app: {str(e)}")
            return False 