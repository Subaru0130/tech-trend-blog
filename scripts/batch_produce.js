/**
 * 🏭 Batch Article Producer
 * 
 * 全ブループリントファイルから未生成の記事を自動検出し、順番に生成する。
 * 503エラーで失敗してもスキップして次に進む（後で --use-cache で個別リトライ可）。
 * 
 * Usage:
 *   node scripts/batch_produce.js                                     # 全ブループリント
 *   node scripts/batch_produce.js SITUATION_BLUEPRINTS_オフィスチェア.json  # 特定ファイルのみ
 *   node scripts/batch_produce.js --force-reviews                     # レビューも強制再生成
 *   node scripts/batch_produce.js --use-cache                         # キャッシュがあればスクレイピングスキップ
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { keywordToEnglishSlug } = require('./lib/generator');

const ROOT = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT, 'src', 'content', 'articles');

// Parse arguments
const args = process.argv.slice(2);
const FORCE_REVIEWS = args.includes('--force-reviews');
const USE_CACHE = args.includes('--use-cache');
const specificFile = args.find(a => a.endsWith('.json'));

// Cache directory
const CACHE_DIR = path.join(ROOT, '.cache');

// Find all blueprint files
function findBlueprintFiles() {
    const files = fs.readdirSync(ROOT)
        .filter(f => f.startsWith('SITUATION_BLUEPRINTS_') && f.endsWith('.json'))
        .filter(f => !f.includes('backup') && !f.includes('before') && !f.includes('old'));
    return files;
}

// Check if article already exists AND has proper content quality
function articleExists(keyword) {
    const slug = keywordToEnglishSlug(keyword);
    const articlePath = path.join(ARTICLES_DIR, `${slug}.md`);

    if (!fs.existsSync(articlePath)) return false;

    const content = fs.readFileSync(articlePath, 'utf-8');
    // Check for explicit error messages
    if (content.includes('AI生成に失敗しました') || content.includes('レビュー生成に失敗しました')) {
        return false;
    }
    // Check minimum content size
    if (content.length < 2000) {
        return false;
    }
    // Check structural quality: proper articles have multiple h2/h3 headings
    const h2Count = (content.match(/^## /gm) || []).length;
    const h3Count = (content.match(/^### /gm) || []).length;
    if (h2Count < 2 || h3Count < 5) {
        return false; // Missing sections (ranking, pros/cons, etc.)
    }
    return true;
}

// Check if scraping cache exists for a keyword
function hasCacheFor(keyword) {
    const cacheSlug = keyword.replace(/\s+/g, '_');
    const cachePath = path.join(CACHE_DIR, `${cacheSlug}.json`);
    return fs.existsSync(cachePath);
}

// Run produce_from_blueprint.js for a single keyword
async function produceArticle(blueprintFile, keyword) {
    let extraArgs = FORCE_REVIEWS ? ' --force-reviews' : '';

    // Auto-detect cache: use --use-cache if flag is set AND cache exists
    const hasCache = hasCacheFor(keyword);
    if (USE_CACHE && hasCache) {
        extraArgs += ' --use-cache';
        console.log(`   💾 Cache found, will skip scraping`);
    } else if (USE_CACHE && !hasCache) {
        console.log(`   ⚠️ No cache for "${keyword}", will do full scrape`);
    }

    const cmd = `node scripts/produce_from_blueprint.js "${blueprintFile}" "${keyword}"${extraArgs}`;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 Generating: "${keyword}"`);
    console.log(`   Blueprint: ${blueprintFile}`);
    console.log(`   Command: ${cmd}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
        execSync(cmd, {
            cwd: ROOT,
            stdio: 'inherit',
            timeout: 30 * 60 * 1000, // 30 minute timeout per article
            env: { ...process.env }
        });
        return { keyword, status: 'SUCCESS' };
    } catch (error) {
        const errStr = error.stderr?.toString() || error.message || '';
        const isQuota = errStr.includes('QUOTA EXHAUSTED') || errStr.includes('quota exceeded') || errStr.includes('429');

        if (isQuota) {
            console.error(`\n🚫 QUOTA EXHAUSTED for: "${keyword}"`);
            return { keyword, status: 'QUOTA_EXHAUSTED' };
        }

        console.error(`\n❌ FAILED: "${keyword}" - ${error.message?.slice(0, 100)}`);
        return { keyword, status: 'FAILED', error: error.message?.slice(0, 200) };
    }
}

// Main
async function main() {
    console.log('🏭 Batch Article Producer');
    console.log('========================\n');

    // Find blueprint files
    const blueprintFiles = specificFile ? [specificFile] : findBlueprintFiles();
    console.log(`📂 Blueprint files found: ${blueprintFiles.length}`);
    blueprintFiles.forEach(f => console.log(`   - ${f}`));

    // Collect all keywords and check which need generation
    const tasks = [];

    for (const file of blueprintFiles) {
        const filePath = path.join(ROOT, file);
        if (!fs.existsSync(filePath)) {
            console.log(`   ⚠️ File not found: ${file}`);
            continue;
        }

        const blueprints = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`\n📋 ${file}: ${blueprints.length} keywords`);

        for (const entry of blueprints) {
            const keyword = entry.keyword;
            const slug = keywordToEnglishSlug(keyword);
            const exists = articleExists(keyword);

            if (exists) {
                console.log(`   ✅ ${keyword} → ${slug}.md (exists, skipping)`);
            } else {
                console.log(`   📝 ${keyword} → ${slug}.md (NEEDS GENERATION)`);
                tasks.push({ file, keyword });
            }
        }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📊 Summary: ${tasks.length} articles to generate`);
    console.log(`   Estimated time: ${Math.round(tasks.length * 17.5 / 60)} hours (${tasks.length} × ~17.5 min)`);
    if (FORCE_REVIEWS) console.log(`   🔄 --force-reviews: Review pages will be regenerated`);
    if (USE_CACHE) {
        const cachedCount = tasks.filter(t => hasCacheFor(t.keyword)).length;
        console.log(`   💾 --use-cache: ${cachedCount}/${tasks.length} have cached data (scraping skip)`);
    }
    console.log(`${'='.repeat(80)}\n`);

    if (tasks.length === 0) {
        console.log('✅ All articles already exist! Nothing to do.');
        return;
    }

    // Process each task sequentially
    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const elapsed = Date.now() - startTime;
        const avgTime = i > 0 ? elapsed / i : 17.5 * 60 * 1000;
        const remaining = Math.round((tasks.length - i) * avgTime / 60000);

        console.log(`\n📦 [${i + 1}/${tasks.length}] Next: "${task.keyword}" (Est. remaining: ${remaining} min)`);

        const result = await produceArticle(task.file, task.keyword);

        // Quota exhausted: stop batch completely
        if (result.status === 'QUOTA_EXHAUSTED') {
            console.log(`\n🛑 QUOTA EXHAUSTED — Stopping batch.`);
            console.log(`   Completed: ${results.filter(r => r.status === 'SUCCESS').length} articles`);
            const remaining = tasks.slice(i);
            console.log(`   Remaining: ${remaining.length} articles:`);
            remaining.forEach(t => console.log(`     - ${t.keyword}`));
            console.log(`\n   Re-run tomorrow with --use-cache to continue:`);
            console.log(`   node scripts/batch_produce.js ${specificFile || ''} --use-cache`);
            break;
        }

        results.push(result);

        // Brief pause between articles to avoid API throttling
        if (i < tasks.length - 1 && result.status === 'SUCCESS') {
            console.log(`\n⏳ Waiting 30s before next article...`);
            await new Promise(r => setTimeout(r, 30000));
        }
    }

    // Final Summary
    const totalTime = Math.round((Date.now() - startTime) / 60000);
    const successes = results.filter(r => r.status === 'SUCCESS');
    const failures = results.filter(r => r.status === 'FAILED');

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏁 BATCH COMPLETE`);
    console.log(`${'='.repeat(80)}`);
    console.log(`   Total time: ${totalTime} minutes`);
    console.log(`   ✅ Success: ${successes.length}`);
    console.log(`   ❌ Failed:  ${failures.length}`);

    if (failures.length > 0) {
        console.log(`\n   Failed articles (retry with --use-cache):`);
        failures.forEach(f => {
            console.log(`   ❌ ${f.keyword}`);
        });
    }

    console.log(`\n${'='.repeat(80)}\n`);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
