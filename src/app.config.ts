export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/report/index',
    'pages/mine/index',
    'pages/city-detail/index',
    'pages/onboarding/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '舆情预警',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '风险地图'
      },
      {
        pagePath: 'pages/report/index',
        text: '每日早报'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
