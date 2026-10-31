const fs = require('node:fs');
const path = require('node:path');
const sharp = require('../../pg-web/node_modules/sharp');

async function main() {
    const root = path.resolve(__dirname, '..');
    const assets = JSON.parse(fs.readFileSync(path.join(root, 'design/ranks/generation.json'), 'utf8'));
    const outputDir = path.join(root, 'public/images/ranks');
    const sourceDir = path.join(root, 'design/ranks/originals');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(sourceDir, { recursive: true });
    let before = 0;
    let after = 0;
    for (const asset of assets) {
        const original = path.join(sourceDir, `${asset.slug}.png`);
        if (!fs.existsSync(original)) fs.copyFileSync(asset.source, original);
        const output = path.join(outputDir, `${asset.slug}.webp`);
        // Normalize the visible silhouette, keeping identical padding on every badge.
        const trimmed = await sharp(original).trim({ threshold: 10 }).toBuffer();
        await sharp(trimmed)
            .resize(240, 240, { fit: 'contain', background: '#00000000', withoutEnlargement: true })
            .extend({ top: 5, bottom: 5, left: 5, right: 5, background: '#00000000' })
            .webp({ quality: 85, alphaQuality: 100, effort: 6 })
            .toFile(output);
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
    console.log(`Total: ${before} source bytes -> ${after} WebP bytes (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
