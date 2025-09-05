const { writeFileSync } = require('fs');

const hostname = 'https://reformedchapter.com'; // <-- replace with your actual domain

// List of Bible books with number of chapters
const bibleBooks = [
  { name: 'genesis', chapters: 50 },
  { name: 'exodus', chapters: 40 },
  { name: 'leviticus', chapters: 27 },
  { name: 'numbers', chapters: 36 },
  { name: 'deuteronomy', chapters: 34 },
  { name: 'joshua', chapters: 24 },
  { name: 'judges', chapters: 21 },
  { name: 'ruth', chapters: 4 },
  { name: '1-samuel', chapters: 31 },
  { name: '2-samuel', chapters: 24 },
  { name: '1-kings', chapters: 22 },
  { name: '2-kings', chapters: 25 },
  { name: '1-chronicles', chapters: 29 },
  { name: '2-chronicles', chapters: 36 },
  { name: 'ezra', chapters: 10 },
  { name: 'nehemiah', chapters: 13 },
  { name: 'esther', chapters: 10 },
  { name: 'job', chapters: 42 },
  { name: 'psalms', chapters: 150 },
  { name: 'proverbs', chapters: 31 },
  { name: 'ecclesiastes', chapters: 12 },
  { name: 'song-of-solomon', chapters: 8 },
  { name: 'isaiah', chapters: 66 },
  { name: 'jeremiah', chapters: 52 },
  { name: 'lamentations', chapters: 5 },
  { name: 'ezekiel', chapters: 48 },
  { name: 'daniel', chapters: 12 },
  { name: 'hosea', chapters: 14 },
  { name: 'joel', chapters: 3 },
  { name: 'amos', chapters: 9 },
  { name: 'obadiah', chapters: 1 },
  { name: 'jonah', chapters: 4 },
  { name: 'micah', chapters: 7 },
  { name: 'nahum', chapters: 3 },
  { name: 'habakkuk', chapters: 3 },
  { name: 'zephaniah', chapters: 3 },
  { name: 'haggai', chapters: 2 },
  { name: 'zechariah', chapters: 14 },
  { name: 'malachi', chapters: 4 },
  { name: 'matthew', chapters: 28 },
  { name: 'mark', chapters: 16 },
  { name: 'luke', chapters: 24 },
  { name: 'john', chapters: 21 },
  { name: 'acts', chapters: 28 },
  { name: 'romans', chapters: 16 },
  { name: '1-corinthians', chapters: 16 },
  { name: '2-corinthians', chapters: 13 },
  { name: 'galatians', chapters: 6 },
  { name: 'ephesians', chapters: 6 },
  { name: 'philippians', chapters: 4 },
  { name: 'colossians', chapters: 4 },
  { name: '1-thessalonians', chapters: 5 },
  { name: '2-thessalonians', chapters: 3 },
  { name: '1-timothy', chapters: 6 },
  { name: '2-timothy', chapters: 4 },
  { name: 'titus', chapters: 3 },
  { name: 'philemon', chapters: 1 },
  { name: 'hebrews', chapters: 13 },
  { name: 'james', chapters: 5 },
  { name: '1-peter', chapters: 5 },
  { name: '2-peter', chapters: 3 },
  { name: '1-john', chapters: 5 },
  { name: '2-john', chapters: 1 },
  { name: '3-john', chapters: 1 },
  { name: 'jude', chapters: 1 },
  { name: 'revelation', chapters: 22 },
];

let urls = '';

// Home page
urls += `
  <url>
    <loc>${hostname}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

// Generate URL for each chapter
bibleBooks.forEach(book => {
  for (let i = 1; i <= book.chapters; i++) {
    urls += `
  <url>
    <loc>${hostname}/${book.name}/${i}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
});

// Wrap in <urlset>
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

// Write to public/sitemap.xml
writeFileSync('./public/sitemap.xml', sitemap);

console.log('Sitemap generated with all chapters!');
