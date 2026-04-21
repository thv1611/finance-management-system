from datetime import date


ALLOWED_TABLES = (
    "scoped_users",
    "scoped_categories",
    "scoped_transactions",
    "scoped_budgets",
)


def build_schema_context() -> str:
    today = date.today().isoformat()
    return f"""
Today is {today}.

You may only query these scoped read-only tables:

1. scoped_users
- id integer
- full_name varchar
- email varchar
- created_at timestamptz
- updated_at timestamptz

2. scoped_categories
- id integer
- user_id integer nullable
- name varchar
- type varchar ('income' or 'expense')
- is_default boolean
- created_at timestamptz
- updated_at timestamptz

3. scoped_transactions
- id integer
- user_id integer
- category_id integer nullable
- type varchar ('income' or 'expense')
- amount numeric(15,2)
- title varchar
- description text nullable
- receipt_url text nullable
- transaction_date date
- created_at timestamptz
- updated_at timestamptz

4. scoped_budgets
- id integer
- user_id integer
- category_id integer
- month integer
- year integer
- amount_limit numeric(15,2)
- created_at timestamptz
- updated_at timestamptz

Relationships:
- scoped_transactions.category_id joins scoped_categories.id
- scoped_budgets.category_id joins scoped_categories.id
- scoped_transactions.user_id and scoped_budgets.user_id already belong to the authenticated user
- scoped_categories includes the authenticated user's categories plus global default categories

Business rules:
- Spending means transactions where type = 'expense'
- Income means transactions where type = 'income'
- Budget overage requires comparing scoped_budgets.amount_limit with summed expense transactions for the same category, month, and year
- Prefer concise aggregates and recent time windows
- Always select only columns needed for the answer
- Use ORDER BY and LIMIT for transaction listings
""".strip()
