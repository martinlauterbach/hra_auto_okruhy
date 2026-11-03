# Převod LDraw modelů do hry

Kostičková auta jsou v `index.html` uložená jako komprimovaná data
(`<script id="carRally">` a `<script id="carPolice">`). Tyto skripty je vyrobí z modelů ve složce `model/`.
Spouštěj je ze složky `tools`.

1. Zkopíruj model sem, např. `cp ../model/policie.ldr .`
2. `python3 fetchparts.py policie.ldr` stáhne jen potřebné díly LDraw do `lib/`
   (zdroj: zrcadlo knihovny LDraw na GitHubu, gkjohnson/ldraw-parts-library)
3. Jen pro model 1496: `python3 fixtilt.py` srovná díly pootočené o ~4° a uloží `car_fixed.mpd`
4. Three.js 0.160 rozbal do `three/` (`npm pack three@0.160.0` a rozbalit `package` jako `three`)
5. `python3 server.py &` a `node run3.js policie.ldr police` (potřebuje Playwright)
   načte model přes LDrawLoader, oddělí kola a panáčka a uloží `police_parts.json` a náhled `police_preview.png`
6. `node pack2.js police_parts.json police.b64 '{"name":"Policie","paint":null}'` vytvoří data,
   jejichž obsah se vloží do odpovídajícího `<script id="...">` v `index.html`.
   `paint` je barva kostek (hex z LDConfig), které se ve hře přebarví vybranou barvou vozu, nebo `null`.

Skript sám zjistí, podél které osy auto stojí a kde má předek (podle žlutých předních nebo červených
zadních světel). Kola pozná podle čísel dílů (pneumatiky a disky, seznam `WHEEL` v `convert3.html`),
panáčka podle dílů minifigurky (seznam `MINIFIG`). Modré průhledné kostky (Trans_Dark_Blue) ve hře blikají jako majáky.
Starší skripty `convert2.html`, `run2.js` a `pack.js` jsou původní verze jen pro model 1496.
