const fs = require('fs');

const files = [
    'app/api/vehicles/route.ts',
    'app/api/payments/route.ts',
    'app/api/owners/route.ts',
    'app/api/maintenance/route.ts',
    'app/api/expenses/route.ts',
    'app/api/expense-categories/route.ts',
    'app/api/clients/route.ts',
    'app/api/agents/route.ts'
];

for (const file of files) {
    const fullPath = 'd:/Proyectos de Programacion/SGFlota/' + file;
    let content = fs.readFileSync(fullPath, 'utf8');

    if (!content.includes('getServerSession')) {
        content = `import { getServerSession } from "next-auth/next";\nimport { authOptions } from "@/lib/auth";\n` + content;
    }

    content = content.replace(
        /const role = request\.headers\.get\(['"]x-user-role['"]\);\s*if \(role !== ['"]Admin['"]\)/g,
        `const session = await getServerSession(authOptions);\n        if (!session || session.user.role !== 'Admin')`
    );

    fs.writeFileSync(fullPath, content);
}
console.log('All API files patched securely.');
