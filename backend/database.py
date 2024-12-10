import snowflake.connector
import os
from dotenv import load_dotenv
import logging

# Charger les variables d'environnement
load_dotenv()

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("database")

# Paramètres de connexion à Snowflake
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_PASSWORD = os.getenv("SNOWFLAKE_PASSWORD")
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_DATABASE = os.getenv("SNOWFLAKE_DATABASE")
SNOWFLAKE_SCHEMA = os.getenv("SNOWFLAKE_SCHEMA")


def get_snowflake_connection():
    try:
        conn = snowflake.connector.connect(
            user=SNOWFLAKE_USER,
            password=SNOWFLAKE_PASSWORD,
            account=SNOWFLAKE_ACCOUNT,
            database=SNOWFLAKE_DATABASE,
            schema=SNOWFLAKE_SCHEMA,
            role="ACCOUNTADMIN",
        )
        logger.info("Connexion à Snowflake réussie.")
        return conn
    except Exception as e:
        logger.error(f"Erreur de connexion à Snowflake : {str(e)}")
        raise
