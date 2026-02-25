const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const apiDir = path.join(__dirname, '../app/api');

walkDir(apiDir, function (filePath) {
    if (filePath.endsWith('route.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('force-dynamic')) {
            console.log('Patching:', filePath);
            // Insert after imports
            // Find last import
            const lastImportIdx = content.lastIndexOf('import ');
            const lastImportEnd = content.indexOf('\n', lastImportIdx);

            let newContent;
            if (lastImportIdx === -1) {
                newContent = "export const dynamic = 'force-dynamic';\n\n" + content;
            } else {
                const insertPos = lastImportEnd + 1;
                newContent = content.slice(0, insertPos) + "\nexport const dynamic = 'force-dynamic';\n" + content.slice(insertPos);
            }

            fs.writeFileSync(filePath, newContent);
        }
    }
});
