# 基于 LBS 的校园二手交易微信小程序

## 项目结构

```
├── miniapp/          # Taro + React + TypeScript 小程序前端
├── backend/          # Python Flask 后端
├── docs/             # 需求文档、技术架构
└── README.md
```

## 快速启动

### 1. 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # 编辑 .env 填写数据库与微信配置
```

创建数据库并执行迁移：
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS lbs_secondhand DEFAULT CHARACTER SET utf8mb4;"
flask db upgrade   # 或 alembic upgrade head
```

启动：
```bash
python run.py
```

### 2. 小程序前端

```bash
cd miniapp
npm install
node scripts/create-icons.js   # 生成 tabBar 图标
```

配置 API 地址：在 `miniapp` 目录创建 `.env.development`：
```
TARO_APP_API=http://localhost:5000
```

编译并预览：
```bash
npm run dev:weapp
```

用微信开发者工具打开 `miniapp/dist` 目录，并配置：
- 详情 → 本地设置 → 勾选「不校验合法域名」
- 将 `project.config.json` 中的 `appid` 改为你的小程序 AppID

### 3. 微信配置

在 [微信公众平台](https://mp.weixin.qq.com) 小程序后台：
- 开发 → 开发管理 → 开发设置：获取 AppID、AppSecret
- 填入 backend `.env` 的 `WX_APPID`、`WX_SECRET`

## 技术栈

- **前端**：Taro 3 + React 18 + TypeScript
- **后端**：Flask + SQLAlchemy + MySQL
- **核心**：LBS 邻近检索（Haversine 公式）、地理围栏

## 主要功能

- 用户登录、资料管理
- 商品发布（含位置选点）
- 邻近检索、地图展示
- 商品详情、联系卖家（聊天占位）

详见 `docs/01-需求文档.md`、`docs/02-技术架构设计.md`。
