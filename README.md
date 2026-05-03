# 邻物集 - 基于 LBS 的校内闲置流转微信小程序

## 项目结构

```
├── miniapp/          # Taro + React + TypeScript 小程序前端
├── backend/          # Python Flask 后端
├── docs/             # 文档总目录（按需求/技术/指导/毕设分层）
└── README.md
```

## 快速启动

### 1. 后端

```bash
cd backend
python -m pip install -r requirements.txt
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

如需演示实时聊天推送，另开一个终端启动 WebSocket 服务：

```bash
python ws_server.py
```

### 2. 小程序前端

```bash
cd miniapp
npm install
node scripts/create-icons.js   # 生成 tabBar 图标
```

配置 API 地址：小程序不能访问 `localhost`，需用本机局域网 IP。推荐在 `miniapp/.env` 中配置，例如：

```env
TARO_APP_API=http://10.10.31.129:5002
TARO_APP_WS=ws://10.10.31.129:5001
```

可直接复制 `miniapp/.env.example` 为 `miniapp/.env` 后修改，再执行 `npm run dev:weapp`。若未配置 `.env`，前端会默认使用 `http://10.10.31.129:5002`，并将 WebSocket 地址推导为 `ws://10.10.31.129:5001`。其中 Flask HTTP 服务默认监听 5002，独立 WebSocket 聊天服务默认监听 5001。

编译并预览：
```bash
npm run dev:weapp
```

### 2.5 后台管理前端

```bash
cd admin-web
npm install
cp .env.example .env
npm run dev
```

默认访问地址：

- `http://127.0.0.1:5174`

默认对接后端接口：

- `http://127.0.0.1:5002/api/admin`

默认管理员账号：

- 账号：`admin`
- 密码：`admin123456`

说明：当 `admin` 表为空时，首次访问后台登录接口会自动初始化该管理员。若需自定义，可在 `backend/.env` 中增加：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123456
```

用微信开发者工具打开项目并配置：
- **推荐**：打开 **`miniapp/dist`** 目录（编译输出目录）；若打开的是仓库根目录，根目录下的 `project.config.json` 已配置 `miniprogramRoot: "miniapp/dist/"`，请勿改为打开 `miniapp` 源码目录，否则会出现「dist/app.json 所在目录不是小程序的根目录」等模拟器异常。
- 详情 → 本地设置 → 勾选「不校验合法域名」
- 将 `project.config.json` 中的 `appid` 改为你的小程序 AppID

### 3. 微信配置

在 [微信公众平台](https://mp.weixin.qq.com) 小程序后台：
- 开发 → 开发管理 → 开发设置：获取 AppID、AppSecret
- 填入 backend `.env` 的 `WX_APPID`、`WX_SECRET`

## 技术栈

- **前端**：Taro 3 + React 18 + TypeScript
- **后台管理前端**：Vue 3 + Vite + TypeScript
- **后端**：Flask + SQLAlchemy + MySQL
- **核心**：LBS 邻近检索（Haversine 公式）、地理围栏

## 主要功能

- 用户登录、资料管理
- 商品发布（含位置选点）
- 邻近检索、地图展示
- 商品详情、联系卖家、即时聊天
- 后台管理：工作台、用户管理、商品审核、举报处理、分类管理、订单管理、评价管理、管理员管理、操作日志

详见 `docs/README.md`、`docs/需求文档/01-需求文档.md`、`docs/技术文档/02-技术架构设计.md`。

---

## 为什么必须用本机 IP，不能用 localhost？

| 请求地址 | 小程序里实际效果 |
|----------|------------------|
| **localhost / 127.0.0.1** | 在开发者工具里，「本机」指的是工具自己的环境，不是你的电脑，请求到不了你跑的 Flask，所以**所有接口都会失败**（连接错误或超时）。 |
| **本机局域网 IP（如 192.168.0.103）** | 请求会发到你电脑的 5002 端口。只要防火墙放行，Flask 就能收到请求，**接口正常可用**。 |

所以**不是「一用 IP 就 502」**，而是：  
- 用 IP 时，请求会真的打到你的电脑，若**防火墙拦了 5002 端口**，才会出现 502 或连不上。  
- 用 localhost 时，请求根本到不了你的电脑，**所有依赖后端的功能都会失效**（登录、商品列表、订单、消息、个人资料等），相当于后端相关功能都被「禁用」。

**结论**：开发小程序时必须用本机 IP，并在 Windows 防火墙里放行 5002 端口（见下方 502 排查），否则要么全挂（localhost），要么 502（IP 被拦）。

---

## 开发时出现 502 Bad Gateway

小程序请求 `http://192.168.0.103:5002/api/...` 返回 502，通常有两种原因。

### 1. 请求根本没到后端 (网络/防火墙)

**现象**：运行 `python run.py` 的终端里，在小程序发起请求时**没有**出现 `[Req] GET /api/xxx` 这类日志。

**处理**：让本机 5002 端口可被访问。

- **Windows 防火墙放行 5002 端口（任选一种）**  
  **方式一：按端口放行（推荐）**  
  1. 按 `Win + R`，输入 `wf.msc`，回车，打开「高级安全 Windows 防火墙」。  
  2. 左侧点「入站规则」→ 右侧点「新建规则」。  
  3. 选「端口」→ 下一步 → 选「TCP」，下面选「特定本地端口」，填 `5002` → 下一步。  
  4. 选「允许连接」→ 下一步 → 三个全勾选（域、专用、公用）→ 下一步。  
  5. 名称填「Flask 5002」→ 完成。  
  **方式二：按程序放行**  
  1. 控制面板 → Windows Defender 防火墙 → 允许应用或功能通过 Windows Defender 防火墙。  
  2. 点「更改设置」→ 找到「Python」或「python.exe」→ 勾选「专用」和「公用」→ 确定。

- **本机先自测**  
  浏览器打开：`http://192.168.0.101:5000/api/ping`  
  - 若能看到 `{"ok": true}`，说明本机访问正常，再在小程序里重试。  
  - 若打不开，多半是防火墙或本机 IP 已变（可 `ipconfig` 看当前 IPv4，并相应改小程序里的 API 地址）。

### 2. 请求到了但后端抛错（已做防护）

**现象**：终端里**有** `[Req] GET /api/xxx`，但小程序仍报 502。

后端已做：

- `run.py` 使用 `use_reloader=False`，避免 Windows 下多进程导致外网访问异常。
- 全局捕获未处理异常，返回 500 而不是进程崩溃。
- `/api/ping` 用于健康检查，不鉴权、不查库。

**处理**：看终端里该请求下方是否有 **Traceback**。若有，把完整报错贴出来即可针对性修；若无 Traceback 仍 502，可能是微信开发者工具或中间代理把 500 转成 502，可再试一次或换真机预览。

### 模拟器启动失败 / 页面显示 [object Object]

- **原因**：多为构建产物异常或某处把「对象」当作文本渲染，React 报错后框架会显示 `[object Object]`。
- **处理**：  
  1. 在 `miniapp` 目录删除 `dist` 文件夹，重新执行 `npm run dev:weapp`。  
  2. 若仍出现，查看微信开发者工具「调试器」里 Console 的报错（如 "Objects are not valid as a React child"），根据报错文件与行号检查是否把对象直接放在 JSX 里渲染。  
  3. 项目已在商品卡片、详情、评论等处对标题、价格、昵称、描述等做了 `String(...)` 防护，避免接口返回异常类型时渲染成对象。
