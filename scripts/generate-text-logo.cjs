const fs = require('fs');

const font = {
  'd': [
    '   ## ',
    '   ## ',
    ' #### ',
    '##  ##',
    '##  ##',
    '##  ##',
    ' #### '
  ],
  's': [
    ' #### ',
    '##    ',
    '##    ',
    ' #### ',
    '    ##',
    '    ##',
    ' #### '
  ],
  'a': [
    '      ',
    '      ',
    ' #### ',
    '    ##',
    ' #####',
    '##  ##',
    ' #### '
  ]
};

const text = 'dssa';
const letterSpacing = 2;
let currentX = 0;

let objStr = '';
let vIdx = 1;

for (let i = 0; i < text.length; i++) {
  const char = text[i];
  const grid = font[char];
  
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '#') {
        const cx = currentX + x;
        const cy = -y;
        const cz = 0;
        const s = 0.5;
        
        objStr += `v ${cx-s} ${cy-s} ${cz-s}\n`;
        objStr += `v ${cx+s} ${cy-s} ${cz-s}\n`;
        objStr += `v ${cx+s} ${cy+s} ${cz-s}\n`;
        objStr += `v ${cx-s} ${cy+s} ${cz-s}\n`;
        
        objStr += `v ${cx-s} ${cy-s} ${cz+s}\n`;
        objStr += `v ${cx+s} ${cy-s} ${cz+s}\n`;
        objStr += `v ${cx+s} ${cy+s} ${cz+s}\n`;
        objStr += `v ${cx-s} ${cy+s} ${cz+s}\n`;
        
        objStr += `f ${vIdx} ${vIdx+1} ${vIdx+2} ${vIdx+3}\n`;
        objStr += `f ${vIdx+7} ${vIdx+6} ${vIdx+5} ${vIdx+4}\n`;
        objStr += `f ${vIdx+3} ${vIdx+2} ${vIdx+6} ${vIdx+7}\n`;
        objStr += `f ${vIdx+4} ${vIdx+5} ${vIdx+1} ${vIdx}\n`;
        objStr += `f ${vIdx+1} ${vIdx+5} ${vIdx+6} ${vIdx+2}\n`;
        objStr += `f ${vIdx+4} ${vIdx} ${vIdx+3} ${vIdx+7}\n`;
        
        vIdx += 8;
      }
    }
  }
  currentX += font[char][0].length + letterSpacing;
}

fs.writeFileSync('dssa.obj', objStr);
console.log('Generated dssa.obj with text dssa');
