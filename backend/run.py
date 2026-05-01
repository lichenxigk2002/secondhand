import os

from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', '5002'))
    # use_reloader=False：Windows 下多进程 reloader 可能导致外网访问时 502，关闭后单进程稳定监听
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)
