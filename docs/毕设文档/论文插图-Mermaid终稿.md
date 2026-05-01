# 论文插图 Mermaid 终稿

以下图全部用于论文草图临摹，统一采用 Mermaid 表达。  
原则：白底、黑灰边框、直线连接、结构完整，便于你在 Word 中按图重绘。

---

## 图 3-1 系统总体架构图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TB
    subgraph P[表现层]
        P1[微信小程序用户端\nTaro + React + TypeScript]
        P2[后台管理端\nVue 3 + Vite + TypeScript]
    end

    subgraph B[业务层]
        B1[Flask RESTful API]
        B2[WebSocket 聊天服务]
        B3[JWT 鉴权]
        B4[业务逻辑处理]
    end

    subgraph D[数据访问层]
        D1[SQLAlchemy ORM]
    end

    subgraph S[数据存储层]
        S1[(MySQL 数据库)]
        S2[图片上传目录]
    end

    P1 --> B1
    P1 --> B2
    P2 --> B1
    B1 --> B3
    B1 --> B4
    B2 --> B4
    B4 --> D1
    D1 --> S1
    B1 --> S2
```

---

## 图 3-2 功能模块图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart LR
    C[基于 LBS 的微信小程序校园二手交易系统]

    C --> M1[用户与资料模块]
    C --> M2[商品与分类模块]
    C --> M3[附近检索与地图展示模块]
    C --> M4[收藏与浏览历史模块]
    C --> M5[商品留言与详情互动模块]
    C --> M6[聊天消息模块]
    C --> M7[订单与评价模块]
    C --> M8[举报与信用模块]
    C --> M9[后台管理模块]
    C --> M10[AI 发布辅助模块]
```

---

