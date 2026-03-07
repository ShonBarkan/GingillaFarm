from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .core.database import SessionLocal, engine
from .core.translator import SQLTranslator
from .schemas.query_schema import QueryRequest

app = FastAPI(title="Gingilla Farm - DB Manager")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/query")
@app.post("/query")
async def structured_query(request: QueryRequest, db: Session = Depends(get_db)):
    """The main entry point for other buildings to talk to the Silo."""
    try:
        sql = None
        params = {}

        # 1. Route based on Action
        if request.action == "find":
            sql, params = SQLTranslator.build_select(request.table, request.filters)

        elif request.action == "insert":
            if not request.data:
                raise HTTPException(status_code=400, detail="Insert requires 'data'.")
            sql, params = SQLTranslator.build_insert(request.table, request.data)

        elif request.action == "update":
            if not request.data or not request.filters:
                raise HTTPException(status_code=400, detail="Update requires both 'data' and 'filters'.")
            sql, params = SQLTranslator.build_update(request.table, request.data, request.filters)

        elif request.action == "delete":
            if not request.filters:
                raise HTTPException(status_code=400, detail="Delete requires 'filters'.")
            sql, params = SQLTranslator.build_delete(request.table, request.filters)

        elif request.action == "create_table":
            if not request.columns:
                raise HTTPException(status_code=400, detail="Columns definition required")
            sql = SQLTranslator.build_create_table(request.table, request.columns)
            db.execute(sql)
            db.commit()
            return {"status": "success", "message": f"Table '{request.table}' is ready in the Silo."}

        else:
            raise HTTPException(status_code=400, detail=f"Action '{request.action}' not supported yet.")

        # 2. Execute the constructed SQL
        result = db.execute(sql, params)

        # 3. Handle Transactions (Commit for changes)
        if request.action in ["insert", "update", "delete"]:
            db.commit()

        # 4. Format and Return Output
        # Using row._mapping to convert SQLAlchemy rows to dictionaries
        rows = [dict(row._mapping) for row in result]

        return {
            "status": "success",
            "action": request.action,
            "count": len(rows),
            "data": rows
        }

    except Exception as e:
        db.rollback()
        # Ensure we log the error properly in the future with LogDog
        raise HTTPException(status_code=500, detail=f"Silo Error: {str(e)}")
@app.get("/health")
def check_silo_integrity():
    """Check if the Silo is standing and the DB is connected."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Silo Breach: {str(e)}")

@app.post("/raw")
async def direct_query(query: str, db: Session = Depends(get_db)):
    """ADMIN ONLY: Execute direct SQL string."""
    try:
        result = db.execute(text(query))
        # For SELECT queries, fetch all
        if query.strip().lower().startswith("select"):
            return {"result": [dict(row) for row in result]}
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))