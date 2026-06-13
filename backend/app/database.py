import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: SUPABASE_URL or SUPABASE_KEY is missing in the environment. Database operations will fail.")

def get_supabase_client() -> Client:
    """Dependency injection for the Supabase client."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)
