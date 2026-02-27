const fs = require('fs');
const path = require('path');

// Controllers that need all GET endpoints to be public
const publicsNeeded = [
    'src/modules/state/state.controller.ts',
    'src/modules/district/district.controller.ts',
    'src/modules/qualification/qualification.controller.ts',
    'src/modules/stream-branch/stream-branch.controller.ts',
    'src/modules/institute-type/institute-type.controller.ts',
    'src/modules/institute-ownership-type/institute-ownership-type.controller.ts',
    'src/modules/institute-qualification-mapping/institute-qualification-mapping.controller.ts',
];

for (const rel of publicsNeeded) {
    const fp = path.resolve(__dirname, rel);
    if (!fs.existsSync(fp)) { console.log('MISSING:', fp); continue; }
    let content = fs.readFileSync(fp, 'utf-8');

    // Skip if already has @Public import
    if (!content.includes("public.decorator")) {
        // Add import after first import line
        content = content.replace(
            /^(import .+;\r?\n)/m,
            `$1import { Public } from '../../auth/public.decorator';\n`
        );
    }

    // Add @Public() before every @Get() that doesn't already have it
    content = content.replace(/(?<!@Public\(\)\r?\n\s*)(@Get\()/g, (match, p1, offset, str) => {
        const before = str.slice(Math.max(0, offset - 30), offset);
        if (before.includes('@Public()')) return match;
        return `@Public()\n    ${p1}`;
    });

    fs.writeFileSync(fp, content, 'utf-8');
    console.log('Updated:', rel);
}
console.log('Done!');
