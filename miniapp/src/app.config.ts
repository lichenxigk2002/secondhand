export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/publish/index',
    'pages/detail/index',
    'pages/user/index',
    'pages/chat-list/index',
    'pages/chat/index',
    'pages/my-goods/index',
    'pages/publish-edit/index',
    'pages/profile-edit/index',
    'pages/favorites/index',
    'pages/orders/index',
    'pages/evaluate/index',
    'pages/browse-history/index',
    'pages/evaluations-received/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFD100',
    navigationBarTitleText: '邻物集',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    custom: true,
    color: '#999',
    selectedColor: '#222',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/publish/index', text: '发布' },
      { pagePath: 'pages/user/index', text: '我的' },
    ],
  },
  // 仅保留小程序支持的权限说明；scope.album/scope.camera 已废弃，相册与相机在调用时按需授权即可
  permission: {
    'scope.userLocation': {
      desc: '用于展示附近商品和发布时选择位置',
    },
  },
  requiredPrivateInfos: [
    'getLocation',
    'chooseLocation'
  ],
})
