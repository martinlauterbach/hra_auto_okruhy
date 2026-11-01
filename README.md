# Apex Okruhy

3D závodní hra v prohlížeči (Three.js), jeden soubor `index.html`.

- 10 okruhů generovaných z kontrolních bodů (Catmull-Rom křivky)
- low-poly model auta, fyzika s modelem pneumatik, automatická převodovka
- ovládání: náklon (iPad), dotyk, DualSense přes Gamepad API, klávesnice
- časomíra kol, duch nejlepšího kola, minimapa, zvuk motoru

## Spuštění

Na Macu stačí otevřít `index.html` v Safari nebo Chrome.

Ovládání nakloněním na iPadu vyžaduje HTTPS. Soubor proto nahraj třeba na
Netlify Drop (app.netlify.com/drop) nebo GitHub Pages, otevři adresu v Safari
a přidej ji na plochu.

## Ovládání

- Klávesnice: šipky / WASD, mezerník ruční brzda, C kamera, R zpět na trať, P pauza
- DualSense: R2 plyn, L2 brzda, levá páčka řízení, ✕ ruční brzda, △ kamera, ○ zpět na trať, Options pauza
