const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, '../src/assets')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
;['home', 'home-active', 'add', 'add-active', 'user', 'user-active'].forEach(name => {
  fs.writeFileSync(path.join(dir, `${name}.png`), png)
})
console.log('Icons created.')
