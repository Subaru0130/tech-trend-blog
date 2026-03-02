const fs = require('fs');
let content = fs.readFileSync('scripts/produce_from_blueprint.js', 'utf8');

// Add detectCategoryFromKeyword to the require statement
content = content.replace(
    "const { generateDefaultLabels, generateSitemap } = require('./lib/generator');",
    "const { generateDefaultLabels, generateSitemap, detectCategoryFromKeyword } = require('./lib/generator');"
);

fs.writeFileSync('scripts/produce_from_blueprint.js', content);
console.log("Fixed missing detectCategoryFromKeyword import in produce_from_blueprint.js");
