import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postsDir = path.join(__dirname, 'data/blog-posts');

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/š/g, 's')
    .replace(/đ/g, 'dj')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);
};

console.log('🔄 Počinjem migraciju slugova...');

fs.readdirSync(postsDir).forEach(file => {
  if (file.endsWith('.json')) {
    const filePath = path.join(postsDir, file);
    const data = fs.readFileSync(filePath, 'utf8');
    const post = JSON.parse(data);
    
    // Dodaj slug postojećim postovima
    if (!post.slug) {
      post.slug = generateSlug(post.title);
      fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
      console.log('✅ Dodan slug za:', post.title, '->', post.slug);
    } else {
      console.log('ℹ️ Post već ima slug:', post.slug);
    }
  }
});

console.log('🎉 Migracija završena!');