import json
import os
import textwrap
from api_engine import ApiEngine
from watchDogs.logDog.python.logDog import setup_log_dog


class ClientArchitect:
    """
    The Frontend Contractor: Builds the React/Vite application.
    Implements LTR/RTL support, health checks, and indicative UI skeletons.
    Strictly No Hebrew in code or comments.
    """
    FEATURE_DEPS = {
        "router": {"react-router-dom": "^6.18.0"},
        "toast_notifications": {"react-toastify": "^9.1.3"},
        "i18n": {"i18next": "^23.7.6", "react-i18next": "^13.5.0"},
    }

    STYLING_DEPS = {
        "tailwind": {
            "tailwindcss": "^3.3.5",
            "autoprefixer": "^10.4.16",
            "postcss": "^8.4.31"
        }
    }

    def __init__(self, config, building_path, trace_id):
        self.config = config
        self.building_path = os.path.join(building_path, "frontend")
        self.engine = ApiEngine(config)
        self.tables = config.get("database", {}).get("tables", [])
        self.frontend_cfg = config.get("frontend", {})
        self.features = self.frontend_cfg.get("features", {})
        self.log_dog = setup_log_dog(self.config["building_name"] + "_front", log_type="default")
        self.trace_id = trace_id

    def build_all(self):
        """Orchestrates the creation of all frontend files."""
        self.log_dog.info("Starting frontend assembly line...", extra={'context': 'build_all', 'traceID': self.trace_id})
        self._create_folders()
        self._write_base_configs()
        self._write_context()
        # self._write_api_services()
        # self._write_layout_components()
        # self._write_entry_points()
        self.log_dog.info("Ending frontend assembly line", extra={'context': 'build_all', 'traceID': self.trace_id})

    def _create_folders(self):
        """Creates the Vite/React directory tree."""
        self.log_dog.info("Starting create default folders", extra={'context': '_create_folders'})
        folders = ["src", "src/api", "src/components", "src/context", "src/pages", "src/styles"]
        for folder in folders:
            os.makedirs(os.path.join(self.building_path, folder), exist_ok=True)
        self.log_dog.info("Ending create default folders", extra={'context': '_create_folders'})

    def _write_base_configs(self):
        """Writes a dynamic package.json based on enabled features."""
        self.log_dog.info("Starting write_base_configs", extra={'context': '_write_base_configs', 'traceID': self.trace_id})
        # 1. Start with core essentials
        deps = {
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "axios": "^1.6.0",
            "lucide-react": "^0.294.0"
        }

        # 2. Map features to dependencies (The "Enum" Logic)
        for feature_name, is_enabled in self.features.items():
            if is_enabled and feature_name in self.FEATURE_DEPS:
                deps.update(self.FEATURE_DEPS[feature_name])

        # 3. Handle Dev Dependencies (Styling)
        dev_deps = {
            "@vitejs/plugin-react": "^4.1.1",
            "vite": "^4.5.0"
        }

        style_type = self.frontend_cfg.get("styling")
        if style_type in self.STYLING_DEPS:
            dev_deps.update(self.STYLING_DEPS[style_type])

        # 4. Final Construction
        package_json = {
            "name": f"{self.config['building_name'].lower()}-client",
            "private": True,
            "version": "0.1.0",
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": deps,
            "devDependencies": dev_deps
        }

        # Save to file
        os.makedirs(self.building_path, exist_ok=True)
        with open(os.path.join(self.building_path, "package.json"), 'w', encoding='utf-8') as f:
            json.dump(package_json, f, indent=2)
        self.log_dog.info(f"📦 package.json generated with {len(deps)} dependencies.",
                      extra={'context': '_write_base_configs', 'traceID': self.trace_id})

    def _write_context(self):
        """Generates the AppContext with dynamic imports and health monitoring."""
        self.log_dog.info("Generating AppContext (The Farm's Nervous System)...",
                          extra={'context': '_write_context', 'traceID': self.trace_id})

        logic = self.engine.generate_context_logic()

        # 1. Prepare Imports
        service_imports = "\n".join(
            [f"import {{ {t['name']}Service }} from '../api/{t['name']}Service';" for t in self.tables])

        # 2. Cleanup value duplicates and merge with core farm values
        provided_values = [v.strip() for v in logic['values'].split(',') if v.strip()]
        core_values = ["lang", "setLang", "dir", "setDir", "serverStatus", "syncFarmData"]
        unique_values = ", ".join(list(dict.fromkeys(provided_values + core_values)))

        # 3. Construction using a joined list to force zero-indentation at the root
        content_lines = [
            "import React, { createContext, useState, useEffect } from 'react';",
            f"{service_imports}",
            "",
            "export const AppContext = createContext();",
            "",
            "export const AppProvider = ({ children }) => {",
            "    const [lang, setLang] = useState('en');",
            "    const [dir, setDir] = useState('ltr');",
            "    const [serverStatus, setServerStatus] = useState('checking');",
            "",
            f"{textwrap.indent(logic['states'].strip(), '    ')}",
            "",
            "    useEffect(() => {",
            "        const newDir = lang === 'he' ? 'rtl' : 'ltr';",
            "        setDir(newDir);",
            "        document.documentElement.dir = newDir;",
            "        document.documentElement.lang = lang;",
            "    }, [lang]);",
            "",
            "    const syncFarmData = async () => {",
            "        try {",
            f"{textwrap.indent(logic['effects'].strip(), '            ')}",
            "            setServerStatus('online');",
            "        } catch (err) {",
            "            console.error(\"Farm Sync Error:\", err);",
            "            setServerStatus('offline');",
            "        }",
            "    };",
            "",
            "    useEffect(() => {",
            "        syncFarmData();",
            "    }, []);",
            "",
            "    return (",
            f"        <AppContext.Provider value={{{{ {unique_values} }}}}>",
            "            {children}",
            "        </AppContext.Provider>",
            "    );",
            "};"
        ]

        context_content = "\n".join(content_lines)

        # Save to file
        os.makedirs(os.path.join(self.building_path, "src/context"), exist_ok=True)
        with open(os.path.join(self.building_path, "src/context/AppContext.jsx"), 'w', encoding='utf-8') as f:
            f.write(context_content)

        self.log_dog.info("Successfully wired the AppContext with clean indentation.",
                          extra={'context': '_write_context', 'traceID': self.trace_id})

    def _write_api_services(self):
        """Generates base axios config and table services."""
        axios_base = textwrap.dedent("""\
            import axios from 'axios';
            const api = axios.create({
                baseURL: '/api/v1',
                timeout: 5000
            });
            export default api;
        """)
        with open(os.path.join(self.building_path, "src/api/axiosConfig.js"), 'w') as f:
            f.write(axios_base)

        for table in self.tables:
            code = self.engine.generate_axios_service(table)
            with open(os.path.join(self.building_path, f"src/api/{table['name']}Service.js"), 'w') as f:
                f.write(code)

    def _write_layout_components(self):
        """Writes Layout component with LTR/RTL support and Navbar."""
        layout = textwrap.dedent(f"""\
            import React, {{ useContext }} from 'react';
            import {{ AppContext }} from '../context/AppContext';

            const Layout = ({{ children }}) => {{
                const {{ dir, lang, setLang, serverStatus }} = useContext(AppContext);

                return (
                    <div className={{`min-h-screen bg-gray-50 ${{dir === 'rtl' ? 'text-right' : 'text-left'}}`}}>
                        <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-bold text-orange-600">🥕 Gingilla Farm</h1>
                                <span className="text-gray-400">|</span>
                                <span className="text-sm font-medium text-gray-600 uppercase tracking-widest">
                                    {self.config['building_name']}
                                </span>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={{`w-2 h-2 rounded-full ${{
                                        serverStatus === 'online' ? 'bg-green-500 animate-pulse' : 
                                        serverStatus === 'offline' ? 'bg-red-500' : 'bg-gray-300'
                                    }}`}}></div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        {{serverStatus}}
                                    </span>
                                </div>
                                <button 
                                    onClick={{() => setLang(lang === 'en' ? 'he' : 'en')}}
                                    className="text-sm font-bold hover:text-orange-600 transition-colors uppercase"
                                >
                                    {{lang === 'en' ? 'עברית' : 'English'}}
                                </button>
                            </div>
                        </nav>

                        <main className="max-w-7xl mx-auto p-8">
                            {{children}}
                        </main>

                        <footer className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">
                            Gingilla Farm &copy; 2026 - Small Paws, Big Stack
                        </footer>
                    </div>
                );
            }};
            export default Layout;
        """)
        with open(os.path.join(self.building_path, "src/components/Layout.jsx"), 'w', encoding='utf-8') as f:
            f.write(layout)

    def _write_entry_points(self):
        """Writes the index.html, App.jsx and core styles with correct escaping."""

        # 1. index.html (No React braces, safe for f-string)
        index_html = textwrap.dedent(f"""\
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{self.config['building_name']} | Gingilla Farm</title>
              </head>
              <body class="bg-gray-50">
                <div id="root"></div>
                <script type="module" src="/src/main.jsx"></script>
              </body>
            </html>
        """)
        with open(os.path.join(self.building_path, "index.html"), 'w', encoding='utf-8') as f:
            f.write(index_html)

        # 2. src/main.jsx (Regular string - no escaping needed)
        main_jsx = textwrap.dedent("""\
            import React from 'react'
            import ReactDOM from 'react-dom/client'
            import App from './App.jsx'
            import './index.css'
            import { AppProvider } from './context/AppContext'

            ReactDOM.createRoot(document.getElementById('root')).render(
              <React.StrictMode>
                <AppProvider>
                  <App />
                </AppProvider>
              </React.StrictMode>,
            )
        """)
        with open(os.path.join(self.building_path, "src/main.jsx"), 'w', encoding='utf-8') as f:
            f.write(main_jsx)

        # 3. src/App.jsx (Double braces for EVERYTHING except Python variables)
        app_jsx = textwrap.dedent(f"""\
            import React, {{ useContext, useEffect }} from 'react'
            import Layout from './components/Layout'
            import {{ AppContext }} from './context/AppContext'
            import {{ ToastContainer, toast }} from 'react-toastify'
            import 'react-toastify/dist/ReactToastify.css'

            function App() {{
              const {{ serverStatus, lang }} = useContext(AppContext);

              useEffect(() => {{
                if (serverStatus === 'offline') {{
                  toast.error(lang === 'en' ? "Server Unreachable" : "השרת אינו זמין", {{
                    position: "bottom-right",
                    autoClose: false
                  }});
                }}
              }}, [serverStatus]);

              return (
                <Layout>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <h2 className="text-3xl font-black mb-4 text-gray-800 uppercase tracking-tighter">
                        Building Status
                      </h2>
                      <p className="text-gray-500 leading-relaxed mb-6">
                        {self.config.get('narrative', 'System operational.')}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-bold">
                        <span>🦊</span>
                        <span>Ginger Chinchilla Guarding: ACTIVE</span>
                      </div>
                    </div>

                    <div className="p-8 bg-gray-900 rounded-2xl shadow-xl text-white">
                      <h3 className="text-xl font-bold mb-4 text-orange-400">System Logs</h3>
                      <div className="font-mono text-sm space-y-2 opacity-80">
                        <p>> Initializing {self.config['building_name']}...</p>
                        <p>> Checking infrastructure sync...</p>
                        <p className={{serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}}>
                            > Backend connection: {{serverStatus.toUpperCase()}}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ToastContainer theme="colored" />
                </Layout>
              )
            }}
            export default App
        """)
        with open(os.path.join(self.building_path, "src/App.jsx"), 'w', encoding='utf-8') as f:
            f.write(app_jsx)

        # 4. src/index.css
        index_css = textwrap.dedent("""\
            @tailwind base;
            @tailwind components;
            @tailwind utilities;

            body {
                @apply antialiased bg-gray-50;
            }

            [dir='rtl'] {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
        """)
        with open(os.path.join(self.building_path, "src/index.css"), 'w', encoding='utf-8') as f:
            f.write(index_css)
