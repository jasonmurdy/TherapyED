import fs from 'fs';

const path = 'src/lib/puck.config.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace text to contentEditable
content = content.replace(/text: \{ type: "text" \}/g, 'text: { type: "text", contentEditable: true }');
content = content.replace(/title1: \{ type: "text" \}/g, 'title1: { type: "text", contentEditable: true }');
content = content.replace(/title2: \{ type: "text" \}/g, 'title2: { type: "text", contentEditable: true }');
content = content.replace(/tagline: \{ type: "text" \}/g, 'tagline: { type: "text", contentEditable: true }');
content = content.replace(/title: \{ type: "text" \}/g, 'title: { type: "text", contentEditable: true }');
content = content.replace(/subtitle: \{ type: "text" \}/g, 'subtitle: { type: "text", contentEditable: true }');
content = content.replace(/description: \{ type: "text" \}/g, 'description: { type: "text", contentEditable: true }');
content = content.replace(/quote: \{ type: "text" \}/g, 'quote: { type: "text", contentEditable: true }');

// replace textarea to contentEditable
content = content.replace(/content: \{ type: "textarea" \}/g, 'content: { type: "textarea", contentEditable: true }');
content = content.replace(/description: \{ type: "textarea" \}/g, 'description: { type: "textarea", contentEditable: true }');

fs.writeFileSync(path, content, 'utf8');
console.log('done');
