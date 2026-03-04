import os
import json
from watchDogs.blueprintDog.blueprints.BaseBlueprint import BaseBlueprint


class FrontendBlueprint(BaseBlueprint):
    def construct(self, name):
        # Create the main directory for the building/character
        path = os.path.join(self.root_dir, name)
        src = os.path.join(path, "src")

        # 1. Create Folder Structure
        folders = ["api", "context", "components", "i18n", "dictionary"]
        for folder in folders:
            os.makedirs(os.path.join(src, folder), exist_ok=True)

        # 2. Generate Core Infrastructure
        self.write_vite_config(path)
        self.write_index_html(path)
        self.write_package_json(path, name)
        self.write_styles(src)
        self.write_docker(path, name)
        self.write_env_files(path)

        # 3. Generate Dictionaries (Localisation)
        self.write_dictionaries(os.path.join(src, "dictionary"))

        # 4. Generate React Logic & Components
        self.write_main_jsx(src)
        self.write_app_jsx(src, name)
        self.write_api_js(os.path.join(src, "api"))
        self.write_logger_js(os.path.join(src, "api"))
        self.write_context_js(os.path.join(src, "context"))
        self.write_i18n(os.path.join(src, "i18n"))
        self.write_navbar_component(os.path.join(src, "components"))
        self.write_farm_display_component(os.path.join(src, "components"))

        print(f"✅ {name} (Frontend) has been built in the Farm with LogDog Integration!")

    def write_env_files(self, path):
        content = "VITE_API_URL=http://localhost:8000\n"
        self.write_file(path, ".env", content)
        self.write_file(path, ".env.example", content)

    def write_dictionaries(self, dict_path):
        # Define the labels for each component
        dicts = {
            "App": {
                "title": {"english": "Gingilla Farm", "hebrew": "חוות ג'ינג'ילה"},
                "subtitle": {"english": "Current Language", "hebrew": "שפה נוכחית"}
            },
            "Navbar": {
                "brand": {"english": "Gingilla", "hebrew": "ג'ינג'ילה"}
            },
            "FarmDisplay": {
                "report_title": {"english": "Farm Status Report", "hebrew": "דו''ח מצב החווה"},
                "loading": {"english": "Loading farm data...", "hebrew": "טוען נתוני חוה..."}
            }
        }

        for comp_name, data in dicts.items():
            comp_dir = os.path.join(dict_path, comp_name)
            os.makedirs(comp_dir, exist_ok=True)
            with open(os.path.join(comp_dir, "labels.json"), 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)

    def write_vite_config(self, path):
        content = "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\nexport default defineConfig({ plugins: [react(), tailwindcss()] })"
        self.write_file(path, "vite.config.ts", content)

    def write_index_html(self, path):
        content = "<!doctype html>\n<html>\n<head><title>Gingilla Farm</title></head>\n<body class='m-0 p-0'>\n  <div id='root'></div>\n  <script type='module' src='/src/main.jsx'></script>\n</body>\n</html>"
        self.write_file(path, "index.html", content)

    def write_package_json(self, path, name):
        pkg = {
            "name": name.lower(),
            "type": "module",
            "scripts": {"dev": "vite", "build": "vite build"},
            "dependencies": {
                "react": "^18.3.1",
                "react-dom": "^18.3.1",
                "axios": "^1.6.0"
            },
            "devDependencies": {
                "tailwindcss": "^4.0.0",
                "@tailwindcss/vite": "^4.0.0",
                "vite": "^5.4.1",
                "@vitejs/plugin-react": "^4.3.1"
            }
        }
        with open(os.path.join(path, "package.json"), 'w') as f:
            json.dump(pkg, f, indent=2)

    def write_styles(self, src):
        self.write_file(src, "style.css", '@import "tailwindcss";')

    def write_main_jsx(self, src):
        content = (
            "import React from 'react'\n"
            "import ReactDOM from 'react-dom/client'\n"
            "import App from './App.jsx'\n"
            "import { AppProvider } from './context/AppContext.jsx'\n"
            "import './style.css'\n\n"
            "ReactDOM.createRoot(document.getElementById('root')).render(\n"
            "  <AppProvider>\n"
            "    <App />\n"
            "  </AppProvider>\n"
            ")"
        )
        self.write_file(src, "main.jsx", content)

    def write_navbar_component(self, path):
        content = (
            "import React, { useContext } from 'react'\n"
            "import { AppContext } from '../context/AppContext.jsx'\n"
            "import dict from '../dictionary/Navbar/labels.json'\n\n"
            "export default function Navbar() {\n"
            "  const { lang, setLang } = useContext(AppContext);\n"
            "  const t = (key) => dict[key][lang === 'en' ? 'english' : 'hebrew'];\n\n"
            "  return (\n"
            "    <nav className='fixed top-0 left-0 right-0 h-16 bg-amber-800 text-white flex items-center justify-between px-6 shadow-md z-50'>\n"
            "      <div className='font-bold text-xl'>🦊 {t('brand')}</div>\n"
            "      <div className='flex gap-4'>\n"
            "        <button onClick={() => setLang('en')} className={`cursor-pointer px-2 ${lang === 'en' ? 'underline font-bold text-amber-200' : ''}`}>EN</button>\n"
            "        <button onClick={() => setLang('he')} className={`cursor-pointer px-2 ${lang === 'he' ? 'underline font-bold text-amber-200' : ''}`}>עב</button>\n"
            "      </div>\n"
            "    </nav>\n"
            "  );\n"
            "}"
        )
        self.write_file(path, "Navbar.jsx", content)

    def write_app_jsx(self, src, name):
        content = (
            "import React, { useContext } from 'react'\n"
            "import { AppContext } from './context/AppContext.jsx'\n"
            "import Navbar from './components/Navbar.jsx'\n"
            "import FarmDisplay from './components/FarmDisplay.jsx'\n"
            "import dict from './dictionary/App/labels.json'\n\n"
            f"export default function App() {{\n"
            "  const { lang, dir } = useContext(AppContext);\n"
            "  const t = (key) => dict[key][lang === 'en' ? 'english' : 'hebrew'];\n\n"
            "  return (\n"
            "    <div dir={dir} className='min-h-screen bg-stone-50 text-stone-900 pt-24 px-8'>\n"
            "      <Navbar />\n"
            "      <header className='mb-8 border-b border-stone-200 pb-4'>\n"
            "        <h1 className='text-4xl font-bold italic text-amber-900'>🌾 {t('title')}</h1>\n"
            "        <p className='opacity-60 uppercase text-xs tracking-widest mt-2'>{t('subtitle')}: {lang}</p>\n"
            "      </header>\n"
            "      <main>\n"
            "        <FarmDisplay />\n"
            "      </main>\n"
            "    </div>\n"
            "  )\n"
            "}"
        )
        self.write_file(src, "App.jsx", content)

    def write_farm_display_component(self, path):
        content = (
            "import React, { useContext } from 'react'\n"
            "import { AppContext } from '../context/AppContext.jsx'\n"
            "import dict from '../dictionary/FarmDisplay/labels.json'\n\n"
            "export default function FarmDisplay() {\n"
            "  const { apiData, lang } = useContext(AppContext);\n"
            "  const t = (key) => dict[key][lang === 'en' ? 'english' : 'hebrew'];\n\n"
            "  return (\n"
            "    <div className='p-6 bg-white border border-stone-200 rounded-lg shadow-sm max-w-2xl'>\n"
            "      <h2 className='font-bold text-xl mb-4 text-stone-700'>{t('report_title')}</h2>\n"
            "      <div className='bg-stone-900 text-amber-400 p-4 rounded-md font-mono text-sm overflow-auto max-h-64'>\n"
            "        {apiData ? (\n"
            "          <pre>{JSON.stringify(apiData, null, 2)}</pre>\n"
            "        ) : (\n"
            "          <span className='animate-pulse'>{t('loading')}</span>\n"
            "        )}\n"
            "      </div>\n"
            "    </div>\n"
            "  );\n"
            "}"
        )
        self.write_file(path, "FarmDisplay.jsx", content)

    def write_api_js(self, path):
        content = (
            "import axios from 'axios';\n"
            "import logger from './logger';\n\n"
            "const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';\n"
            "const api = axios.create({ baseURL: BASE_URL });\n\n"
            "export const fetchData = async () => {\n"
            "  logger.info('Connecting to the farm API...');\n"
            "  try {\n"
            "    const response = await api.get('/api/status');\n"
            "    logger.success('Farm data synchronized.');\n"
            "    return response.data;\n"
            "  } catch (error) {\n"
            "    logger.error('Connection failed: ' + error.message);\n"
            "    return { status: 'offline', msg: 'mud' };\n"
            "  }\n"
            "};"
        )
        self.write_file(path, "api.js", content)

    def write_logger_js(self, path):
        content = (
            "// Gingilla Farm Logger Proxy\n"
            "// This version prevents Vite from crashing if the file is missing\n\n"
            "let logger = {\n"
            "  info: (m) => console.log(`[Farm-Default] INFO: ${m}`),\n"
            "  success: (m) => console.log(`[Farm-Default] SUCCESS: ${m}`),\n"
            "  error: (m) => console.error(`[Farm-Default] ERROR: ${m}`),\n"
            "  warn: (m) => console.warn(`[Farm-Default] WARN: ${m}`)\n"
            "};\n\n"
            "const initLogger = async () => {\n"
            "  try {\n"
            "    // We use a template string to prevent Vite from statically analyzing the path\n"
            "    const path = '../../utils/logDog/javaScript/logDog.js';\n"
            "    const LogDog = await import(/* @vite-ignore */ path);\n"
            "    if (LogDog.default) {\n"
            "      const farmLogger = new LogDog.default('GingillaUI');\n"
            "      // Update the logger object with the real Farm Dog methods\n"
            "      Object.assign(logger, farmLogger);\n"
            "      logger.info('Successfully connected to LogDog!');\n"
            "    }\n"
            "  } catch (e) {\n"
            "    console.warn('LogDog not found. Staying with default farm logger.');\n"
            "  }\n"
            "};\n\n"
            "initLogger();\n"
            "export default logger;"
        )
        self.write_file(path, "logger.js", content)

    def write_context_js(self, path):
        content = (
            "import React, { createContext, useState, useEffect } from 'react';\n"
            "import { fetchData } from '../api/api';\n"
            "import { languages } from '../i18n/config';\n\n"
            "export const AppContext = createContext();\n\n"
            "export const AppProvider = ({ children }) => {\n"
            "  const [lang, setLang] = useState('en');\n"
            "  const [apiData, setApiData] = useState(null);\n\n"
            "  useEffect(() => {\n"
            "    fetchData().then(data => setApiData(data));\n"
            "  }, []);\n\n"
            "  const dir = languages[lang] || 'ltr';\n\n"
            "  return (\n"
            "    <AppContext.Provider value={{ lang, setLang, apiData, dir }}>\n"
            "      {children}\n"
            "    </AppContext.Provider>\n"
            "  );\n"
            "};"
        )
        self.write_file(path, "AppContext.jsx", content)

    def write_i18n(self, path):
        self.write_file(path, "config.ts", "export const languages = { en: 'ltr', he: 'rtl' };")

    def write_docker(self, path, name):
        # Added mkdir for utils to prevent import crash
        self.write_file(path, "Dockerfile",
                        "FROM node:20-slim\nWORKDIR /app\nRUN mkdir -p utils\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD [\"npm\", \"run\", \"dev\"]")
