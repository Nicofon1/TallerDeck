const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outDir = path.join(__dirname, 'slides 2', 'assets', 'previews');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const paginas = [
  { id: 'contexto', url: 'http://localhost:8000/presentacion/contexto.html' },
  { id: 'problema', url: 'http://localhost:8000/presentacion/problema.html' },
  { id: 'journey', url: 'http://localhost:8000/presentacion/journey.html' },
  { id: 'timeline', url: 'http://localhost:8000/presentacion/timeline.html' },
  { id: 'cinetica', url: 'http://localhost:8000/slides 2/page2.html' },
  // La investigación vive en el estante: su miniatura sale de ahí.
  { id: 'biblioteca', url: 'http://localhost:8000/slides 2/index.html' }
];

for (const p of paginas) {
  const outFile = path.join(outDir, `${p.id}.png`);
  console.log(`Capturando ${p.id}...`);
  const res = spawnSync(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1280,800',
    `--screenshot=${outFile}`,
    p.url
  ], { timeout: 15000 });

  if (fs.existsSync(outFile)) {
    console.log(`OK: ${p.id}.png (${fs.statSync(outFile).size} bytes)`);
  } else {
    console.error(`FALLO: ${p.id}`);
  }
}
