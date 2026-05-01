import path from 'path'

const config = {
  projectName: 'lbs-secondhand-miniapp',
  date: '2025-2-25',
  designWidth: 375,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-framework-react'],
  defineConstants: {
    // 小程序开发者工具无法访问 localhost，需用本机局域网 IP。优先从 miniapp/.env 读取。
    'process.env.TARO_APP_API': JSON.stringify(process.env.TARO_APP_API || 'http://10.10.31.129:5002'),
    'process.env.TARO_APP_WS': JSON.stringify(process.env.TARO_APP_WS || ''),
  },
  copy: {
    patterns: [{ from: 'src/assets', to: 'dist/assets' }],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
  },
  cache: {
    enable: false,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024,
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      autoprefixer: {
        enable: true,
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
}

export default config
