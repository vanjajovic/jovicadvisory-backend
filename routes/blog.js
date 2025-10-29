import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogPostsDir = path.join(__dirname, '../data/blog-posts');

const router = express.Router();
const ADMIN_PASSWORD = 'jovic2024';

// Osiguraj da folder postoji
const ensureBlogPostsDir = () => {
  if (!fs.existsSync(blogPostsDir)) {
    fs.mkdirSync(blogPostsDir, { recursive: true });
    console.log('📁 Kreiran blog-posts folder');
  }
};

// Generiši slug od naslova
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
    .substring(0, 50); // Ograniči dužinu
};

// Učitaj sve blog postove
const loadAllPosts = () => {
  ensureBlogPostsDir();
  
  try {
    const files = fs.readdirSync(blogPostsDir);
    const posts = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(blogPostsDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(data);
        posts.push(post);
      }
    }
    
    // Sortiraj po datumu (najnoviji prvi)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    console.log(`📖 Učitano ${posts.length} blog postova`);
    return posts;
  } catch (error) {
    console.error('❌ Greška pri učitavanju postova:', error);
    return [];
  }
};

// Učitaj pojedinačni post po slug-u
const loadPostBySlug = (slug) => {
  try {
    const files = fs.readdirSync(blogPostsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(blogPostsDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const post = JSON.parse(data);
        
        if (post.slug === slug) {
          return post;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`❌ Greška pri učitavanju posta ${slug}:`, error);
    return null;
  }
};

// Učitaj pojedinačni post po ID-u
const loadPost = (postId) => {
  try {
    const filePath = path.join(blogPostsDir, `${postId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`❌ Greška pri učitavanju posta ${postId}:`, error);
    return null;
  }
};

// Sačuvaj post
const savePost = (post) => {
  ensureBlogPostsDir();
  
  try {
    const filePath = path.join(blogPostsDir, `${post.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
    console.log(`💾 Sačuvan post: ${post.title} (Slug: ${post.slug})`);
    return true;
  } catch (error) {
    console.error('❌ Greška pri čuvanju posta:', error);
    return false;
  }
};

// Obriši post
const deletePost = (postId) => {
  try {
    const filePath = path.join(blogPostsDir, `${postId}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Obrisan post: ${postId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Greška pri brisanju posta:', error);
    return false;
  }
};

// Generiši novi ID
const generateNewId = () => {
  const posts = loadAllPosts();
  if (posts.length === 0) return 1;
  
  const maxId = Math.max(...posts.map(post => post.id));
  return maxId + 1;
};

// Formatiraj datum na bosanski način
const formatDateToBosnian = (date) => {
  const months = [
    'januar', 'februar', 'mart', 'april', 'maj', 'juni',
    'juli', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}.`;
};

// Middleware za autentifikaciju
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Autorizacija potrebna'
    });
  }
  
  const token = authHeader.substring(7);
  
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Nevažeći token'
    });
  }
  
  next();
};

// Get all published blog posts
router.get('/', (req, res) => {
  try {
    const allPosts = loadAllPosts();
    const publishedPosts = allPosts.filter(post => post.published);
    
    res.json({
      success: true,
      data: publishedPosts
    });
  } catch (error) {
    console.error('Greška u GET / ruti:', error);
    res.status(500).json({
      success: false,
      message: 'Server greška'
    });
  }
});

// Get single blog post by slug
router.get('/slug/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const post = loadPostBySlug(slug);
    
    if (!post || !post.published) {
      return res.status(404).json({
        success: false,
        message: 'Blog post nije pronađen'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Greška u /slug/:slug ruti:', error);
    res.status(500).json({
      success: false,
      message: 'Server greška'
    });
  }
});

// Get single blog post by ID (za backward compatibility)
router.get('/:id', (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = loadPost(postId);
    
    if (!post || !post.published) {
      return res.status(404).json({
        success: false,
        message: 'Blog post nije pronađen'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Greška u /:id ruti:', error);
    res.status(500).json({
      success: false,
      message: 'Server greška'
    });
  }
});

// Create new blog post
router.post('/admin', authenticateAdmin, (req, res) => {
  const { title, excerpt, content } = req.body;
  
  // Validacija
  if (!title || !excerpt || !content) {
    return res.status(400).json({
      success: false,
      message: 'Sva polja su obavezna'
    });
  }
  
  const newPost = {
    id: generateNewId(),
    title,
    excerpt,
    content,
    slug: generateSlug(title),
    date: formatDateToBosnian(new Date()),
    published: true
  };
  
  const saved = savePost(newPost);
  
  if (!saved) {
    return res.status(500).json({
      success: false,
      message: 'Greška pri čuvanju posta'
    });
  }
  
  console.log('📝 Novi blog post dodat:', newPost.title);
  
  res.json({
    success: true,
    message: 'Blog post uspješno dodat!',
    data: newPost
  });
});

// Delete blog post
router.delete('/admin/:id', authenticateAdmin, (req, res) => {
  const postId = parseInt(req.params.id);
  
  // Prvo učitaj post da dobijemo podatke za response
  const post = loadPost(postId);
  
  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Blog post nije pronađen'
    });
  }
  
  const deleted = deletePost(postId);
  
  if (!deleted) {
    return res.status(500).json({
      success: false,
      message: 'Greška pri brisanju posta'
    });
  }
  
  res.json({
    success: true,
    message: 'Blog post uspješno obrisan!',
    data: post
  });
});

export default router;