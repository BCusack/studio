const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

(async () => {
  try {
    const outDir = path.join(__dirname, '..', 'public');
    await fs.mkdirp(outDir);

    // SVG derived from src/components/logo.tsx
    // Replace currentColor with a fixed color for the favicon.
    const svg = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        <rect width="24" height="24" fill="transparent" />
        <circle cx="12" cy="12" r="9" stroke="#00FFFF" stroke-width="1.5" fill="none" />
        <line x1="12" y1="21" x2="12" y2="12" stroke="#00FFFF" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    `;

    const pngSizes = [16, 32, 48, 64, 180];
    const pngPaths = [];

    for (const size of pngSizes) {
      const pngPath = path.join(outDir, `favicon-${size}.png`);
      await sharp(Buffer.from(svg))
        .resize(size, size, { fit: 'contain' })
        .png({ compressionLevel: 9 })
        .toFile(pngPath);
      pngPaths.push(pngPath);
      console.log('Wrote', pngPath);
    }

  const icoInput = pngPaths.filter(p => /favicon-(16|32|48)\.png$/.test(p));
  // png-to-ico may export the function as default depending on environment.
  const pngToIcoFn = (typeof pngToIco === 'function') ? pngToIco : (pngToIco && typeof pngToIco.default === 'function') ? pngToIco.default : null;
  if (!pngToIcoFn) throw new Error('png-to-ico function not found');
  const icoBuffer = await pngToIcoFn(icoInput);
    const icoPath = path.join(outDir, 'favicon.ico');
    await fs.writeFile(icoPath, icoBuffer);
    console.log('Wrote', icoPath);

    const applePng = path.join(outDir, 'apple-touch-icon.png');
    await sharp(Buffer.from(svg))
      .resize(180, 180)
      .png()
      .toFile(applePng);
    console.log('Wrote', applePng);

    console.log('Done.');
  } catch (err) {
    console.error('Error generating favicons', err);
    process.exit(1);
  }
})();
