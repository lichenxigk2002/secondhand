export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/publish/index',
    'pages/detail/index',
    'pages/user/index',
    'pages/chat-list/index',
    'pages/chat/index',
    'pages/my-goods/index',
    'pages/profile-edit/index',
    'pages/favorites/index',
    'pages/orders/index',
    'pages/evaluate/index',
    'pages/browse-history/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#07c160',
    navigationBarTitleText: '校园二手',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#999',
    selectedColor: '#07c160',
    list: [
      { pagePath: 'pages/index/index', text: '首页', iconPath: 'assets/home.png', selectedIconPath: 'assets/home-active.png' },
      { pagePath: 'pages/publish/index', text: '发布', iconPath: 'assets/add.png', selectedIconPath: 'assets/add-active.png' },
      { pagePath: 'pages/user/index', text: '我的', iconPath: 'assets/user.png', selectedIconPath: 'assets/user-active.png' },
    ],
  },
  permission: {
    'scope.userLocation': {
      desc: '用于展示附近商品和发布时选择位置',
    },
    'scope.album': { desc: '用于选择商品图片' },
    'scope.camera': { desc: '用于拍摄商品图片' },
  },
})
