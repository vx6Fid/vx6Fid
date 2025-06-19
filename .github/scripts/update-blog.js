const fs = require('fs');
const https = require('https');

const BLOG_API = 'https://portfolio-backend-az99.onrender.com/api/blogs/recent';
const BLOG_BASE_URL = 'https://vx6fid.vercel.app/blogs/';
const README_PATH = 'README.md';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatPosts(blogs) {
  return blogs
    .slice(0, 5)
    .map(blog => {
      const title = blog.title;
      const url = `${BLOG_BASE_URL}${blog.slug}`;
      const date = formatDate(blog.created_at);
      return `- [${title}](${url}) — ${date}`;
    })
    .join('\n');
}

function updateSection(content, startTag, endTag, newSection) {
  const pattern = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, 'gm');
  const replacement = `${startTag}\n${newSection}\n${endTag}`;
  return content.replace(pattern, replacement);
}

(async () => {
  try {
    const res = await fetchJSON(BLOG_API);
    const blogs = res.blogs || [];

    const readme = fs.readFileSync(README_PATH, 'utf8');
    const newList = formatPosts(blogs);

    const updated = updateSection(
      readme,
      '<!-- BLOG-POST-LIST:START -->',
      '<!-- BLOG-POST-LIST:END -->',
      newList
    );

    fs.writeFileSync(README_PATH, updated);
    console.log('-- :) -- README updated with recent blogs.');
  } catch (err) {
    console.error('-- :| -- Failed to update README:', err);
    process.exit(1);
  }
})();
