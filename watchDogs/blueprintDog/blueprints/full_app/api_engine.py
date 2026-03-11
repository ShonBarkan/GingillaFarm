import textwrap


class ApiEngine:
    """
    The Brain of the Blueprint: Translates DB tables into API code logic.
    Provides snippets for Backend (FastAPI) and Frontend (React).
    Strictly No Hebrew in code or comments.
    """

    def __init__(self, config):
        self.config = config
        self.tables = config.get("database", {}).get("tables", [])

    # --- SERVER UTILS ---

    def generate_db_client(self):
        """Generates the utility to communicate with the Silo (DB Manager)."""
        db_url = self.config['infrastructure'].get('db_manager_url', 'http://db-manager:8000')
        return textwrap.dedent(f"""
            import httpx
            import os

            class DBManagerClient:
                def __init__(self):
                    self.base_url = os.getenv("DB_MANAGER_URL", "{db_url}")

                async def send_query(self, query: dict):
                    async with httpx.AsyncClient() as client:
                        try:
                            # Forward query to the central Silo
                            response = await client.post(f"{{self.base_url}}/query", json=query)
                            response.raise_for_status()
                            return response.json()
                        except Exception as e:
                            print(f"Silo Connection Error: {{str(e)}}")
                            raise e

            db_manager = DBManagerClient()
        """)

    # --- BACKEND MODELS & ROUTES ---

    def generate_pydantic_models(self, table):
        """Generates Pydantic models for a specific table."""
        class_name = table['name'].capitalize()
        fields = ""
        for col in table['columns']:
            py_type = self._map_type_to_python(col['type'])
            if col.get('required') and not col.get('auto_increment'):
                fields += f"    {col['name']}: {py_type}\n"
            else:
                fields += f"    {col['name']}: {py_type} = None\n"

        return textwrap.dedent(f"""
            class {class_name}(BaseModel):
            {fields}
        """)

    def generate_fastapi_routes(self, table):
        """Generates CRUD routes that communicate with the Silo."""
        t_name = table['name']
        class_name = t_name.capitalize()
        def_limit = self.config.get("server", {}).get("pagination", {}).get("default_limit", 50)

        return textwrap.dedent(f"""
            @router.get("/{t_name}")
            async def get_{t_name}(limit: int = {def_limit}, offset: int = 0):
                query = {{
                    "action": "find",
                    "table": "{t_name}",
                    "filters": {{}},
                    "limit": limit,
                    "offset": offset
                }}
                return await db_manager.send_query(query)

            @router.post("/{t_name}")
            async def create_{t_name}(data: {class_name}):
                query = {{
                    "action": "insert",
                    "table": "{t_name}",
                    "data": data.dict()
                }}
                return await db_manager.send_query(query)

            @router.delete("/{t_name}/{{item_id}}")
            async def delete_{t_name}(item_id: int):
                query = {{
                    "action": "delete",
                    "table": "{t_name}",
                    "filters": {{"{table.get('primary_key', 'id')}": item_id}}
                }}
                return await db_manager.send_query(query)
        """)

    # --- FRONTEND SERVICES & CONTEXT ---

    def generate_axios_service(self, table):
        """Generates Axios CRUD service with Toast notifications."""
        t_name = table['name']
        return textwrap.dedent(f"""
            import api from './axiosConfig';
            import {{ toast }} from 'react-toastify';

            export const {t_name}Service = {{
                getAll: async (params) => {{
                    try {{
                        const res = await api.get('/{t_name}', {{ params }});
                        return res.data;
                    }} catch (err) {{
                        toast.error("Failed to fetch {t_name}");
                        throw err;
                    }}
                }},
                create: async (data) => {{
                    try {{
                        const res = await api.post('/{t_name}', data);
                        toast.success("{t_name.capitalize()} created successfully!");
                        return res.data;
                    }} catch (err) {{
                        toast.error("Failed to create {t_name}");
                        throw err;
                    }}
                }},
                remove: async (id) => {{
                    try {{
                        await api.delete(`/{t_name}/${{id}}`);
                        toast.warn("{t_name.capitalize()} removed.");
                    }} catch (err) {{
                        toast.error("Delete failed");
                    }}
                }}
            }};
        """)

    def generate_context_logic(self):
        """Generates multiple useState and useEffect hooks for the AppContext."""
        states = []
        effects = []
        values = ["lang", "setLang", "dir", "setDir"]

        for table in self.tables:
            t_name = table['name']
            cap_name = t_name.capitalize()
            states.append(f"    const [{t_name}, set{cap_name}] = useState([]);")
            values.append(t_name)
            values.append(f"set{cap_name}")

            effects.append(textwrap.dedent(f"""
                {t_name}Service.getAll().then(res => {{
                    if (res && res.data) set{cap_name}(res.data);
                }}).catch(err => console.error("Error fetching {t_name}", err));"""))

        return {
            "states": "\n".join(states),
            "effects": "\n".join(effects),
            "values": ", ".join(values)
        }

    # --- HELPERS ---

    def _map_type_to_python(self, json_type):
        mapping = {
            "int": "int",
            "string": "str",
            "float": "float",
            "boolean": "bool",
            "json": "dict",
            "date": "str"
        }
        return mapping.get(json_type, "Any")