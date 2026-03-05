# 图标与资源

## TabBar 图标

当前 `scripts/create-icons.js` 会生成占位 PNG（极小图），若需更好看的底部导航图标，可：

1. 打开 [iconfont.cn](https://www.iconfont.cn)，搜索「首页」「添加」「用户」等，加入项目并下载 **PNG 81×81**（或 162×162）。
2. 将下载的 6 张图重命名为：
   - `home.png` / `home-active.png`
   - `add.png` / `add-active.png`
   - `user.png` / `user-active.png`
3. 覆盖到本目录 `src/assets/` 后重新执行 `npm run dev:weapp`。

推荐图标库：IconPark、iconfont、Phosphor Icons（导出为 PNG 即可）。

## 页面内图标

`src/components/Icon` 提供简单图标组件，可按需扩展或接入 iconfont 字体图标。
