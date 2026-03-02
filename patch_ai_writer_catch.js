const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

for (let i = 490; i < 520; i++) {
    if (lines[i].includes('catch (e) {')) {
        lines.splice(i, 4,
            "    } catch (e) {",
            "        console.error(\"  ❌ AI Generation Failed:\", e);",
            "        return \"AI生成に失敗しました。\";",
            "    }"
        );
        console.log(`Replaced catch block near line ${i}`);
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
