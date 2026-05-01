const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')

const SRC = 256
const OUT = 96
const dir = path.join(__dirname, '../src/assets/ui-icons')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const COLORS = {
  ink: { r: 28, g: 36, b: 52, a: 255 },
  muted: { r: 110, g: 120, b: 138, a: 255 },
  active: { r: 15, g: 159, b: 110, a: 255 },
}

function createCanvas(size = SRC) {
  const png = new PNG({ width: size, height: size })
  png.data.fill(0)
  return png
}

function setPixel(png, x, y, c) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return
  const idx = (png.width * y + x) << 2
  png.data[idx] = c.r
  png.data[idx + 1] = c.g
  png.data[idx + 2] = c.b
  png.data[idx + 3] = c.a
}

function fillRect(png, x1, y1, x2, y2, c) {
  for (let y = Math.round(y1); y <= Math.round(y2); y++) {
    for (let x = Math.round(x1); x <= Math.round(x2); x++) setPixel(png, x, y, c)
  }
}

function fillCircle(png, cx, cy, r, c) {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 <= r ** 2) setPixel(png, x, y, c)
    }
  }
}

function fillRoundedRect(png, x, y, w, h, r, c) {
  fillRect(png, x + r, y, x + w - r, y + h, c)
  fillRect(png, x, y + r, x + w, y + h - r, c)
  fillCircle(png, x + r, y + r, r, c)
  fillCircle(png, x + w - r, y + r, r, c)
  fillCircle(png, x + r, y + h - r, r, c)
  fillCircle(png, x + w - r, y + h - r, r, c)
}

function fillPolygon(png, points, c) {
  const ys = points.map((p) => p[1])
  const minY = Math.floor(Math.min(...ys))
  const maxY = Math.ceil(Math.max(...ys))
  for (let y = minY; y <= maxY; y++) {
    const nodes = []
    let j = points.length - 1
    for (let i = 0; i < points.length; i++) {
      const pi = points[i]
      const pj = points[j]
      if ((pi[1] < y && pj[1] >= y) || (pj[1] < y && pi[1] >= y)) {
        nodes.push(pi[0] + ((y - pi[1]) / (pj[1] - pi[1])) * (pj[0] - pi[0]))
      }
      j = i
    }
    nodes.sort((a, b) => a - b)
    for (let k = 0; k < nodes.length; k += 2) {
      if (nodes[k] == null || nodes[k + 1] == null) continue
      for (let x = Math.floor(nodes[k]); x <= Math.ceil(nodes[k + 1]); x++) setPixel(png, x, y, c)
    }
  }
}

function downsample(srcPng, out = OUT) {
  const dest = new PNG({ width: out, height: out })
  const scale = srcPng.width / out
  for (let y = 0; y < out; y++) {
    for (let x = 0; x < out; x++) {
      let r = 0; let g = 0; let b = 0; let a = 0
      let count = 0
      const sx0 = Math.floor(x * scale)
      const sy0 = Math.floor(y * scale)
      const sx1 = Math.min(srcPng.width, Math.floor((x + 1) * scale))
      const sy1 = Math.min(srcPng.height, Math.floor((y + 1) * scale))
      for (let sy = sy0; sy < sy1; sy++) {
        for (let sx = sx0; sx < sx1; sx++) {
          const idx = (srcPng.width * sy + sx) << 2
          r += srcPng.data[idx]
          g += srcPng.data[idx + 1]
          b += srcPng.data[idx + 2]
          a += srcPng.data[idx + 3]
          count++
        }
      }
      const di = (out * y + x) << 2
      dest.data[di] = Math.round(r / count)
      dest.data[di + 1] = Math.round(g / count)
      dest.data[di + 2] = Math.round(b / count)
      dest.data[di + 3] = Math.round(a / count)
    }
  }
  return dest
}

function write(name, draw, color = COLORS.ink) {
  const src = createCanvas()
  draw(src, color)
  const out = downsample(src)
  fs.writeFileSync(path.join(dir, `${name}.png`), PNG.sync.write(out))
}

function drawAll(png, c) {
  const layers = [
    [[128, 48], [196, 74], [128, 100], [60, 74]],
    [[128, 92], [196, 118], [128, 144], [60, 118]],
    [[128, 136], [196, 162], [128, 188], [60, 162]],
  ]
  layers.forEach((pts) => fillPolygon(png, pts, c))
}

