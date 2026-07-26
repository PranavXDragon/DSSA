const fs = require('fs');
const files = fs.readdirSync('public/media').filter(f => f.endsWith('.mp4'));

const pdata_path = 'public/assets/data/cms_projects.json';
const dpath = 'dist/assets/data/cms_projects.json';

const pdata = JSON.parse(fs.readFileSync(pdata_path, 'utf-8'));

['our-journey', 'our-vision', 'building-the-foundation'].forEach(slug => {
    const videos = files.filter(f => f.startsWith(slug)).sort();
    if (videos.length > 0) {
        const latest = videos[videos.length - 1];
        const ts = latest.split('-').pop().split('.')[0];
        console.log(`Setting ${slug} to ${latest}`);
        
        const item = pdata.find(x => x.slug === slug);
        if (item) {
            item.video = item.video || {};
            item.video.url = `/media/${latest}?v=${ts}`;
            item.video.filename = latest;
            item.video.thumbnail = `/media/${slug}-slideshow-thumbnail.jpg?v=${ts}`;
            item.image = `/media/${slug}-slideshow-thumbnail.jpg?v=${ts}`;
        }
    }
});

fs.writeFileSync(pdata_path, JSON.stringify(pdata, null, 2));
if (fs.existsSync(dpath)) {
    fs.writeFileSync(dpath, JSON.stringify(pdata, null, 2));
}
console.log("Done updating json.");
