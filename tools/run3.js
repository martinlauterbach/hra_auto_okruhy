// node run3.js model.ldr out_prefix
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [model, pre] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1200, height: 400 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/convert3.html?m=' + encodeURIComponent(model));
  await p.waitForFunction(() => window.DONE, null, { timeout: 120000 });
  const r = await p.evaluate(() => window.RESULT);
  fs.writeFileSync(pre + '_parts.json', JSON.stringify(r));
  await p.screenshot({ path: pre + '_preview.png' });
  const cnt = a => a.reduce((s, x) => s + x.p.length / 9, 0);
  console.log('body tris', cnt(r.body), 'driver', cnt(r.driver), 'wheel parts', [...new Set(r.wheels.map(w => w.wheel))].length, 'colors', [...new Set([...r.body, ...r.driver].map(x => x.color + '@' + x.opacity))].join(' '));
  await b.close();
})();
