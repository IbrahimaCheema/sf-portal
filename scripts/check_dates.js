import fs from 'fs';

const campaigns = JSON.parse(fs.readFileSync('src/data/campaigns.json', 'utf-8'));

const missing = [];
campaigns.forEach(c => {
  if (!c.date) {
    missing.push({ id: c.id, title: c.title, desc: c.fullDesc });
  }
});

console.log(`Campaigns missing date: ${missing.length} out of ${campaigns.length}`);
missing.forEach(m => console.log(`- ${m.title}: "${m.desc.substring(0, 100)}..."`));