function drawPhone(png, c) {
  fillRoundedRect(png, 78, 34, 100, 188, 24, c)
  fillRoundedRect(png, 92, 50, 72, 146, 12, { ...COLORS.ink, a: 0 })
  fillRect(png, 110, 42, 146, 48, { ...COLORS.ink, a: 0 })
  fillCircle(png, 128, 198, 9, { r: 255, g: 255, b: 255, a: 255 })
}

function drawBook(png, c) {
  fillRoundedRect(png, 40, 46, 78, 150, 18, c)
  fillRoundedRect(png, 138, 46, 78, 150, 18, c)
  fillRect(png, 120, 46, 16, 150, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 126, 56, 4, 134, c)
}

function drawLife(png, c) {
  fillRoundedRect(png, 58, 88, 140, 98, 20, c)
  fillRect(png, 88, 60, 80, 14, c)
  fillRect(png, 96, 44, 14, 28, c)
  fillRect(png, 146, 44, 14, 28, c)
  fillRect(png, 84, 108, 88, 12, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 84, 136, 88, 12, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 102, 90, 12, 92, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 142, 90, 12, 92, { r: 255, g: 255, b: 255, a: 255 })
}

function drawClothes(png, c) {
  fillPolygon(png, [
    [72, 62], [104, 40], [118, 56], [138, 56], [152, 40], [184, 62],
    [168, 96], [150, 88], [150, 198], [106, 198], [106, 88], [88, 96],
  ], c)
}

function drawOther(png, c) {
  ;[[72, 72], [138, 72], [72, 138], [138, 138]].forEach(([x, y]) => {
    fillRoundedRect(png, x, y, 46, 46, 12, c)
  })
}

function drawHome(png, c) {
  // Outline house icon, closer to the SVG style provided by the user.
  fillPolygon(png, [[48, 112], [128, 54], [208, 112], [184, 112], [128, 72], [72, 112]], c)
  fillRoundedRect(png, 68, 108, 120, 108, 18, c)
  fillRoundedRect(png, 86, 126, 84, 72, 14, { r: 255, g: 255, b: 255, a: 255 })
  fillPolygon(png, [[128, 84], [176, 118], [152, 118], [128, 102], [104, 118], [80, 118]], {
    r: 255, g: 255, b: 255, a: 255,
  })
}

function drawAdd(png, c) {
  fillCircle(png, 128, 128, 72, c)
  fillRoundedRect(png, 120, 74, 16, 108, 8, { r: 255, g: 255, b: 255, a: 255 })
  fillRoundedRect(png, 74, 120, 108, 16, 8, { r: 255, g: 255, b: 255, a: 255 })
}

function drawUser(png, c) {
  fillCircle(png, 128, 88, 34, c)
  fillRoundedRect(png, 70, 136, 116, 64, 32, c)
}

function drawOrder(png, c) {
  fillRoundedRect(png, 64, 38, 128, 176, 22, c)
  fillRect(png, 90, 84, 76, 10, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 90, 116, 76, 10, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 90, 148, 50, 10, { r: 255, g: 255, b: 255, a: 255 })
}

function drawSpark(png, c) {
  fillPolygon(png, [[128, 42], [146, 110], [214, 128], [146, 146], [128, 214], [110, 146], [42, 128], [110, 110]], c)
}

function drawSold(png, c) {
  fillRoundedRect(png, 60, 52, 136, 152, 22, c)
  fillRect(png, 88, 88, 80, 12, { r: 255, g: 255, b: 255, a: 255 })
  fillRect(png, 88, 118, 80, 12, { r: 255, g: 255, b: 255, a: 255 })
  fillPolygon(png, [[154, 154], [178, 178], [120, 236], [96, 212]], c)
  fillPolygon(png, [[178, 178], [196, 196], [138, 254], [120, 236]], c)
}

function drawBag(png, c) {
  fillRoundedRect(png, 64, 84, 128, 124, 18, c)
  fillRect(png, 90, 68, 16, 24, c)
  fillRect(png, 150, 68, 16, 24, c)
  fillRect(png, 96, 60, 64, 12, c)
}

write('all', drawAll)
write('phone', drawPhone)
write('book', drawBook)
write('life', drawLife)
write('clothes', drawClothes)
write('other', drawOther)

write('tab-home', drawHome, COLORS.muted)
write('tab-home-active', drawHome, COLORS.active)
write('tab-add', drawAdd, COLORS.ink)
write('tab-user', drawUser, COLORS.muted)
write('tab-user-active', drawUser, COLORS.active)

write('trade-order', drawOrder)
write('trade-star', drawSpark)
write('trade-sold', drawSold)
write('trade-bag', drawBag)

console.log('ui icons generated')
