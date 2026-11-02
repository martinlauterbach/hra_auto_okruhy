# Převod LDraw modelu do hry

Kostičkový vůz je v `index.html` uložený jako komprimovaná data (`<script id="brickCar">`).
Tyto skripty ho vyrobí z `model/1496-1.mpd`. Spouštěj je ze složky `tools`.

1. `cp ../model/1496-1.mpd .` (skripty čekají model v aktuální složce)
2. `python3 fetchparts.py` stáhne jen potřebné díly LDraw do `lib/`
   (zdroj: zrcadlo knihovny LDraw na GitHubu, gkjohnson/ldraw-parts-library)
3. `python3 fixtilt.py` srovná díly pootočené o ~4° a uloží `car_fixed.mpd`
4. Three.js 0.160 rozbal do `three/` (`npm pack three@0.160.0` a rozbalit `package` jako `three`)
5. `python3 server.py &` a `node run2.js` (potřebuje Playwright) načte model přes LDrawLoader,
   oddělí kola a řidiče a uloží `car_parts.json` a náhled `preview.png`
6. `node pack.js` vytvoří `car_brick.b64`, jehož obsah se vloží do `<script id="brickCar">` v `index.html`

Pro jiný model stačí vyměnit soubor `.mpd` v krocích 1–3. Skripty počítají s tím, že kola tvoří díly
3641 (pneumatika) a 4624 (disk) a řidič je v podsouboru, jehož název obsahuje „driver“.
