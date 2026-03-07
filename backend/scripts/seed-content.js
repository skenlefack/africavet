/**
 * Seed script to create categories and menus from frontend structure
 * Run with: node scripts/seed-content.js
 */

const mysql = require('mysql2/promise');

async function seedContent() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'africavet',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'africavet_cms'
  });

  console.log('🌱 Starting content seeding...\n');

  try {
    // ===== CATEGORIES =====
    console.log('📁 Seeding categories...');

    // Delete existing categories
    await conn.query('DELETE FROM categories');
    await conn.query('ALTER TABLE categories AUTO_INCREMENT = 1');
    console.log('   ✓ Deleted existing categories');

    // Categories from frontend (Thématiques)
    const categories = [
      {
        name_fr: 'Élevage',
        name_en: 'Livestock',
        slug: 'elevage',
        description_fr: 'Actualités et articles sur l\'élevage en Afrique',
        description_en: 'News and articles about livestock in Africa',
        icon: 'fa-cow',
        color: '#8B4513'
      },
      {
        name_fr: 'Pêches',
        name_en: 'Fisheries',
        slug: 'peches',
        description_fr: 'Actualités sur la pêche et l\'aquaculture',
        description_en: 'News about fisheries and aquaculture',
        icon: 'fa-fish',
        color: '#1E90FF'
      },
      {
        name_fr: 'Faune',
        name_en: 'Wildlife',
        slug: 'faune',
        description_fr: 'Conservation et gestion de la faune sauvage',
        description_en: 'Wildlife conservation and management',
        icon: 'fa-paw',
        color: '#228B22'
      },
      {
        name_fr: 'One Health',
        name_en: 'One Health',
        slug: 'one-health',
        description_fr: 'Approche One Health - Santé humaine, animale et environnementale',
        description_en: 'One Health approach - Human, animal and environmental health',
        icon: 'fa-heart-pulse',
        color: '#FF6B6B'
      },
      {
        name_fr: 'Santé animale',
        name_en: 'Animal Health',
        slug: 'sante-animale',
        description_fr: 'Santé et bien-être animal, maladies et traitements',
        description_en: 'Animal health and welfare, diseases and treatments',
        icon: 'fa-stethoscope',
        color: '#9B59B6'
      },
      {
        name_fr: 'Antibiorésistance',
        name_en: 'Antimicrobial Resistance',
        slug: 'antibioresistance',
        description_fr: 'Lutte contre la résistance aux antimicrobiens',
        description_en: 'Fight against antimicrobial resistance',
        icon: 'fa-flask',
        color: '#E74C3C'
      },
      // Additional content type categories
      {
        name_fr: 'Actualités',
        name_en: 'News',
        slug: 'news',
        description_fr: 'Actualités générales',
        description_en: 'General news',
        icon: 'fa-newspaper',
        color: '#3498DB'
      },
      {
        name_fr: 'Articles',
        name_en: 'Articles',
        slug: 'article',
        description_fr: 'Articles de fond et analyses',
        description_en: 'In-depth articles and analysis',
        icon: 'fa-file-alt',
        color: '#2ECC71'
      },
      {
        name_fr: 'Analyses',
        name_en: 'Analysis',
        slug: 'analysis',
        description_fr: 'Analyses approfondies et études',
        description_en: 'In-depth analysis and studies',
        icon: 'fa-chart-line',
        color: '#F39C12'
      },
      {
        name_fr: 'Interviews',
        name_en: 'Interviews',
        slug: 'interview',
        description_fr: 'Entretiens avec des experts',
        description_en: 'Interviews with experts',
        icon: 'fa-microphone',
        color: '#1ABC9C'
      },
      {
        name_fr: 'Événements',
        name_en: 'Events',
        slug: 'event',
        description_fr: 'Conférences, séminaires et événements',
        description_en: 'Conferences, seminars and events',
        icon: 'fa-calendar',
        color: '#E67E22'
      },
      {
        name_fr: 'Zoonoses',
        name_en: 'Zoonoses',
        slug: 'zoonoses',
        description_fr: 'Maladies transmissibles entre animaux et humains',
        description_en: 'Diseases transmissible between animals and humans',
        icon: 'fa-virus',
        color: '#C0392B'
      }
    ];

    for (const cat of categories) {
      await conn.query(
        `INSERT INTO categories (name, name_fr, name_en, slug, description, description_fr, description_en, icon, color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cat.name_fr, cat.name_fr, cat.name_en, cat.slug, cat.description_fr, cat.description_fr, cat.description_en, cat.icon, cat.color]
      );
    }
    console.log(`   ✓ Created ${categories.length} categories`);

    // ===== MENUS =====
    console.log('\n📋 Seeding menus...');

    // Delete existing menu items and menus
    await conn.query('DELETE FROM menu_items');
    await conn.query('DELETE FROM menus');
    await conn.query('ALTER TABLE menu_items AUTO_INCREMENT = 1');
    await conn.query('ALTER TABLE menus AUTO_INCREMENT = 1');
    console.log('   ✓ Deleted existing menus');

    // Create main header menu
    const [headerMenuResult] = await conn.query(
      `INSERT INTO menus (name, slug, location) VALUES (?, ?, ?)`,
      ['Menu Principal', 'menu-principal', 'header']
    );
    const headerMenuId = headerMenuResult.insertId;
    console.log('   ✓ Created header menu');

    // Main menu items
    const mainMenuItems = [
      { title_fr: 'Accueil', title_en: 'Home', url: '/', type: 'custom', order: 0 },
      { title_fr: 'À propos', title_en: 'About', url: '/about', type: 'custom', order: 1 },
      { title_fr: 'Thématiques', title_en: 'Topics', url: '#', type: 'custom', order: 2, children: [
        { title_fr: 'Élevage', title_en: 'Livestock', url: '/news?category=elevage', type: 'custom', order: 0 },
        { title_fr: 'Pêches', title_en: 'Fisheries', url: '/news?category=peches', type: 'custom', order: 1 },
        { title_fr: 'Faune', title_en: 'Wildlife', url: '/news?category=faune', type: 'custom', order: 2 },
        { title_fr: 'One Health', title_en: 'One Health', url: '/news?category=one-health', type: 'custom', order: 3 },
        { title_fr: 'Santé animale', title_en: 'Animal Health', url: '/news?category=sante-animale', type: 'custom', order: 4 },
        { title_fr: 'Antibiorésistance', title_en: 'Antimicrobial Resistance', url: '/news?category=antibioresistance', type: 'custom', order: 5 },
      ]},
      { title_fr: 'S\'informer', title_en: 'Get Informed', url: '#', type: 'custom', order: 3, children: [
        { title_fr: 'Actualités', title_en: 'News', url: '/news', type: 'custom', order: 0 },
        { title_fr: 'Articles', title_en: 'Articles', url: '/news?type=article', type: 'custom', order: 1 },
        { title_fr: 'Analyses', title_en: 'Analysis', url: '/news?type=analysis', type: 'custom', order: 2 },
        { title_fr: 'Zoonoses', title_en: 'Zoonoses', url: '/zoonoses', type: 'custom', order: 3 },
      ]},
      { title_fr: 'Se former', title_en: 'Get Trained', url: '#', type: 'custom', order: 4, children: [
        { title_fr: 'Cours', title_en: 'Courses', url: '/vet-elearning/courses', type: 'custom', order: 0 },
        { title_fr: 'Parcours', title_en: 'Learning Paths', url: '/vet-elearning/paths', type: 'custom', order: 1 },
        { title_fr: 'Ressources', title_en: 'Resources', url: '/vet-elearning', type: 'custom', order: 2 },
        { title_fr: 'Certificats', title_en: 'Certificates', url: '/dashboard/certificates', type: 'custom', order: 3 },
      ]},
      { title_fr: 'Trouver', title_en: 'Find', url: '#', type: 'custom', order: 5, children: [
        { title_fr: 'Cliniques', title_en: 'Clinics', url: '/vet-link?category=vet-clinic', type: 'custom', order: 0 },
        { title_fr: 'Laboratoires', title_en: 'Laboratories', url: '/vet-link?category=vet-lab', type: 'custom', order: 1 },
        { title_fr: 'Pharmacies', title_en: 'Pharmacies', url: '/vet-link?category=vet-pharmacy', type: 'custom', order: 2 },
        { title_fr: 'Urgences', title_en: 'Emergencies', url: '/vet-link?category=emergency', type: 'custom', order: 3 },
        { title_fr: 'Écoles', title_en: 'Schools', url: '/vet-link?category=vet-school', type: 'custom', order: 4 },
        { title_fr: 'Services officiels', title_en: 'Officials', url: '/vet-link?category=vet-directorate', type: 'custom', order: 5 },
      ]},
      { title_fr: 'Opportunités', title_en: 'Opportunities', url: '#', type: 'custom', order: 6, children: [
        { title_fr: 'Emplois', title_en: 'Jobs', url: '/opportunities?type=job', type: 'custom', order: 0 },
        { title_fr: 'Appels d\'offres', title_en: 'Tenders', url: '/opportunities?type=tender', type: 'custom', order: 1 },
        { title_fr: 'Marchés', title_en: 'Markets', url: '/opportunities?type=market', type: 'custom', order: 2 },
      ]},
      { title_fr: 'Se coordonner', title_en: 'Coordinate', url: '#', type: 'custom', order: 7, children: [
        { title_fr: 'Alertes', title_en: 'Alerts', url: '/vet-alert', type: 'custom', order: 0 },
        { title_fr: 'Signaler', title_en: 'Report Alert', url: '/vet-alert/submit', type: 'custom', order: 1 },
        { title_fr: 'Événements', title_en: 'Events', url: '/news?type=event', type: 'custom', order: 2 },
        { title_fr: 'Communauté', title_en: 'Community', url: '/contact', type: 'custom', order: 3 },
      ]},
      { title_fr: 'Interview', title_en: 'Interview', url: '/news?type=interview', type: 'custom', order: 8 },
      { title_fr: 'Contact', title_en: 'Contact', url: '/contact', type: 'custom', order: 9 },
    ];

    // Insert menu items recursively
    async function insertMenuItem(item, menuId, parentId = null) {
      const [result] = await conn.query(
        `INSERT INTO menu_items (menu_id, parent_id, title, url, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [menuId, parentId, item.title_fr, item.url, item.order]
      );

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          await insertMenuItem(child, menuId, result.insertId);
        }
      }

      return result.insertId;
    }

    let totalMenuItems = 0;
    for (const item of mainMenuItems) {
      await insertMenuItem(item, headerMenuId);
      totalMenuItems++;
      if (item.children) {
        totalMenuItems += item.children.length;
      }
    }
    console.log(`   ✓ Created ${totalMenuItems} menu items for header menu`);

    // Create footer menu
    const [footerMenuResult] = await conn.query(
      `INSERT INTO menus (name, slug, location) VALUES (?, ?, ?)`,
      ['Menu Footer', 'menu-footer', 'footer']
    );
    const footerMenuId = footerMenuResult.insertId;

    const footerMenuItems = [
      { title_fr: 'Accueil', title_en: 'Home', url: '/', type: 'custom', order: 0 },
      { title_fr: 'À propos', title_en: 'About', url: '/about', type: 'custom', order: 1 },
      { title_fr: 'Contact', title_en: 'Contact', url: '/contact', type: 'custom', order: 2 },
      { title_fr: 'Mentions légales', title_en: 'Legal Notice', url: '/legal', type: 'custom', order: 3 },
      { title_fr: 'Politique de confidentialité', title_en: 'Privacy Policy', url: '/privacy', type: 'custom', order: 4 },
      { title_fr: 'CGU', title_en: 'Terms of Use', url: '/terms', type: 'custom', order: 5 },
    ];

    for (const item of footerMenuItems) {
      await insertMenuItem(item, footerMenuId);
    }
    console.log(`   ✓ Created ${footerMenuItems.length} menu items for footer menu`);
    console.log('   ✓ Created footer menu');

    console.log('\n✅ Content seeding completed successfully!');
    console.log(`   - ${categories.length} categories`);
    console.log(`   - 2 menus`);
    console.log(`   - ${totalMenuItems + footerMenuItems.length} total menu items`);

  } catch (error) {
    console.error('❌ Error seeding content:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

// Run the seed
seedContent()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
