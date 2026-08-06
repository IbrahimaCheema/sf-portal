import fs from 'fs';

const content = fs.readFileSync('C:\\Users\\ibrah\\.gemini\\antigravity-ide\\brain\\d237c43b-0cc7-4528-8e1e-ce58247e42a9\\.system_generated\\steps\\773\\content.md', 'utf-8');

const regex = /<h3[^>]*><span[^>]*>(.*?)<\/span><\/h3>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?(?:<ul class="wpb_image_grid_ul">([\s\S]*?)<\/ul>)?/g;

// Let's parse all h3 spans:
const h3Regex = /<h3[^>]*><span[^>]*>(.*?)<\/span><\/h3>/g;
let match;
const titles = [];
while ((match = h3Regex.exec(content)) !== null) {
  if (!titles.includes(match[1].trim())) {
    titles.push(match[1].trim());
  }
}

console.log(`Found ${titles.length} unique campaigns:`);
console.log(JSON.stringify(titles, null, 2));
