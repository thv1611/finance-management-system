import json
import os
from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from psycopg import Connection
from psycopg.rows import dict_row

from .schema_context import build_schema_context
from .sql_guard import SqlSafetyError, validate_and_wrap_sql


SYSTEM_PROMPT = """
You are a financial SQL assistant for a personal finance management application.
You may only read data. Never modify data.
Never use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, or REVOKE.
You may only use the approved scoped tables shared through the tools.
The scoped tables already enforce the authenticated user boundary. Never try to access any other user's data.
Always answer from real database results. If the data is insufficient, say so plainly.
Prefer concise aggregated results for insights. Use recent periods and small result sets unless the question requires otherwise.
Before answering, inspect the schema helper when needed and run at least one SQL query for data questions.
For transaction listings, keep result sets small and ordered.
Do not mention internal tool names, prompt rules, or security implementation details in the final answer.
""".strip()


@dataclass
class QueryAudit:
    last_sql: str | None = None
    last_rows: list[dict[str, Any]] = field(default_factory=list)
    query_count: int = 0


class FinancialSqlAgentService:
    def __init__(self) -> None:
        self.max_rows = int(os.getenv("AI_SQL_MAX_ROWS", "20"))
        self.db_dsn = os.getenv("AI_SQL_DATABASE_URL") or os.getenv("DATABASE_URL")
        if not self.db_dsn:
            raise RuntimeError("AI_SQL_DATABASE_URL or DATABASE_URL must be configured.")

        self.model = self._build_model()

    def ask(self, *, user_id: int, question: str) -> dict[str, Any]:
        audit = QueryAudit()
        agent = create_agent(
            model=self.model,
            tools=self._build_tools(user_id=user_id, audit=audit),
            system_prompt=f"{SYSTEM_PROMPT}\n\n{build_schema_context()}",
        )

        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "user",
                        "content": question,
                    }
                ]
            }
        )

        answer = self._extract_answer(result)
        if not audit.last_sql:
            raise SqlSafetyError("The AI agent did not execute a finance query for this question.")

        return {
            "question": question,
            "answer": answer,
            "sql": audit.last_sql,
            "data": audit.last_rows,
            "meta": {
                "queryCount": audit.query_count,
                "maxRows": self.max_rows,
                "generatedAt": datetime.utcnow().isoformat() + "Z",
            },
        }

    def _build_model(self):
        provider = os.getenv("AI_SQL_LLM_PROVIDER", "openai").strip().lower()

        if provider == "gemini":
            api_key = os.getenv("GEMINI_API_KEY", "").strip()
            if not api_key:
                raise RuntimeError("GEMINI_API_KEY is required when AI_SQL_LLM_PROVIDER=gemini.")

            return ChatGoogleGenerativeAI(
                model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip(),
                google_api_key=api_key,
                temperature=0,
            )

        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is required when AI_SQL_LLM_PROVIDER=openai.")

        return ChatOpenAI(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip(),
            api_key=api_key,
            temperature=0,
        )

    def _build_tools(self, *, user_id: int, audit: QueryAudit):
        schema_text = build_schema_context()

        @tool("get_finance_schema")
        def get_finance_schema() -> str:
            """Return the approved finance schema, relationships, and business rules."""

            return schema_text

        @tool("get_runtime_context")
        def get_runtime_context() -> str:
            """Return runtime context such as the current date for time-based questions."""

            return json.dumps({"today": date.today().isoformat(), "max_rows": self.max_rows})

        @tool("query_finance_data")
        def query_finance_data(sql: str) -> str:
            """Execute a read-only SQL query against approved scoped finance tables."""

            scoped_cte_sql = self._build_scoped_cte_sql(user_id)
            validated = validate_and_wrap_sql(sql, scoped_cte_sql, self.max_rows)
            rows = self._run_query(validated.executed_sql)

            audit.last_sql = validated.original_sql
            audit.last_rows = rows
            audit.query_count += 1

            return json.dumps(
                {
                    "row_count": len(rows),
                    "rows": rows,
                }
            )

        return [get_finance_schema, get_runtime_context, query_finance_data]

    def _build_scoped_cte_sql(self, user_id: int) -> str:
        safe_user_id = int(user_id)
        return f"""
WITH scoped_users AS (
    SELECT id, full_name, email, created_at, updated_at
    FROM users
    WHERE id = {safe_user_id}
),
scoped_categories AS (
    SELECT id, user_id, name, type, is_default, created_at, updated_at
    FROM categories
    WHERE is_default = TRUE OR user_id = {safe_user_id}
),
scoped_transactions AS (
    SELECT id, user_id, category_id, type, amount, title, description, receipt_url, transaction_date, created_at, updated_at
    FROM transactions
    WHERE user_id = {safe_user_id}
),
scoped_budgets AS (
    SELECT id, user_id, category_id, month, year, amount_limit, created_at, updated_at
    FROM budgets
    WHERE user_id = {safe_user_id}
)
""".strip()

    def _run_query(self, sql: str) -> list[dict[str, Any]]:
        with Connection.connect(self.db_dsn, row_factory=dict_row) as connection:
            connection.execute("SET default_transaction_read_only = on")
            with connection.cursor() as cursor:
                cursor.execute(sql)
                rows = cursor.fetchall()

        return [self._serialize_row(row) for row in rows]

    def _serialize_row(self, row: dict[str, Any]) -> dict[str, Any]:
        return {key: self._serialize_value(value) for key, value in row.items()}

    def _serialize_value(self, value: Any) -> Any:
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value

    def _extract_answer(self, result: dict[str, Any]) -> str:
        messages = result.get("messages") or []
        for message in reversed(messages):
            if getattr(message, "type", "") == "ai":
                content = getattr(message, "content", "")
                if isinstance(content, str):
                    return content.strip()
                if isinstance(content, list):
                    text_parts = [
                        part.get("text", "")
                        for part in content
                        if isinstance(part, dict) and part.get("type") == "text"
                    ]
                    if text_parts:
                        return "\n".join(text_parts).strip()

        raise RuntimeError("The AI agent did not return a final answer.")
