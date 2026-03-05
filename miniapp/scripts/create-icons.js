const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const SIZE = 81
const dir = path.join(__dirname, '../src/assets')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

// 灰色未选中 #999999，绿色选中 #07c160
const GRAY = { r: 153, g: 153, b: 153 }
const GREEN = { r: 7, g: 193, b: 96 }

function setPixel(png, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return
  const idx = (png.width * y + x) << 2
  png.data[idx] = r
  png.data[idx + 1] = g
  png.data[idx + 2] = b
  png.data[idx + 3] = a
}

function fillCircle(png, cx, cy, radius, color) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) {
        setPixel(png, x, y, color.r, color.g, color.b)
      }
    }
  }
}

function drawRect(png, x1, y1, x2, y2, color) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(png, x, y, color.r, color.g, color.b)
    }
  }
}

// 首页 - 房子轮廓（屋顶三角 + 矩形屋身）
function drawHome(png, color) {
  const c = SIZE / 2
  // 屋顶三角形 (40,18) (22,38) (58,38)
  for (let y = 18; y <= 38; y++) {
    const w = Math.round(((38 - y) / 20) * 18)
    for (let x = c - w; x <= c + w; x++) {
      setPixel(png, x, y, color.r, color.g, color.b)
    }
  }
  // 屋身矩形
  drawRect(png, 28, 38, 52, 62, color)
  // 门镂空（透明）
  for (let y = 46; y <= 62; y++) {
    for (let x = 36; x <= 44; x++) {
      setPixel(png, x, y, 0, 0, 0, 0)
    }
  }
}

// 加号
function drawAdd(png, color) {
  const c = SIZE / 2
  const t = 6
  drawRect(png, c - t, 22, c + t, 58, color)
  drawRect(png, 22, c - t, 58, c + t, color)
}

// 用户 - 圆头 + 梯形身体
function drawUser(png, color) {
  const c = SIZE / 2
  fillCircle(png, c, 26, 10, color)
  // 身体梯形 (32,38) (48,38) (44,62) (36,62)
  for (let y = 38; y <= 62; y++) {
    const progress = (y - 38) / 24
    const left = Math.round(32 + progress * 4)
    const right = Math.round(48 - progress * 4)
    for (let x = left; x <= right; x++) {
      setPixel(png, x, y, color.r, color.g, color.b)
    }
  }
}

function createPng(fn) {
  const png = new PNG({ width: SIZE, height: SIZE })
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = 255
    png.data[i + 1] = 255
    png.data[i + 2] = 255
    png.data[i + 3] = 0
  }
  fn(png)
  return png
}

function writeSync(name, png) {
  const file = path.join(dir, `${name}.png`)
  fs.writeFileSync(file, PNG.sync.write(png))
}

// 生成 6 个图标
const home = createPng((p) => drawHome(p, GRAY))
writeSync('home', home)

const homeActive = createPng((p) => drawHome(p, GREEN))
writeSync('home-active', homeActive)

const add = createPng((p) => drawAdd(p, GRAY))
writeSync('add', add)

const addActive = createPng((p) => drawAdd(p, GREEN))
writeSync('add-active', addActive)

const user = createPng((p) => drawUser(p, GRAY))
writeSync('user', user)

const userActive = createPng((p) => drawUser(p, GREEN))
writeSync('user-active', userActive)

console.log('TabBar 图标已生成: home, home-active, add, add-active, user, user-active')
