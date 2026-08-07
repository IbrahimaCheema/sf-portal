const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const projectDir = path.resolve(__dirname, '..');
const campaignsJsonPath = path.join(projectDir, 'src', 'data', 'campaigns.json');
const uploadsDir = 'C:\\Users\\ibrah\\Downloads\\sf-uploads\\uploads';
const targetDir = path.join(projectDir, 'public', 'images', 'campaigns', 'gallery');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Read old JSON before WP links were removed
const oldData = JSON.parse(cp.execSync('git show HEAD~1:src/data/campaigns.json', { cwd: projectDir }).toString());

let copiedCount = 0;

oldData.forEach(c => {
  if (c.gallery && c.gallery.length > 0) {
    const newGallery = [];
    const newLocalGallery = [];

    c.gallery.forEach((url, i) => {
      if (url.includes('wp-content/uploads/')) {
        const relPath = url.split('wp-content/uploads/')[1];
        const srcPath = path.join(uploadsDir, relPath.replace(/\//g, path.sep));
        const ext = path.extname(srcPath).toLowerCase() || '.jpg';
        const fileName = `${c.id}_${i + 1}${ext}`;
        const destPath = path.join(targetDir, fileName);

        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          copiedCount++;
          newGallery.push(`https://docs.sf.org.pk/images/campaigns/gallery/${fileName}`);
          newLocalGallery.push(`/images/campaigns/gallery/${fileName}`);
        }
      } else {
        newGallery.push(url);
        newLocalGallery.push(url);
      }
    });

    c.gallery = newGallery;
    c.localGallery = newLocalGallery;
  }
});

fs.writeFileSync(campaignsJsonPath, JSON.stringify(oldData, null, 2));
console.log(`Successfully copied ${copiedCount} gallery images to ${targetDir} and updated campaigns.json!`);
