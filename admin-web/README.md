# 后台管理前端

独立于小程序前端的 Vue 3 管理端，默认对接 Flask 后端的 `/api/admin/*` 接口。

## 启动

```bash
cd admin-web
npm install
cp .env.example .env
npm run dev
```

默认开发地址：

- `http://127.0.0.1:5174`

默认后端地址：

- `http://127.0.0.1:5002/api/admin`

如果后端端口不同，修改 `.env` 中的 `VITE_API_BASE_URL`。
