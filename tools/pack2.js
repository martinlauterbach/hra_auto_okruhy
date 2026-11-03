// node pack2.js parts.json out.b64 '{"name":"...","paint":"#b40000"|null,"credit":"..."}'
const fs = require('fs'), zlib = require('zlib');
const [inp, outp, optsJson] = process.argv.slice(2);
const opts = JSON.parse(optsJson || '{}');
const R = JSON.parse(fs.readFileSync(inp));
const all = [...R.body, ...R.driver, ...R.wheels];
const centroid = arr => { let s = [0, 0, 0], n = 0; for (const e of arr) for (let i = 0; i < e.p.length; i += 3) { s[0] += e.p[i]; s[1] += e.p[i + 1]; s[2] += e.p[i + 2]; n++; } return n ? s.map(v => v / n) : null; };
const bbox = arr => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const e of arr) for (let i = 0; i < e.p.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], e.p[i + k]); mx[k] = Math.max(mx[k], e.p[i + k]); } return [mn, mx]; };
// cluster wheel pieces (tyre + rim) into wheels by the centre of their geometry
const clusters = [];
for (const e of R.wheels) {
  const [mn, mx] = bbox([e]); const c = mn.map((v, k) => (v + mx[k]) / 2);
  let cl = clusters.find(q => Math.hypot(q.c[0] - c[0], q.c[1] - c[1], q.c[2] - c[2]) < 25);
  if (!cl) { cl = { c, parts: [] }; clusters.push(cl); }
  cl.parts.push(e);
}
if (clusters.length !== 4) throw new Error('expected 4 wheels, found ' + clusters.length);
clusters.forEach(cl => { const [mn, mx] = bbox(cl.parts); cl.c = mn.map((v, k) => (v + mx[k]) / 2); cl.r = (mx[1] - mn[1]) / 2; });
// longitudinal axis = the one along which the wheels are spread furthest
const spread = k => Math.max(...clusters.map(c => c.c[k])) - Math.min(...clusters.map(c => c.c[k]));
const ax = spread(0) > spread(2) ? 0 : 2;
// front = side with the clear/yellow head lamps, else opposite to the red tail lamps
const cAll = centroid(all);
const lamps = all.filter(e => e.color === '#f5cd2f'), tails = all.filter(e => e.color === '#c91a09');
let frontSign = 1;
if (lamps.length) frontSign = Math.sign(centroid(lamps)[ax] - cAll[ax]) || 1;
else if (tails.length) frontSign = -Math.sign(centroid(tails)[ax] - cAll[ax]) || 1;
// proper rotation about y so that the front points to +z
const rot = ax === 2 ? (frontSign > 0 ? p => [p[0], p[1], p[2]] : p => [-p[0], p[1], -p[2]])
                     : (frontSign > 0 ? p => [-p[2], p[1], p[0]] : p => [p[2], p[1], -p[0]]);
const wheelsR = clusters.map(cl => ({ ...cl, c: rot(cl.c) }));
const zs = wheelsR.map(w => w.c[2]); const zF = Math.max(...zs), zR = Math.min(...zs), wb = zF - zR;
const S = 2.7 / wb;
const groundY = Math.min(...wheelsR.map(w => w.c[1] - w.r));
const xMid = wheelsR.reduce((s, w) => s + w.c[0], 0) / 4;
const zOrigin = zR + wb * (1.42 / 2.72);
const toGame = p => { const q = rot(p); return [(q[0] - xMid) * S, (q[1] - groundY) * S, (q[2] - zOrigin) * S]; };
const Q = 10000;
const meshes = [], bufs = [];
function addMesh(e, kind, wheelIdx, center) {
  const map = new Map(), pos = [], nor = [], idx = [];
  for (let i = 0; i < e.p.length; i += 3) {
    let g = toGame([e.p[i], e.p[i + 1], e.p[i + 2]]);
    if (center) g = [g[0] - center[0], g[1] - center[1], g[2] - center[2]];
    const n = rot([e.n[i], e.n[i + 1], e.n[i + 2]]);
    const qp = g.map(v => Math.round(v * Q)), qn = n.map(v => Math.round(v * 127));
    const key = qp.join(',') + '|' + qn.join(',');
    let id = map.get(key);
    if (id === undefined) { id = pos.length / 3; map.set(key, id); pos.push(...qp); nor.push(...qn); }
    idx.push(id);
  }
  const vc = pos.length / 3;
  const P = Int16Array.from(pos), N = Int8Array.from(nor);
  const I = vc < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx);
  meshes.push({ kind, wheel: wheelIdx, color: e.color, opacity: e.opacity, vc, ic: idx.length, i32: !(vc < 65536) });
  bufs.push(Buffer.from(P.buffer), Buffer.from(N.buffer), Buffer.alloc((4 - (N.byteLength % 4)) % 4), Buffer.from(I.buffer));
  if (I.byteLength % 4) bufs.push(Buffer.alloc(4 - I.byteLength % 4));
}
for (const e of R.body) addMesh(e, 'body', -1, null);
for (const e of R.driver) addMesh(e, 'driver', -1, null);
const wheelMeta = clusters.map((cl, i) => {
  const c = toGame(cl.c);
  for (const e of cl.parts) addMesh(e, 'wheel', i, c);
  return { c: c.map(v => +v.toFixed(4)), r: +(cl.r * S).toFixed(4), i };
});
const gbox = arr => { const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9]; for (const e of arr) for (let i = 0; i < e.p.length; i += 3) { const g = toGame([e.p[i], e.p[i + 1], e.p[i + 2]]); for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], g[k]); mx[k] = Math.max(mx[k], g[k]); } } return { min: mn.map(v => +v.toFixed(3)), max: mx.map(v => +v.toFixed(3)) }; };
const meta = { v: 1, Q, name: opts.name || '', paint: opts.paint || null, credit: opts.credit || '', meshes, wheels: wheelMeta, driver: R.driver.length ? gbox(R.driver) : null, box: gbox(all) };
const hdr = Buffer.from(JSON.stringify(meta)); const pad = Buffer.alloc((4 - (hdr.length + 4) % 4) % 4, 32);
const len = Buffer.alloc(4); len.writeUInt32LE(hdr.length + pad.length);
const raw = Buffer.concat([len, hdr, pad, ...bufs]);
const gz = zlib.gzipSync(raw, { level: 9 });
fs.writeFileSync(outp, gz.toString('base64'));
console.log(opts.name, '| axis', ax ? 'z' : 'x', 'front', frontSign > 0 ? '+' : '-', '| wheelbase', wb.toFixed(1), 'LDU, scale', S.toFixed(4), '| b64', gz.toString('base64').length);
console.log(' wheels', JSON.stringify(wheelMeta.map(w => w.c)), 'r', wheelMeta[0].r, '| box', JSON.stringify(meta.box));
