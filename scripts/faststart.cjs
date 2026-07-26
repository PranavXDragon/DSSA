const fs = require('fs');
const { execSync } = require('child_process');
const imageio = 'C:\\Users\\prana\\AppData\\Roaming\\Python\\Python311\\site-packages\\imageio_ffmpeg\\binaries\\ffmpeg-win-x86_64-v7.1.exe';

const dirs = ['public/media', 'dist/media'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const mp4s = fs.readdirSync(dir).filter(f => f.endsWith('.mp4')).map(f => dir + '/' + f);
    mp4s.forEach(f => {
        try {
            console.log('Optimizing ' + f);
            execSync(`"${imageio}" -y -i "${f}" -c copy -movflags +faststart "${f}.tmp.mp4"`, {stdio: 'ignore'});
            fs.renameSync(`${f}.tmp.mp4`, f);
            console.log(' -> Optimized ' + f);
        } catch (e) {
            console.log(' -> Failed ' + f + ': ' + e.message);
        }
    });
});
