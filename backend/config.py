import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:{os.getenv('DB_PASSWORD', '')}"
        f"@{os.getenv('DB_HOST', '127.0.0.1')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME', 'lbs_secondhand')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WX_APPID = os.getenv('WX_APPID', '')
    WX_SECRET = os.getenv('WX_SECRET', '')
