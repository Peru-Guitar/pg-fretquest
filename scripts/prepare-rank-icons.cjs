const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../../pg-web/node_modules/sharp');

async function main() {
    const root = path.resolve(__dirname, '..');
    const assets = JSON.parse(fs.readFileSync(path.join(root, 'design/ranks/frameless/generation.json'), 'utf8'));
    const sourceDir = path.join(root, 'design/ranks/frameless/originals');
    const outputDir = path.join(root, 'public/images/ranks');
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.mkdirSync(outputDir, { recursive: true });
    let before = 0;
    let after = 0;
    const selected = process.argv.slice(2);
    for (const asset of assets.filter(asset => selected.length === 0 || selected.includes(asset.slug))) {
        const original = path.join(sourceDir, `${asset.originalName ?? asset.slug}.png`);
        if (!fs.existsSync(original)) fs.copyFileSync(asset.source, original);
        const trimmed = await sharp(original).trim({ threshold: 15 }).toBuffer();
        const contentSize = asset.contentSize;
        const resized = await sharp(trimmed).resize(contentSize, contentSize, {
            fit: 'contain', background: '#00000000', withoutEnlargement: true,
        }).toBuffer();
        const output = path.join(outputDir, `${asset.outputName ?? `${asset.slug}-v2`}.webp`);
        // Compact silhouettes need less scale than long necks to have a similar visual weight.
        await sharp({ create: { width: 250, height: 250, channels: 4, background: '#00000000' } })
            .composite([{ input: resized, left: Math.floor((250 - contentSize) / 2), top: Math.floor((250 - contentSize) / 2) }])
            .webp({ quality: 85, alphaQuality: 100, effort: 6 }).toFile(output);
        const meta = await sharp(output).metadata();
        const stats = await sharp(output).stats();
        if (meta.format !== 'webp' || meta.width !== 250 || meta.height !== 250 || !meta.hasAlpha || stats.channels[3].min !== 0) {
            throw new Error(`Invalid transparent 250px WebP: ${asset.slug}`);
        }
        const bytes = fs.statSync(output).size;
        before += fs.statSync(original).size;
        after += bytes;
        console.log(`${asset.slug}: ${bytes} bytes; 250x250; alpha verified`);
    }
    console.log(`Total: ${before} original bytes -> ${after} WebP bytes (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
