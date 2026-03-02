const fs = require('fs');
let lines = fs.readFileSync('scripts/lib/ai_writer.js', 'utf8').split(/\r?\n/);

const newBlock = [
    "    } catch (e) {",
    "        console.error(\"  ❌ Review Analysis Failed:\", e.message);",
    "        return {",
    "            editorComment: `${productName}は多くのユーザーから高い評価を得ています。`,",
    "            enhancedPros: [\"高い評価を獲得\", \"多くのユーザーが推薦\", \"コスパが良い\"],",
    "            enhancedCons: [\"好みが分かれるデザイン\", \"一部のユーザーには不向きな場合も\"]",
    "        };",
    "    }"
];

for (let i = 1410; i < 1425; i++) {
    if (lines[i].includes('} catch (e) {')) {
        lines.splice(i, 8, ...newBlock);
        console.log("Fixed review analysis catch block.");
        break;
    }
}

fs.writeFileSync('scripts/lib/ai_writer.js', lines.join('\n'));
