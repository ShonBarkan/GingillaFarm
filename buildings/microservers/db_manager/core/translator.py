from sqlalchemy import text
from typing import Dict, Any

class SQLTranslator:
    @staticmethod
    def build_select(table: str, filters: Dict[str, Any] = None):
        query = f"SELECT * FROM {table}"
        params = {}
        if filters:
            conditions = []
            for key, value in filters.items():
                conditions.append(f"{key} = :{key}")
                params[key] = value
            query += " WHERE " + " AND ".join(conditions)
        return text(query), params

    @staticmethod
    def build_insert(table: str, data: Dict[str, Any]):
        columns = ", ".join(data.keys())
        placeholders = ", ".join([f":{key}" for key in data.keys()])
        query = f"INSERT INTO {table} ({columns}) VALUES ({placeholders}) RETURNING *"
        return text(query), data

    @staticmethod
    def build_create_table(table: str, columns: Dict[str, str]):
        column_defs = [f"{name} {dtype}" for name, dtype in columns.items()]

        # Only add the default ID if the request didn't provide one
        if "id" not in [c.lower() for c in columns.keys()]:
            query = f"CREATE TABLE IF NOT EXISTS {table} (id SERIAL PRIMARY KEY, {', '.join(column_defs)})"
        else:
            query = f"CREATE TABLE IF NOT EXISTS {table} ({', '.join(column_defs)})"

        return text(query)

    @staticmethod
    def build_update(table: str, data: Dict[str, Any], filters: Dict[str, Any]):
        """
        Builds an UPDATE statement.
        Example data: {"status": "shipped"}, filters: {"id": 5}
        """
        if not filters:
            raise ValueError("Filters are required for updates to prevent farm-wide corruption.")

        # Handle data to update
        update_parts = []
        params = {}
        for key, value in data.items():
            update_parts.append(f"{key} = :upd_{key}")
            params[f"upd_{key}"] = value

        # Handle filters
        filter_parts = []
        for key, value in filters.items():
            filter_parts.append(f"{key} = :filt_{key}")
            params[f"filt_{key}"] = value

        query = f"UPDATE {table} SET {', '.join(update_parts)} WHERE {' AND '.join(filter_parts)} RETURNING *"
        return text(query), params

    @staticmethod
    def build_delete(table: str, filters: Dict[str, Any]):
            """
            Builds a DELETE statement.
            Example filters: {"id": 10}
            """
            if not filters:
                raise ValueError("Filters are required for deletes to prevent clearing the whole Silo.")

            filter_parts = []
            params = {}
            for key, value in filters.items():
                filter_parts.append(f"{key} = :key_{key}")
                params[f"key_{key}"] = value

            query = f"DELETE FROM {table} WHERE {' AND '.join(filter_parts)} RETURNING *"
            return text(query), params