## 图 3-3 数据库 ER 图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}}}%%
erDiagram
    USER {
        int id PK
        string openid
        string nick_name
        string phone
        string campus
        int credit_score
        int status
    }

    CATEGORY {
        int id PK
        string name
        int sort_order
        int status
    }

    GOODS {
        int id PK
        int user_id FK
        int category_id FK
        string title
        decimal price
        decimal lat
        decimal lng
        int status
        int audit_status
    }

    ORDERS {
        int id PK
        string order_no
        int buyer_id FK
        int seller_id FK
        int goods_id FK
        decimal amount
        int status
    }

    CONVERSATION {
        int id PK
        int user1_id FK
        int user2_id FK
        int goods_id FK
        int last_message_id
    }

    MESSAGE {
        int id PK
        int conversation_id FK
        int from_user_id FK
        int to_user_id FK
        string content
        string msg_type
        int is_read
    }

    EVALUATION {
        int id PK
        int order_id FK
        int from_user_id FK
        int to_user_id FK
        int star
        string comment
    }

    CREDIT_LOG {
        int id PK
        int user_id FK
        int change_value
        int before_score
        int after_score
        string reason
    }

    FAVORITE {
        int id PK
        int user_id FK
        int goods_id FK
    }

    BROWSE_HISTORY {
        int id PK
        int user_id FK
        int goods_id FK
    }

    REPORT {
        int id PK
        int reporter_id FK
        string target_type
        int target_id
        string reason
        int status
    }

    USER ||--o{ GOODS : publishes
    CATEGORY ||--o{ GOODS : classifies
    USER ||--o{ ORDERS : buys
    USER ||--o{ ORDERS : sells
    GOODS ||--o{ ORDERS : generates
    USER ||--o{ CONVERSATION : joins
    GOODS ||--o{ CONVERSATION : binds
    CONVERSATION ||--o{ MESSAGE : contains
    USER ||--o{ MESSAGE : sends
    ORDERS ||--o{ EVALUATION : has
    USER ||--o{ EVALUATION : receives
    USER ||--o{ CREDIT_LOG : owns
    USER ||--o{ FAVORITE : creates
    GOODS ||--o{ FAVORITE : is_favorited
    USER ||--o{ BROWSE_HISTORY : creates
    GOODS ||--o{ BROWSE_HISTORY : is_browsed
    USER ||--o{ REPORT : submits
```

---

## 图 4-1 首页业务流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[开始] --> B[进入首页]
    B --> C[获取用户定位]
    C --> D{定位是否成功}
    D -- 是 --> E[携带 lat/lng/radius 请求商品列表]
    D -- 否 --> F[请求普通商品列表]
    E --> G[执行分类/校区/关键词筛选]
    F --> G
    G --> H{展示方式}
    H -- 列表模式 --> I[展示商品列表]
    H -- 地图模式 --> J[展示商品地图标记]
    I --> K[结束]
    J --> K
```

---

## 图 4-2 商品发布流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[开始] --> B[进入发布页]
    B --> C[填写标题、价格、分类、描述]
    C --> D[选择商品图片]
    D --> E[选择交易位置]
    E --> F{表单校验是否通过}
    F -- 否 --> G[提示错误并返回修改]
    F -- 是 --> H[可选执行 AI 草稿生成与发布预检]
    H --> I[调用发布接口]
    I --> J[保存商品信息]
    J --> K[返回发布成功]
    G --> C
    K --> L[结束]
```

---

## 图 4-3 附近检索算法流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[开始] --> B[接收 lat、lng、radius 参数]
    B --> C{参数是否完整}
    C -- 否 --> D[返回错误信息]
    C -- 是 --> E[查询上架且审核通过的商品]
    E --> F[遍历商品集合]
    F --> G[调用 Haversine 公式计算距离]
    G --> H{是否设置半径限制}
    H -- 否 --> I[加入候选结果集]
    H -- 是 --> J{距离是否小于等于 radius}
    J -- 否 --> K[过滤当前商品]
    J -- 是 --> I[加入候选结果集]
    I --> L{是否遍历完成}
    K --> L
    L -- 否 --> F
    L -- 是 --> M[按距离升序排序]
    M --> N[返回包含距离字段的商品列表]
    N --> O[结束]
```

---

## 图 4-4 聊天模块时序图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}}}%%
sequenceDiagram
    participant U1 as 用户A
    participant MP as 小程序端
    participant API as Flask API
    participant WS as WebSocket服务
    participant U2 as 用户B

    U1->>MP: 发起聊天
    MP->>API: 获取/创建会话
    API-->>MP: 返回会话信息
    MP->>WS: 建立连接并携带 token
    U1->>MP: 输入并发送消息
    MP->>WS: 发送消息内容
    WS->>API: 写入消息与会话状态
    API-->>WS: 返回消息记录结果
    WS-->>MP: 推送消息
    WS-->>U2: 推送新消息
```

---

## 图 4-5 评价与信用分流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[开始] --> B[用户进入订单页]
    B --> C{订单是否已完成}
    C -- 否 --> D[禁止评价]
    C -- 是 --> E[填写星级与评价内容]
    E --> F[提交评价]
    F --> G[写入 Evaluation 表]
    G --> H[根据星级计算信用分变化值]
    H --> I[更新用户 credit_score]
    I --> J[写入 CreditLog 表]
    J --> K[返回评价成功]
    D --> L[结束]
    K --> L
```

---

## 图 4-6 后台管理信息架构图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[后台管理系统]
    A --> B[登录页]
    A --> C[管理后台]
    C --> C1[工作台]
    C --> C2[用户管理]
    C --> C3[商品管理]
    C --> C4[举报处理]
    C --> C5[分类管理]
    C --> C6[订单管理]
    C --> C7[评价管理]
    C --> C8[管理员账号]
    C --> C9[操作日志]
```

---

## 图 4-7 系统部署图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart LR
    A[微信小程序用户端]
    B[后台管理端]
    C[Flask API 服务]
    D[WebSocket 聊天服务]
    E[(MySQL 数据库)]
    F[图片上传目录]

    A -->|HTTP| C
    A -->|WebSocket| D
    B -->|HTTP| C
    C --> E
    D --> E
    C --> F
```

---

## 图 5-1 系统测试流程图

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#111111', 'primaryBorderColor': '#333333', 'lineColor': '#333333', 'secondaryColor': '#ffffff', 'tertiaryColor': '#ffffff', 'background': '#ffffff'}, 'flowchart': { 'curve': 'linear' }}}%%
flowchart TD
    A[开始] --> B[搭建测试环境]
    B --> C[设计测试用例]
    C --> D[执行用户端功能测试]
    D --> E[执行后台管理功能测试]
    E --> F[记录测试结果]
    F --> G[分析问题并优化]
    G --> H[结束]
```

