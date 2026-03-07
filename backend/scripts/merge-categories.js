const db = require('../config/db');

async function mergeCategories() {
  console.log('=== MIGRATION DES CATÉGORIES ===\n');

  try {
    // 1. Ajouter la colonne icon si elle n'existe pas
    console.log('1. Ajout de la colonne icon...');
    try {
      await db.query('ALTER TABLE categories ADD COLUMN icon VARCHAR(50) DEFAULT NULL');
      console.log('   Colonne icon ajoutée');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('   Colonne icon existe déjà');
      } else {
        throw e;
      }
    }

    // 2. Mettre à jour les icônes des catégories de base
    console.log('\n2. Mise à jour des icônes des catégories de base...');
    const baseIcons = [
      { id: 1, icon: 'fa-cow' },           // Élevage
      { id: 2, icon: 'fa-fish' },          // Pêches
      { id: 3, icon: 'fa-paw' },           // Faune
      { id: 4, icon: 'fa-globe' },         // One Health
      { id: 5, icon: 'fa-heartbeat' },     // Santé animale
      { id: 6, icon: 'fa-capsules' },      // Antibiorésistance
      { id: 7, icon: 'fa-newspaper' },     // Actualités
      { id: 8, icon: 'fa-file-alt' },      // Articles
      { id: 9, icon: 'fa-chart-line' },    // Analyses
      { id: 10, icon: 'fa-microphone' },   // Interviews
      { id: 11, icon: 'fa-calendar-alt' }, // Événements
      { id: 12, icon: 'fa-virus' },        // Zoonoses
    ];

    for (const cat of baseIcons) {
      await db.query('UPDATE categories SET icon = ? WHERE id = ?', [cat.icon, cat.id]);
    }
    console.log('   12 catégories de base mises à jour');

    // 3. Créer les nouvelles catégories
    console.log('\n3. Création des nouvelles catégories...');
    const newCategories = [
      { name: 'Opportunities', name_fr: 'Opportunités', slug: 'opportunites', icon: 'fa-briefcase' },
      { name: 'Publications', name_fr: 'Publications', slug: 'publications', icon: 'fa-book' },
      { name: 'Videos', name_fr: 'Vidéos', slug: 'videos', icon: 'fa-video' },
      { name: 'Veterinarians', name_fr: 'Vétérinaires', slug: 'veterinaires', icon: 'fa-user-md' },
      { name: 'Covid-19', name_fr: 'Covid-19', slug: 'covid-19', icon: 'fa-lungs-virus' },
      { name: 'Food Safety', name_fr: 'Sécurité Sanitaire', slug: 'securite-sanitaire', icon: 'fa-shield-virus' },
      { name: 'Rabies', name_fr: 'Rage', slug: 'rage', icon: 'fa-syringe' },
      { name: 'Mpox', name_fr: 'Mpox', slug: 'mpox', icon: 'fa-biohazard' },
    ];

    const newCatIds = {};
    for (const cat of newCategories) {
      // Vérifier si existe déjà par slug
      const [existing] = await db.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      if (existing.length > 0) {
        newCatIds[cat.slug] = existing[0].id;
        await db.query('UPDATE categories SET icon = ?, name = ?, name_fr = ? WHERE id = ?',
          [cat.icon, cat.name, cat.name_fr, existing[0].id]);
        console.log(`   ${cat.name_fr} existe (ID: ${existing[0].id}), icône mise à jour`);
      } else {
        const [result] = await db.query(
          'INSERT INTO categories (name, name_fr, slug, icon) VALUES (?, ?, ?, ?)',
          [cat.name, cat.name_fr, cat.slug, cat.icon]
        );
        newCatIds[cat.slug] = result.insertId;
        console.log(`   ${cat.name_fr} créée (ID: ${result.insertId})`);
      }
    }

    // 4. Définir les associations (ancienne catégorie -> nouvelle catégorie)
    console.log('\n4. Migration des articles vers les nouvelles catégories...');

    // Récupérer les IDs des catégories WordPress par slug
    const [wpCats] = await db.query('SELECT id, slug FROM categories');
    const catBySlug = {};
    wpCats.forEach(c => catBySlug[c.slug] = c.id);

    // Associations: [source_category_id, target_category_id]
    const associations = [
      // Vers Actualités (7)
      [catBySlug['breaking-news'], 7],

      // Vers Santé animale (5)
      [catBySlug['diseases'], 5],
      [catBySlug['health'], 5],
      [catBySlug['maladies'], 5],

      // Vers Articles (8)
      [catBySlug['non-classe'], 8],
      [catBySlug['principaux-sujets'], 8],
      [catBySlug['uncategorized'], 8],

      // Vers Opportunités
      [catBySlug['jobs'], newCatIds['opportunites']],
      [catBySlug['bourses'], newCatIds['opportunites']],
      [catBySlug['call-grants'], newCatIds['opportunites']],
      [catBySlug['markets-procurement'], newCatIds['opportunites']],

      // Vers Publications
      [catBySlug['publications'], newCatIds['publications']],
      [catBySlug['revues'], newCatIds['publications']],
      [catBySlug['autres-documents'], newCatIds['publications']],
      [catBySlug['fiches'], newCatIds['publications']],
      [catBySlug['outils'], newCatIds['publications']],

      // Vers Vidéos
      [catBySlug['videos'], newCatIds['videos']],

      // Vers Vétérinaires
      [catBySlug['vets'], newCatIds['veterinaires']],

      // Vers Covid-19
      [catBySlug['covid-19'], newCatIds['covid-19']],
      [catBySlug['covid-19-afrique'], newCatIds['covid-19']],
      [catBySlug['covid-19-cameroon'], newCatIds['covid-19']],

      // Vers Sécurité Sanitaire
      [catBySlug['securite-sanitaire'], newCatIds['securite-sanitaire']],

      // Vers Rage
      [catBySlug['rage'], newCatIds['rage']],

      // Vers Mpox
      [catBySlug['mpox'], newCatIds['mpox']],
    ];

    let totalMigrated = 0;
    const categoriesToDelete = [];

    for (const [sourceId, targetId] of associations) {
      if (!sourceId || !targetId || sourceId === targetId) continue;

      // Migrer les articles de post_categories
      const [articles] = await db.query(
        'SELECT post_id FROM post_categories WHERE category_id = ?',
        [sourceId]
      );

      for (const article of articles) {
        // Vérifier si l'article n'est pas déjà dans la catégorie cible
        const [exists] = await db.query(
          'SELECT 1 FROM post_categories WHERE post_id = ? AND category_id = ?',
          [article.post_id, targetId]
        );

        if (exists.length === 0) {
          await db.query(
            'INSERT INTO post_categories (post_id, category_id) VALUES (?, ?)',
            [article.post_id, targetId]
          );
        }
      }

      // Supprimer les anciennes associations
      const [deleted] = await db.query(
        'DELETE FROM post_categories WHERE category_id = ?',
        [sourceId]
      );

      if (deleted.affectedRows > 0) {
        totalMigrated += deleted.affectedRows;
        categoriesToDelete.push(sourceId);
        console.log(`   Catégorie ${sourceId} -> ${targetId}: ${deleted.affectedRows} articles migrés`);
      }
    }

    console.log(`   Total: ${totalMigrated} associations migrées`);

    // 5. Supprimer les catégories WordPress vides/migrées
    console.log('\n5. Suppression des catégories obsolètes...');
    const uniqueToDelete = [...new Set(categoriesToDelete)];

    for (const catId of uniqueToDelete) {
      // Vérifier qu'il n'y a plus d'articles
      const [remaining] = await db.query(
        'SELECT COUNT(*) as count FROM post_categories WHERE category_id = ?',
        [catId]
      );

      if (remaining[0].count === 0) {
        await db.query('DELETE FROM categories WHERE id = ?', [catId]);
        console.log(`   Catégorie ${catId} supprimée`);
      }
    }

    // 6. Résumé final
    console.log('\n=== RÉSUMÉ ===');
    const [finalCats] = await db.query(`
      SELECT c.id, c.name_fr, c.icon,
             (SELECT COUNT(*) FROM post_categories pc WHERE pc.category_id = c.id) as post_count
      FROM categories c
      ORDER BY c.id
    `);

    console.log('\nCatégories finales:');
    finalCats.forEach(c => {
      console.log(`  ${c.id}. ${c.name_fr} (${c.icon || 'no icon'}) - ${c.post_count} articles`);
    });

    console.log(`\nTotal: ${finalCats.length} catégories`);
    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    process.exit();
  }
}

mergeCategories();
