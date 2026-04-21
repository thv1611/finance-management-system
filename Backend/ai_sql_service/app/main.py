import os

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from .agent_service import FinancialSqlAgentService
from .sql_guard import SqlSafetyError


class AskRequest(BaseModel):
    user_id: int = Field(alias="userId", gt=0)
    question: str = Field(min_length=1, max_length=1000)


class AskResponse(BaseModel):
    question: str
    answer: str
    sql: str | None
    data: list[dict]
    meta: dict | None = None


app = FastAPI(title="Finance AI SQL Service")
service = FinancialSqlAgentService()
shared_secret = os.getenv("AI_SQL_SERVICE_SHARED_SECRET", "").strip()


@app.get("/health")
def healthcheck():
    return {"ok": True}


@app.post("/ask", response_model=AskResponse)
def ask_question(payload: AskRequest, x_ai_sql_secret: str = Header(default="")):
    if not shared_secret or x_ai_sql_secret != shared_secret:
        raise HTTPException(status_code=401, detail="Unauthorized AI SQL service request.")

    try:
        return service.ask(user_id=payload.user_id, question=payload.question)
    except SqlSafetyError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="AI SQL agent could not complete the request safely.",
        ) from error
