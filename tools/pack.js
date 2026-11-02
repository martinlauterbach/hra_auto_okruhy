const fs = require('fs'), zlib = require('zlib');
const R = JSON.parse(fs.readFileSync('car_parts.json'));
const all = [...R.body, ...R.driver, ...R.wheels];
// front = where the trans-yellow lamps are
const cen = arr => { let s=[0,0,0], n=0; for (const e of arr) for (let i=0;i<e.p.length;i+=3){ s[0]+=e.p[i]; s[1]+=e.p[i+1]; s[2]+=e.p[i+2]; n++; } return s.map(v=>v/n); };
const lamps = all.filter(e => e.color === '#f5cd2f');
const cAll = cen(all), cL = cen(lamps);
const flip = cL[2] < cAll[2]; // want front at +z
// wheel centres
const wheelKeys = [...new Set(R.wheels.map(w => w.wheel))];
const bbox = arr => { const mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9]; for (const e of arr) for (let i=0;i<e.p.length;i+=3) for (let k=0;k<3;k++){ mn[k]=Math.min(mn[k],e.p[i+k]); mx[k]=Math.max(mx[k],e.p[i+k]); } return [mn,mx]; };
const tf = p => flip ? [-p[0], p[1], -p[2]] : p;
const wheels = wheelKeys.map(k => { const parts = R.wheels.filter(w => w.wheel === k); const tyre = parts.filter(w => w.color === '#1b2a34'); const [mn,mx] = bbox(parts); const [tmn,tmx] = bbox(tyre.length?tyre:parts); return { key:k, parts, c: tf([(mn[0]+mx[0])/2,(mn[1]+mx[1])/2,(mn[2]+mx[2])/2]), r: (tmx[1]-tmn[1])/2 }; });
const zs = wheels.map(w => w.c[2]); const zF = Math.max(...zs), zR = Math.min(...zs);
const wb = zF - zR;
const S = 2.7 / wb;                    // metres per LDU
const groundY = Math.min(...wheels.map(w => w.c[1] - w.r));
const xMid = wheels.reduce((s,w)=>s+w.c[0],0)/4;
const zOrigin = zR + wb * (1.42 / 2.72);  // rear axle at -1.42 m, front at +1.30 m like the physics model
const toGame = p => { const q = tf(p); return [(q[0]-xMid)*S, (q[1]-groundY)*S, (q[2]-zOrigin)*S]; };
const Q = 10000; // 0.1 mm
const meshes = []; const bufs = [];
function addMesh(e, kind, wheelIdx, center) {
  const map = new Map(); const pos = []; const nor = []; const idx = [];
  for (let i = 0; i < e.p.length; i += 3) {
    let g = toGame([e.p[i], e.p[i+1], e.p[i+2]]);
    if (center) g = [g[0]-center[0], g[1]-center[1], g[2]-center[2]];
    let n = [e.n[i], e.n[i+1], e.n[i+2]]; if (flip) n = [-n[0], n[1], -n[2]];
    const qp = g.map(v => Math.round(v * Q)), qn = n.map(v => Math.round(v * 127));
    const key = qp.join(',') + '|' + qn.join(',');
    let id = map.get(key);
    if (id === undefined) { id = pos.length / 3; map.set(key, id); pos.push(...qp); nor.push(...qn); }
    idx.push(id);
  }
  // flipping x and z keeps handedness (rotation by 180° about y), so winding stays valid
  const vc = pos.length / 3;
  const P = Int16Array.from(pos), N = Int8Array.from(nor);
  const I = vc < 65536 ? Uint16Array.from(idx) : Uint32Array.from(idx);
  meshes.push({ kind, wheel: wheelIdx, color: e.color, opacity: e.opacity, vc, ic: idx.length, i32: !(vc < 65536) });
  bufs.push(Buffer.from(P.buffer), Buffer.from(N.buffer), Buffer.from(new Uint8Array((4 - (N.byteLength % 4)) % 4).buffer), Buffer.from(I.buffer));
  if ((I.byteLength) % 4) bufs.push(Buffer.alloc(4 - I.byteLength % 4));
}
for (const e of R.body) addMesh(e, 'body', -1, null);
for (const e of R.driver) addMesh(e, 'driver', -1, null);
const wheelMeta = wheels.map((w, i) => { const c = toGame(w.c.map((v,k)=>v)); return { c: [0,0,0], r: w.r * S, i }; });
wheels.forEach((w, i) => {
  // centre in game coords: transform the untransformed centre
  const raw = flip ? [-w.c[0], w.c[1], -w.c[2]] : w.c;
  const c = toGame(raw);
  wheelMeta[i].c = c.map(v => +v.toFixed(4));
  for (const e of w.parts) addMesh(e, 'wheel', i, c);
});
// driver head (for the cockpit camera) = top part of the driver
const drv = R.driver.map(e => ({ p: e.p.map((v, k) => v) }));
let dmn=[1e9,1e9,1e9], dmx=[-1e9,-1e9,-1e9];
for (const e of R.driver) for (let i=0;i<e.p.length;i+=3){ const g=toGame([e.p[i],e.p[i+1],e.p[i+2]]); for(let k=0;k<3;k++){dmn[k]=Math.min(dmn[k],g[k]);dmx[k]=Math.max(dmx[k],g[k]);} }
let bmn=[1e9,1e9,1e9], bmx=[-1e9,-1e9,-1e9];
for (const e of all) for (let i=0;i<e.p.length;i+=3){ const g=toGame([e.p[i],e.p[i+1],e.p[i+2]]); for(let k=0;k<3;k++){bmn[k]=Math.min(bmn[k],g[k]);bmx[k]=Math.max(bmx[k],g[k]);} }
const meta = { v: 1, Q, meshes, wheels: wheelMeta, driver: { min: dmn.map(v=>+v.toFixed(3)), max: dmx.map(v=>+v.toFixed(3)) }, box: { min: bmn.map(v=>+v.toFixed(3)), max: bmx.map(v=>+v.toFixed(3)) }, credit: 'Model 1496 (LDraw): Robert Paciorek [bercik], podle Zoltank82; díly LDraw.org, CCAL 2.0' };
const hdr = Buffer.from(JSON.stringify(meta)); const pad = Buffer.alloc((4 - (hdr.length + 4) % 4) % 4, 32);
const len = Buffer.alloc(4); len.writeUInt32LE(hdr.length + pad.length);
const raw = Buffer.concat([len, hdr, pad, ...bufs]);
const gz = zlib.gzipSync(raw, { level: 9 });
fs.writeFileSync('car_brick.b64', gz.toString('base64'));
console.log('flip', flip, 'wheelbase LDU', wb.toFixed(1), 'scale', S.toFixed(4), 'raw', raw.length, 'gz', gz.length, 'b64', gz.toString('base64').length);
console.log('wheels', JSON.stringify(wheelMeta)); console.log('box', JSON.stringify(meta.box), 'driver', JSON.stringify(meta.driver));
console.log('meshes', meshes.length, 'verts', meshes.reduce((s,m)=>s+m.vc,0), 'tris', meshes.reduce((s,m)=>s+m.ic,0)/3);
