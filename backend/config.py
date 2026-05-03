import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    db_user = quote_plus(os.getenv('DB_USER', 'root'))
    db_password = quote_plus(os.getenv('DB_PASSWORD', ''))
    db_host = os.getenv('DB_HOST', '127.0.0.1')
    db_port = os.getenv('DB_PORT', '3306')
    db_name = os.getenv('DB_NAME', 'lbs_secondhand')
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{db_user}:{db_password}"
        f"@{db_host}:{db_port}/{db_name}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    _backend_url = os.getenv('BACKEND_URL', '')
    BACKEND_URL = _backend_url.rstrip('/') if _backend_url else ''
    WX_APPID = os.getenv('WX_APPID', '')
    WX_SECRET = os.getenv('WX_SECRET', '')
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'doubao')
    AI_ENABLED = os.getenv('AI_ENABLED', '1') == '1'
    ARK_API_KEY = os.getenv('ARK_API_KEY', '')
    ARK_MODEL = os.getenv('ARK_MODEL', 'doubao-1-5-lite-32k-250115')
    ARK_VISION_MODEL = os.getenv('ARK_VISION_MODEL', '')
    ARK_BASE_URL = os.getenv('ARK_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3')
