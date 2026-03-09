const fs = require('fs')
const path = require('path')

const configPath = path.join(__dirname, '..', 'iconfont.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
const url = (config.symbol_url || '').trim()

if (!url || url.startsWith('请到') || url === 'https://at.alicdn.com/t/你的项目.js') {
  console.log('')
  console.log('  ⚠ 未配置 symbol_url，跳过生成。')
  console.log('')
  console.log('  使用阿里 Iconfont 步骤：')
  console.log('  1. 打开 https://www.iconfont.cn 并登录')
  console.log('  2. 进入「资源管理」→「我的项目」→ 新建项目或选择已有项目')
  console.log('  3. 添加所需图标后，在项目设置中选择「Symbol」，复制 .js 链接')
  console.log('  4. 在 miniapp/iconfont.json 中把 symbol_url 改为该链接（需带 https:）')
  console.log('  5. 再次执行 npm run iconfont')
  console.log('')
  console.log('  当前界面使用 Ionicons 回退显示，无需配置也可正常运行。')
  console.log('')
  process.exit(0)
}

const { execSync } = require('child_process')
execSync('npx iconfont-taro', { stdio: 'inherit', cwd: path.join(__dirname, '..') })
