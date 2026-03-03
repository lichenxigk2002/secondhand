# -*- coding: utf-8 -*-
"""初始化商品分类数据，迁移后执行一次即可"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Category

def main():
    app = create_app()
    with app.app_context():
        if Category.query.first():
            print('分类已存在，跳过')
            return
        categories = [
            ('数码', 1),
            ('书籍', 2),
            ('生活用品', 3),
            ('服饰', 4),
            ('其他', 5),
        ]
        for name, sort in categories:
            db.session.add(Category(name=name, sort_order=sort, parent_id=0))
        db.session.commit()
        print('分类初始化完成')

if __name__ == '__main__':
    main()
