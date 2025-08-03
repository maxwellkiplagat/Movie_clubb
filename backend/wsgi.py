import sys
sys.version_info = (3, 12, 0, "final", 0)  # Workaround for version checks
from app import create_app, db 

app = create_app()
