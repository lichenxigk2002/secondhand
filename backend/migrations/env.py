# -*- coding: utf-8 -*-
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import db
from app.models import *  # noqa: F401, F403
from config import Config

config = context.config
# 日志配置：优先用项目根目录的 alembic.ini，不存在则跳过
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for cfg_path in [config.config_file_name, os.path.join(root_dir, 'alembic.ini')]:
    if cfg_path and os.path.exists(cfg_path):
        fileConfig(cfg_path)
        break

target_metadata = db.metadata
cfg = Config()
config.set_main_option('sqlalchemy.url', cfg.SQLALCHEMY_DATABASE_URI.replace('%', '%%'))


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
