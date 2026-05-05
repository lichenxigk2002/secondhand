from app import create_app, db
from app.models import Admin

app = create_app()
with app.app_context():
    admins = Admin.query.all()
    print(f"Total admins: {len(admins)}")
    for a in admins:
        print(f"ID: {a.id}, Username: {a.username}, Password Length: {len(a.password) if a.password else 0}")
