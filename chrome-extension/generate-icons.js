const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const sourceIcon = path.join(__dirname, 'images', 'icon.svg');
const outputDir = path.join(__dirname, 'images');

// Assurez-vous que le répertoire de sortie existe
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Générer les icônes pour chaque taille
sizes.forEach(size => {
    sharp(sourceIcon)
        .resize(size, size)
        .toFile(path.join(outputDir, `icon${size}.png`))
        .then(() => console.log(`Generated ${size}x${size} icon`))
        .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
}); 