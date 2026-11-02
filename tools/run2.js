const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 900, height: 400 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/convert2.html');
  await p.waitForFunction(() => window.DONE, null, { timeout: 90000 });
  const r = await p.evaluate(() => window.RESULT);
  fs.writeFileSync('car_parts.json', JSON.stringify(r));
  await p.screenshot({ path: 'preview.png' });
  const cnt = a => a.reduce((s, x) => s + x.p.length / 9, 0);
  console.log('body tris', cnt(r.body), 'driver', cnt(r.driver), 'wheel meshes', r.wheels.length, 'wheel keys', [...new Set(r.wheels.map(w => w.wheel))]);
  await b.close();
})();
