from pydantic import BaseModel
from typing import Optional, Any


        class Carrots(BaseModel):
            id: int = None
variety: str
weight: float = None
metadata: dict = None
is_ripe: bool = None


