import psycopg2
from dotenv import load_dotenv
import os

def connect():
    load_dotenv()

    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL is not set in the .env file")

    conn = psycopg2.connect(DATABASE_URL)

    query_sql = 'SELECT VERSION()'
    cur = conn.cursor()
    cur.execute(query_sql)

    version = cur.fetchone()[0]
    print("PostgreSQL version:", version)

    cur.close()
    conn.close()

