import re
from dataclasses import dataclass

import sqlglot
from sqlglot import exp

from .schema_context import ALLOWED_TABLES


FORBIDDEN_PATTERN = re.compile(
    r"\b(insert|update|delete|drop|alter|truncate|create|grant|revoke|copy|call|execute)\b",
    re.IGNORECASE,
)
COMMENT_PATTERN = re.compile(r"(--|/\*|\*/|#)")


@dataclass
class ValidatedSql:
    original_sql: str
    executed_sql: str


class SqlSafetyError(ValueError):
    pass


def validate_and_wrap_sql(user_sql: str, scoped_cte_sql: str, max_rows: int) -> ValidatedSql:
    sql = (user_sql or "").strip()

    if not sql:
        raise SqlSafetyError("The model did not provide any SQL to execute.")

    if COMMENT_PATTERN.search(sql):
        raise SqlSafetyError("SQL comments are not allowed.")

    if FORBIDDEN_PATTERN.search(sql):
        raise SqlSafetyError("Only read-only SQL is allowed.")

    if ";" in sql:
        statements = [segment.strip() for segment in sql.split(";") if segment.strip()]
        if len(statements) != 1:
            raise SqlSafetyError("Only a single SQL statement is allowed.")
        sql = statements[0]

    try:
        parsed_statements = sqlglot.parse(sql, read="postgres")
    except sqlglot.errors.ParseError as error:
        raise SqlSafetyError("The generated SQL could not be parsed safely.") from error

    if len(parsed_statements) != 1:
        raise SqlSafetyError("Only a single SQL statement is allowed.")

    statement = parsed_statements[0]
    _assert_select_only(statement)
    _assert_allowed_tables(statement)

    executed_sql = (
        f"{scoped_cte_sql}\n"
        f"SELECT * FROM (\n{sql}\n) AS ai_result\n"
        f"LIMIT {int(max_rows)}"
    )

    return ValidatedSql(original_sql=sql, executed_sql=executed_sql)


def _assert_select_only(statement: exp.Expression) -> None:
    if not isinstance(statement, exp.Query):
        raise SqlSafetyError("Only SELECT queries are allowed.")

    forbidden_node_names = [
        "Insert",
        "Update",
        "Delete",
        "Drop",
        "Alter",
        "Create",
        "Command",
        "Merge",
        "TruncateTable",
        "Truncate",
    ]
    forbidden_nodes = tuple(
        node
        for node_name in forbidden_node_names
        if (node := getattr(exp, node_name, None)) is not None
    )

    if any(statement.find(node_type) is not None for node_type in forbidden_nodes):
        raise SqlSafetyError("Only SELECT queries are allowed.")


def _assert_allowed_tables(statement: exp.Expression) -> None:
    table_names = {
        table.name.lower()
        for table in statement.find_all(exp.Table)
        if table.name
    }

    disallowed = sorted(name for name in table_names if name not in ALLOWED_TABLES)
    if disallowed:
        raise SqlSafetyError(
            "SQL referenced tables outside the approved finance scope: "
            + ", ".join(disallowed)
        )
