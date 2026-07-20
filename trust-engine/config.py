from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Read values from .env
SECRET_KEY = os.getenv("SECRET_KEY")
HASH_ALGORITHM = os.getenv("HASH_ALGORITHM", "SHA256")

# Validate required configuration
if not SECRET_KEY:
    raise ValueError("SECRET_KEY not found in .env")

# Application Configuration
APP_NAME = "AI Accountability Trust Engine"
APP_VERSION = "1.0.0"
DATABASE_NAME = "accountability.db"