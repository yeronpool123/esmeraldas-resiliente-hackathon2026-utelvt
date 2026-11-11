import os

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5433/test")
os.environ.setdefault("JWT_SECRET", "test-access-secret-at-least-32-characters")
os.environ.setdefault("JWT_REFRESH_SECRET", "test-refresh-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@test.example")
os.environ.setdefault("ADMIN_PASSWORD", "LocalAdminPassword123")
os.environ.setdefault("COE_EMAIL", "coe@test.example")
os.environ.setdefault("COE_PASSWORD", "LocalCoePassword123")
os.environ.setdefault("SEED_USERS_ON_STARTUP", "false")
