const fs = require('fs');
const path = require('path');
const logPath = 'c:\\\\Users\\\\DEADLIGHT\\\\.gemini\\\\antigravity-ide\\\\brain\\\\6b7f9f01-b981-46ff-a435-cdbc6b23ea55\\\\.system_generated\\\\logs\\\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
let originalContent = '';

for (const line of lines) {
  if (!line) continue;
  try {
    const step = JSON.parse(line);
    if (step.type === 'TOOL_RESPONSE' && step.content && step.content.includes('Showing lines 1 to 750')) {
      originalContent = step.content;
      break;
    }
  } catch(e) {}
}

if (originalContent) {
  // The content has a header, then the lines format: `<line_number>: <original_line>`
  // We need to extract just the lines.
  const contentLines = originalContent.split('\n');
  const extractedLines = [];
  let inCode = false;
  
  for (const cLine of contentLines) {
    if (cLine.startsWith('1: ')) {
      inCode = true;
    }
    if (inCode) {
      // match "123: content"
      const match = cLine.match(/^(\d+):\s(.*)$/);
      if (match) {
        extractedLines.push(match[2]);
      } else if (cLine.match(/^\d+:$/)) {
        // empty line
        extractedLines.push('');
      } else {
        // stop if no match after we started (might be the footer)
        if (cLine.includes('The above content')) break;
      }
    }
  }

  const newContent = extractedLines.join('\n');
  fs.writeFileSync('lib/api-client.ts', newContent);
  console.log('Recovered ' + extractedLines.length + ' lines.');
} else {
  console.log('Not found');
}
