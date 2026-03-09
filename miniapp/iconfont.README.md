# 阿里 Iconfont 使用说明

项目已接入 **阿里 Iconfont**，通过 `taro-iconfont-cli` 在微信小程序中使用 iconfont 图标。

## 当前状态

- **回退模式**：未配置 `symbol_url` 时，自动使用 Ionicons 作为回退，界面正常显示。
- 页面已统一使用 `<IconFont name="xxx" size={24} color="#333" />`，图标名与 Iconfont 命名一致。

## 使用自己的 Iconfont 图标

1. **打开 [iconfont.cn](https://www.iconfont.cn)**，登录后进入「资源管理」→「我的项目」→ 新建项目（或使用已有项目）。

2. **添加图标**  
   在图标库中搜索并添加所需图标（建议与下方名称一致，便于替换）：
   - 首页/分类：`search`、`apps`、`phone`、`book`、`basket`、`shirt`、`grid`、`list`、`map`、`folder`
   - 底部栏：`home`、`add`、`user`
   - 个人页：`order`、`star`、`receipt`、`cart`、`chat`、`arrow`、`help`、`setting`

3. **获取 Symbol 链接**  
   项目设置 → 选择「Symbol」方式 → 复制生成的 **.js 链接**（形如 `//at.alicdn.com/t/xxx.js`）。

4. **填写配置**  
   在项目根目录打开 `iconfont.json`，将 `symbol_url` 改为你复制的链接（需带协议，如 `https:`）：
   ```json
   "symbol_url": "https://at.alicdn.com/t/你的项目.js",
   ```

5. **生成组件**  
   在 `miniapp` 目录下执行：
   ```bash
   npm run iconfont
   ```
   会生成/更新 `src/components/iconfont-generated/` 下的组件，**覆盖当前回退实现**，之后将使用你在 iconfont 中配置的图标。

## 图标名与页面对应关系

| 页面     | 使用名称   |
|----------|------------|
| 首页     | search, apps, phone, book, basket, shirt, grid, list, map, folder |
| 底部 Tab | home, add, user |
| 我的     | order, star, receipt, cart, chat, arrow, help, setting |

在 iconfont 项目中添加图标时，建议将图标命名为上述英文名（或带 `icon-` 前缀，由 `trim_icon_prefix` 配置决定）。
