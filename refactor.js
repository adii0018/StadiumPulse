const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'frontend/src/pages/FanCompanion.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Base theme
content = content.replace('bg-[#F5F7F4] text-[#12181B]', 'bg-concourse text-floodlight');

// 2. Translucent cards
content = content.replace(/glass-card-light/g, 'glass-card');

// 3. Backgrounds
content = content.replace(/bg-\[#F5F7F4\]/g, 'bg-white/5');
content = content.replace(/bg-white\b/g, 'bg-white/5');
content = content.replace(/backgroundColor: '#FFFFFF'/g, "backgroundColor: 'rgba(255, 255, 255, 0.05)'");
content = content.replace(/bg-white\/50/g, 'bg-white/10');

// 4. Text colors
content = content.replace(/text-concourse/g, 'text-floodlight');
content = content.replace(/text-\[#12181B\]/g, 'text-floodlight');
content = content.replace(/text-pitch\b/g, 'text-[#E8A33D]'); // Use signal-amber or white for contrast instead of dark green
content = content.replace(/text-pitch\//g, 'text-[#E8A33D]/'); // same for translucent
content = content.replace(/text-\[#1F6E43\]/g, 'text-[#E8A33D]'); // replace hardcoded dark green text
content = content.replace(/text-\[#1F6E43\]\/70/g, 'text-[#E8A33D]/70');

// 5. Borders
content = content.replace(/border-\[#1F6E43\]\/20/g, 'border-white/10');
content = content.replace(/border-pitch\/10/g, 'border-white/10');
content = content.replace(/border-pitch\/5/g, 'border-white/5');
content = content.replace(/border-pitch\/15/g, 'border-white/10');
content = content.replace(/border-pitch\/20/g, 'border-white/20');
content = content.replace(/border-pitch\/30/g, 'border-white/30');
content = content.replace(/focus:border-pitch/g, 'focus:border-white/50');

// 6. Placeholders
content = content.replace(/placeholder-concourse\/30/g, 'placeholder-floodlight/30');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('FanCompanion.tsx refactored successfully.');
