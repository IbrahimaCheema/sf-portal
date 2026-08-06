import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });

// Create a high-res SVG string for Adult Literacy Beneficiaries Growth Chart
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" width="1200" height="700">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#003300"/>
      <stop offset="100%" stop-color="#001a00"/>
    </linearGradient>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffa735"/>
      <stop offset="100%" stop-color="#008000"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="700" rx="16" fill="url(#bgGrad)"/>

  <!-- Top Title -->
  <text x="600" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffa735" letter-spacing="2">SHAKARGANJ FOUNDATION - EDUCATION IMPACT</text>
  <text x="600" y="115" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#ffffff">Adult Literacy Beneficiaries Growth (2019 – 2024)</text>
  <text x="600" y="145" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#d0e0d0">Annual progression of female adult literacy center graduates in District Jhang</text>

  <!-- Grid Lines -->
  <line x1="120" y1="200" x2="1100" y2="200" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="6,6"/>
  <text x="100" y="205" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#a0b5a0">8,000</text>

  <line x1="120" y1="280" x2="1100" y2="280" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="6,6"/>
  <text x="100" y="285" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#a0b5a0">6,000</text>

  <line x1="120" y1="360" x2="1100" y2="360" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="6,6"/>
  <text x="100" y="365" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#a0b5a0">4,000</text>

  <line x1="120" y1="440" x2="1100" y2="440" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="6,6"/>
  <text x="100" y="445" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#a0b5a0">2,000</text>

  <line x1="120" y1="520" x2="1100" y2="520" stroke="#ffffff" stroke-opacity="0.2"/>
  <text x="100" y="525" text-anchor="end" font-family="Arial, sans-serif" font-size="13" fill="#a0b5a0">0</text>

  <!-- Bars & Data -->
  <!-- 2019: 1,250 -> height 50px -->
  <g transform="translate(190, 0)" filter="url(#shadow)">
    <text x="35" y="460" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffa735">1,250</text>
    <rect x="10" y="470" width="50" height="50" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2019</text>
  </g>

  <!-- 2020: 2,100 -> height 84px -->
  <g transform="translate(350, 0)" filter="url(#shadow)">
    <text x="35" y="426" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffa735">2,100</text>
    <rect x="10" y="436" width="50" height="84" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2020</text>
  </g>

  <!-- 2021: 3,450 -> height 138px -->
  <g transform="translate(510, 0)" filter="url(#shadow)">
    <text x="35" y="372" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffa735">3,450</text>
    <rect x="10" y="382" width="50" height="138" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2021</text>
  </g>

  <!-- 2022: 4,800 -> height 192px -->
  <g transform="translate(670, 0)" filter="url(#shadow)">
    <text x="35" y="318" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffa735">4,800</text>
    <rect x="10" y="328" width="50" height="192" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2022</text>
  </g>

  <!-- 2023: 6,200 -> height 248px -->
  <g transform="translate(830, 0)" filter="url(#shadow)">
    <text x="35" y="262" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffa735">6,200</text>
    <rect x="10" y="272" width="50" height="248" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2023</text>
  </g>

  <!-- 2024: 7,500+ -> height 300px -->
  <g transform="translate(990, 0)" filter="url(#shadow)">
    <text x="35" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" font-weight="extrabold" fill="#ffa735">7,500+</text>
    <rect x="10" y="220" width="50" height="300" rx="8" fill="url(#barGrad)"/>
    <text x="35" y="555" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">2024</text>
  </g>

  <!-- Footer Legend -->
  <rect x="120" y="605" width="960" height="50" rx="10" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="160" cy="630" r="8" fill="#ffa735"/>
  <text x="180" y="635" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">Total Female Literacy Beneficiaries Graduated</text>
  <text x="1060" y="635" text-anchor="end" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#ffa735">Shakarganj Foundation Official Metrics</text>
</svg>`;

fs.mkdirSync('public/images/whyedu', { recursive: true });
fs.writeFileSync('public/images/whyedu/adult_literacy_growth_chart.svg', svgContent);

async function upload() {
  const r2Key = 'images/whyedu/adult_literacy_growth_chart.svg';
  await s3.send(new PutObjectCommand({ 
    Bucket: 'sf-uploads', 
    Key: r2Key, 
    Body: Buffer.from(svgContent), 
    ContentType: 'image/svg+xml' 
  }));
  console.log(`✓ Uploaded HD Graph SVG to R2: https://docs.sf.org.pk/${r2Key}`);
}

upload();
