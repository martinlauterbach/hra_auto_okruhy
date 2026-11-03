# Apex Okruhy

3D závodní hra v prohlížeči (Three.js), jeden soubor `index.html`.

- 10 okruhů generovaných z kontrolních bodů (Catmull-Rom křivky)
- tři vozy: kostičková Rallye (LDraw 1496) a Policie (7236) a low-poly sportovní, fyzika s modelem pneumatik, automatická převodovka
- ovládání: náklon (iPad), dotyk, DualSense přes Gamepad API, klávesnice
- časomíra kol, duch nejlepšího kola, minimapa, zvuk motoru
- čtyři úrovně jízdy (Nejlehčí, Dětská, Normální, Realistická) a volitelný automatický plyn
- nastavitelná citlivost náklonu (1–10), automatické vycentrování na startu
- vlastní přiřazení tlačítek a páček ovladače (ukládá se v prohlížeči)
- kamery: za autem, kokpit s otáčejícím se volantem, z kapoty

## Spuštění

Na Macu stačí otevřít `index.html` v Safari nebo Chrome.

Ovládání nakloněním na iPadu vyžaduje HTTPS. Soubor proto nahraj třeba na
Netlify Drop (app.netlify.com/drop) nebo GitHub Pages, otevři adresu v Safari
a přidej ji na plochu.

## Ovládání

- Klávesnice: šipky / WASD, mezerník ruční brzda, C kamera (také tlačítko Kamera na obrazovce), R zpět na trať, P pauza
- Ovladač: levá páčka (osa 1) nahoru plyn, dolů brzda, pravá páčka (osa 2) řízení, ✕ ruční brzda, △ kamera, ○ zpět na trať, Options pauza (výchozí, lze změnit v menu)

## Kostičková auta

- Rallye: `model/1496-1.mpd` z LDraw.org (autor Robert Paciorek [bercik], podle Zoltank82), licence CCAL 2.0.
- Policie: `model/policie.ldr`, sada 7236 (autor Victor Di Rienzo [tatubias]).

Díly z knihovny LDraw.org. Postup převodu do hry je v `tools/README.md`.
