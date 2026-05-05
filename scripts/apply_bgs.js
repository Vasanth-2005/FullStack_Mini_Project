const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\Vasanth S\\.gemini\\antigravity\\brain\\d75ca982-ddcd-41ff-a47d-17a9c86367f5';
const destDir = path.join(__dirname, 'public', 'images');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy 10 Background Images
const files = fs.readdirSync(srcDir).filter(f => f.startsWith('bg') && f.endsWith('.png'));
files.sort(); // Sorting to keep some order

let idx = 1;
for (const file of files.slice(0, 10)) {
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(destDir, `bg${idx}.png`);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied AI Background: bg${idx}.png`);
    idx++;
}

// 2. Inject bg-slider.js into all HTML files natively
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
for (const htmlFile of htmlFiles) {
    const filePath = path.join(publicDir, htmlFile);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('bg-slider.js')) {
        content = content.replace('</body>', '    <script src="js/bg-slider.js"></script>\n</body>');
        fs.writeFileSync(filePath, content);
        console.log(`Injected Global Background Slider Engine into: ${htmlFile}`);
    }
}

console.log('Successfully completed injecting Aesthetic AI Backgrounds across entire Application!');
