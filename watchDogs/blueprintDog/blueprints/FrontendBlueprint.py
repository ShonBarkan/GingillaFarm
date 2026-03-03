import os
import json
from watchDogs.blueprintDog.blueprints.BaseBlueprint import BaseBlueprint

class FrontendBlueprint(BaseBlueprint):
    def construct(self, name):
        path = os.path.join(self.root_dir, name)
        src = os.path.join(path, "src")
        os.makedirs(src, exist_ok=True)
        self.write_vite_config(path)
        self.write_index_html(path)
        self.write_package_json(path, name)
        self.write_styles(src)
        self.write_react_files(src, name)
        self.write_i18n(src)
        self.write_docker(path, name)

    def write_vite_config(self, path):
        content = "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\nexport default defineConfig({ plugins: [react(), tailwindcss()] })"
        self.write_file(path, "vite.config.ts", content)

    def write_index_html(self, path):
        content = "<!doctype html>\n<html>\n<body>\n  <div id='root'></div>\n  <script type='module' src='/src/main.jsx'></script>\n</body>\n</html>"
        self.write_file(path, "index.html", content)

    def write_package_json(self, path, name):
        pkg = {"name": name.lower(), "type": "module", "scripts": {"dev": "vite"},
               "dependencies": {"react": "^18.3.1", "react-dom": "^18.3.1"},
               "devDependencies": {"tailwindcss": "^4.0.0", "@tailwindcss/vite": "^4.0.0", "vite": "^5.4.1",
                                   "@vitejs/plugin-react": "^4.3.1"}}
        with open(os.path.join(path, "package.json"), 'w') as f: json.dump(pkg, f, indent=2)

    def write_styles(self, src):
        self.write_file(src, "style.css", '@import "tailwindcss";')

    def write_react_files(self, src, name):
        main = "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.jsx'\nimport './style.css'\nReactDOM.createRoot(document.getElementById('root')).render(<App />)"
        app = f"import React from 'react'\nexport default function App() {{ return (<h1>🌾 {name}</h1>) }}"
        self.write_file(src, "main.jsx", main)
        self.write_file(src, "App.jsx", app)

    def write_i18n(self, src):
        p = os.path.join(src, "i18n")
        os.makedirs(p, exist_ok=True)
        self.write_file(p, "config.ts", "export const languages = { en: 'ltr', he: 'rtl' };")

    def write_docker(self, path, name):
        self.write_file(path, "Dockerfile",
                        "FROM node:20-slim\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"run\", \"dev\"]")
