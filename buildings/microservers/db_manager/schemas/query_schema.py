from pydantic import BaseModel
from typing import Optional, Any, Dict

class QueryRequest(BaseModel):
    action: str  # "find", "insert", "create_table"
    table: str
    filters: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None
    columns: Optional[Dict[str, str]] = None  # New field for table creation