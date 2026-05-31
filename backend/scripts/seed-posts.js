/**
 * Seed script to create sample articles for AfricaVet
 * Run with: node scripts/seed-posts.js
 */

const mysql = require('mysql2/promise');

async function seedPosts() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'africavet',
    password: process.env.DB_PASSWORD || 'devpassword',
    database: process.env.DB_NAME || 'africavet_cms'
  });

  console.log('🌱 Starting posts seeding...\n');

  try {
    // Get category IDs
    const [categories] = await conn.query('SELECT id, slug FROM categories');
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c.id; });
    console.log(`   Found ${categories.length} categories`);

    // Get admin user
    const [users] = await conn.query('SELECT id FROM users WHERE role = ? LIMIT 1', ['admin']);
    const authorId = users.length > 0 ? users[0].id : 1;

    const posts = [
      {
        title_fr: 'Lutte contre la fièvre aphteuse en Afrique de l\'Ouest : nouvelles stratégies vaccinales',
        title_en: 'Fight against Foot-and-Mouth Disease in West Africa: New Vaccination Strategies',
        slug: 'lutte-fievre-aphteuse-afrique-ouest',
        excerpt_fr: 'Les pays d\'Afrique de l\'Ouest renforcent leur coopération pour lutter contre la fièvre aphteuse avec de nouvelles approches vaccinales prometteuses.',
        excerpt_en: 'West African countries strengthen cooperation to fight foot-and-mouth disease with promising new vaccination approaches.',
        content_fr: '<h2>Un défi majeur pour l\'élevage africain</h2><p>La fièvre aphteuse continue de représenter une menace importante pour le secteur de l\'élevage en Afrique de l\'Ouest. Selon les dernières estimations, cette maladie cause des pertes économiques annuelles de plusieurs millions de dollars dans la région.</p><h3>Nouvelles stratégies vaccinales</h3><p>Un consortium de chercheurs africains a développé un nouveau protocole vaccinal adapté aux souches circulant sur le continent. Les essais menés au Sénégal, au Mali et au Burkina Faso montrent une efficacité de 92% après deux doses.</p><p>Le Dr Amadou Diallo, coordinateur du projet, explique : « Cette approche tient compte des spécificités génétiques des souches africaines du virus. Les vaccins précédemment utilisés, développés pour les souches européennes, offraient une protection insuffisante. »</p><h3>Coopération régionale renforcée</h3><p>La CEDEAO a annoncé un plan d\'investissement de 50 millions de dollars sur 5 ans pour soutenir la vaccination systématique du cheptel dans les 15 pays membres. Ce programme prévoit également la formation de 2 000 agents vétérinaires communautaires.</p>',
        content_en: '<h2>A Major Challenge for African Livestock</h2><p>Foot-and-mouth disease continues to pose a significant threat to the livestock sector in West Africa. According to recent estimates, this disease causes annual economic losses of several million dollars in the region.</p><h3>New Vaccination Strategies</h3><p>A consortium of African researchers has developed a new vaccination protocol adapted to strains circulating on the continent. Trials conducted in Senegal, Mali and Burkina Faso show 92% efficacy after two doses.</p>',
        category: 'sante-animale',
        type: 'news'
      },
      {
        title_fr: 'One Health en Afrique : le Cameroun lance son programme national',
        title_en: 'One Health in Africa: Cameroon Launches National Program',
        slug: 'one-health-cameroun-programme-national',
        excerpt_fr: 'Le Cameroun devient le 8ème pays africain à adopter une stratégie nationale One Health intégrée, reliant santé humaine, animale et environnementale.',
        excerpt_en: 'Cameroon becomes the 8th African country to adopt an integrated national One Health strategy.',
        content_fr: '<h2>Une approche intégrée de la santé</h2><p>Le Cameroun a officiellement lancé son Programme National One Health (PNOH), marquant une étape importante dans l\'intégration des secteurs de la santé humaine, animale et environnementale. La cérémonie de lancement s\'est tenue à Yaoundé en présence de représentants de l\'OMS, de la FAO et de l\'OIE.</p><h3>Objectifs du programme</h3><p>Le PNOH vise à :</p><ul><li>Renforcer la surveillance intégrée des maladies zoonotiques</li><li>Créer un réseau de laboratoires One Health</li><li>Former 500 professionnels à l\'approche One Health d\'ici 2028</li><li>Mettre en place un système d\'alerte précoce transfrontalier</li></ul><p>« L\'expérience de la COVID-19 nous a montré l\'importance cruciale d\'une approche intégrée », a déclaré le Ministre de la Santé Publique lors du lancement.</p>',
        content_en: '<h2>An Integrated Health Approach</h2><p>Cameroon has officially launched its National One Health Program (NOHP), marking an important milestone in integrating human, animal and environmental health sectors.</p>',
        category: 'one-health',
        type: 'news'
      },
      {
        title_fr: 'Antibiorésistance : alerte sur l\'utilisation des antibiotiques dans l\'élevage avicole',
        title_en: 'Antimicrobial Resistance: Alert on Antibiotic Use in Poultry Farming',
        slug: 'antibioresistance-elevage-avicole',
        excerpt_fr: 'Une étude menée dans 5 pays africains révèle un taux alarmant de résistance aux antibiotiques dans les élevages avicoles.',
        excerpt_en: 'A study conducted in 5 African countries reveals alarming antibiotic resistance rates in poultry farms.',
        content_fr: '<h2>Résultats préoccupants</h2><p>Une étude menée conjointement par l\'Institut Pasteur de Dakar et l\'Université de Pretoria dans cinq pays africains (Sénégal, Côte d\'Ivoire, Kenya, Éthiopie et Afrique du Sud) révèle des taux de résistance aux antibiotiques préoccupants dans le secteur avicole.</p><h3>Chiffres clés</h3><p>L\'étude, publiée dans le journal Veterinary Microbiology, montre que :</p><ul><li>78% des souches d\'E. coli isolées sont résistantes à au moins 3 classes d\'antibiotiques</li><li>45% des éleveurs utilisent des antibiotiques sans prescription vétérinaire</li><li>Les fluoroquinolones, antibiotiques critiques pour la santé humaine, sont largement utilisées en prophylaxie</li></ul><h3>Recommandations</h3><p>Les auteurs recommandent urgemment la mise en place de réglementations strictes sur la vente d\'antibiotiques vétérinaires et le développement de programmes de sensibilisation pour les éleveurs.</p>',
        content_en: '<h2>Concerning Results</h2><p>A study jointly conducted by the Pasteur Institute in Dakar and the University of Pretoria in five African countries reveals concerning antibiotic resistance rates in the poultry sector.</p>',
        category: 'antibioresistance',
        type: 'news'
      },
      {
        title_fr: 'Pêche durable en Afrique : le lac Victoria montre l\'exemple',
        title_en: 'Sustainable Fishing in Africa: Lake Victoria Shows the Way',
        slug: 'peche-durable-lac-victoria',
        excerpt_fr: 'Le programme de gestion durable des ressources halieutiques du lac Victoria porte ses fruits après 5 ans de mise en œuvre.',
        excerpt_en: 'The sustainable fisheries management program of Lake Victoria bears fruit after 5 years of implementation.',
        content_fr: '<h2>Un modèle de gestion durable</h2><p>Après cinq années de mise en œuvre, le Programme de Gestion Durable des Pêcheries du Lac Victoria (PGDP-LV) affiche des résultats encourageants. Les stocks de tilapia du Nil ont augmenté de 35% et les revenus des pêcheurs artisanaux de 28%.</p><h3>Les clés du succès</h3><p>Le programme repose sur trois piliers :</p><ol><li><strong>Zonage saisonnier</strong> : des zones de repos biologique sont respectées pendant les périodes de reproduction</li><li><strong>Contrôle des filets</strong> : les mailles trop fines ont été interdites, permettant aux juvéniles de se développer</li><li><strong>Cogestion communautaire</strong> : les communautés de pêcheurs participent activement à la surveillance et à la prise de décision</li></ol>',
        content_en: '<h2>A Model of Sustainable Management</h2><p>After five years of implementation, the Lake Victoria Sustainable Fisheries Management Program shows encouraging results. Nile tilapia stocks have increased by 35% and artisanal fishermen\'s incomes by 28%.</p>',
        category: 'peches',
        type: 'news'
      },
      {
        title_fr: 'Protection de la faune : succès du programme anti-braconnage au Kenya',
        title_en: 'Wildlife Protection: Success of Anti-Poaching Program in Kenya',
        slug: 'protection-faune-anti-braconnage-kenya',
        excerpt_fr: 'Le Kenya enregistre une baisse de 60% des incidents de braconnage grâce à l\'utilisation de drones et de l\'intelligence artificielle.',
        excerpt_en: 'Kenya records a 60% drop in poaching incidents through the use of drones and artificial intelligence.',
        content_fr: '<h2>La technologie au service de la conservation</h2><p>Le Kenya Wildlife Service (KWS) a annoncé une réduction de 60% des incidents de braconnage dans les parcs nationaux grâce à un programme innovant combinant surveillance par drones, intelligence artificielle et implication des communautés locales.</p><h3>Intelligence artificielle prédictive</h3><p>Le système PROTECT (Predictive Recognition of Threats and Enforcement with Collective Tracking) utilise l\'IA pour prédire les zones et horaires à risque de braconnage, permettant un déploiement optimal des rangers.</p><p>« Nous avons multiplié par trois notre capacité de surveillance tout en réduisant les coûts opérationnels de 40% », explique le directeur du KWS.</p>',
        content_en: '<h2>Technology in Service of Conservation</h2><p>The Kenya Wildlife Service (KWS) has announced a 60% reduction in poaching incidents in national parks through an innovative program combining drone surveillance, artificial intelligence and local community involvement.</p>',
        category: 'faune',
        type: 'news'
      },
      {
        title_fr: 'L\'élevage pastoral face au changement climatique au Sahel',
        title_en: 'Pastoral Livestock Facing Climate Change in the Sahel',
        slug: 'elevage-pastoral-changement-climatique-sahel',
        excerpt_fr: 'Les éleveurs pastoraux du Sahel développent des stratégies d\'adaptation innovantes face aux effets du changement climatique.',
        excerpt_en: 'Sahel pastoral herders develop innovative adaptation strategies to cope with climate change effects.',
        content_fr: '<h2>Adapter l\'élevage au climat</h2><p>Face à la diminution des pâturages et à l\'irrégularité croissante des pluies, les communautés pastorales du Sahel développent des stratégies d\'adaptation remarquables. Un rapport conjoint FAO-CIRAD documente ces innovations.</p><h3>Innovations pastorales</h3><p>Parmi les stratégies identifiées :</p><ul><li><strong>Cultures fourragères améliorées</strong> : introduction de variétés résistantes à la sécheresse</li><li><strong>Systèmes d\'information pastorale</strong> : utilisation du mobile pour partager l\'état des pâturages</li><li><strong>Diversification</strong> : intégration agriculture-élevage et développement de la transformation laitière</li><li><strong>Races adaptées</strong> : sélection de races locales plus résistantes au stress thermique</li></ul>',
        content_en: '<h2>Adapting Livestock to Climate</h2><p>Facing diminishing pastures and increasingly irregular rainfall, Sahel pastoral communities are developing remarkable adaptation strategies.</p>',
        category: 'elevage',
        type: 'news'
      },
      {
        title_fr: 'Zoonoses émergentes : surveillance renforcée de la grippe aviaire en Afrique',
        title_en: 'Emerging Zoonoses: Enhanced Avian Influenza Surveillance in Africa',
        slug: 'zoonoses-grippe-aviaire-surveillance-afrique',
        excerpt_fr: 'L\'OIE et la FAO renforcent la surveillance de la grippe aviaire H5N1 en Afrique suite à la détection de nouveaux foyers.',
        excerpt_en: 'OIE and FAO strengthen H5N1 avian influenza surveillance in Africa following detection of new outbreaks.',
        content_fr: '<h2>Vigilance accrue</h2><p>Suite à la détection de foyers de grippe aviaire hautement pathogène (H5N1) dans plusieurs pays d\'Afrique de l\'Ouest et de l\'Est, l\'Organisation Mondiale de la Santé Animale (OIE) et la FAO ont annoncé un renforcement significatif de la surveillance.</p><h3>Mesures mises en place</h3><p>Le plan d\'action comprend :</p><ul><li>Déploiement de 50 équipes d\'investigation rapide dans 20 pays</li><li>Renforcement des capacités de diagnostic de 15 laboratoires nationaux</li><li>Mise en place d\'un système de notification en temps réel</li><li>Campagne de sensibilisation auprès des éleveurs avicoles</li></ul><p>Le risque zoonotique est considéré comme modéré mais la vigilance reste de mise, notamment dans les marchés de volailles vivantes.</p>',
        content_en: '<h2>Increased Vigilance</h2><p>Following the detection of highly pathogenic avian influenza (H5N1) outbreaks in several West and East African countries, OIE and FAO have announced significant surveillance reinforcement.</p>',
        category: 'zoonoses',
        type: 'news'
      },
      {
        title_fr: 'Conférence panafricaine sur la santé animale : Addis-Abeba 2026',
        title_en: 'Pan-African Conference on Animal Health: Addis Ababa 2026',
        slug: 'conference-panafricaine-sante-animale-addis-abeba-2026',
        excerpt_fr: 'La 12ème Conférence Panafricaine sur la Santé Animale se tiendra à Addis-Abeba du 15 au 18 avril 2026.',
        excerpt_en: 'The 12th Pan-African Conference on Animal Health will be held in Addis Ababa from April 15-18, 2026.',
        content_fr: '<h2>Un rendez-vous incontournable</h2><p>La 12ème Conférence Panafricaine sur la Santé Animale (PACAH) se tiendra à Addis-Abeba, Éthiopie, du 15 au 18 avril 2026. Cet événement majeur réunira plus de 800 participants de 54 pays africains.</p><h3>Thèmes principaux</h3><ol><li>Maladies animales transfrontalières : surveillance et réponse coordonnée</li><li>Antibiorésistance : stratégies nationales et régionales</li><li>One Health : intégration des politiques de santé</li><li>Innovation technologique : IA, télédétection et outils numériques pour la santé animale</li><li>Changement climatique et santé animale</li></ol><h3>Inscription</h3><p>Les inscriptions sont ouvertes jusqu\'au 31 mars 2026. Les frais d\'inscription sont de 200 USD pour les participants africains et de 400 USD pour les participants internationaux. Des bourses sont disponibles pour les jeunes chercheurs.</p>',
        content_en: '<h2>An Unmissable Event</h2><p>The 12th Pan-African Conference on Animal Health (PACAH) will be held in Addis Ababa, Ethiopia, from April 15-18, 2026.</p>',
        category: 'event',
        type: 'news'
      },
      {
        title_fr: 'Interview : Dr Fatou Sow sur l\'avenir de la médecine vétérinaire en Afrique',
        title_en: 'Interview: Dr Fatou Sow on the Future of Veterinary Medicine in Africa',
        slug: 'interview-dr-fatou-sow-medecine-veterinaire-afrique',
        excerpt_fr: 'Rencontre avec le Dr Fatou Sow, pionnière de la médecine vétérinaire en Afrique de l\'Ouest et présidente de l\'Association des Vétérinaires Africains.',
        excerpt_en: 'Meeting with Dr Fatou Sow, pioneer of veterinary medicine in West Africa.',
        content_fr: '<h2>Parcours d\'une pionnière</h2><p><strong>AfricaVet :</strong> Dr Sow, vous êtes la première femme à diriger l\'Association des Vétérinaires Africains. Quel regard portez-vous sur l\'évolution de la profession ?</p><p><strong>Dr Sow :</strong> La profession vétérinaire en Afrique a considérablement évolué ces 20 dernières années. Nous sommes passés d\'une approche purement curative à une vision intégrée de la santé. Le concept One Health est devenu central dans notre pratique.</p><p><strong>AfricaVet :</strong> Quels sont les principaux défis ?</p><p><strong>Dr Sow :</strong> Le premier défi reste la formation. Nous avons besoin de plus de vétérinaires, mieux formés et mieux répartis sur le territoire. Le second défi est technologique : l\'accès aux outils de diagnostic modernes reste limité dans de nombreuses zones rurales.</p><p><strong>AfricaVet :</strong> Quel message pour les jeunes qui veulent devenir vétérinaires en Afrique ?</p><p><strong>Dr Sow :</strong> C\'est un métier passionnant avec un impact direct sur la sécurité alimentaire et la santé publique. L\'Afrique a besoin de vous !</p>',
        content_en: '<h2>A Pioneer\'s Journey</h2><p>Interview with Dr Fatou Sow, first woman to lead the African Veterinary Association.</p>',
        category: 'interview',
        type: 'news'
      },
      {
        title_fr: 'Aquaculture en Afrique : le tilapia, un secteur en plein essor',
        title_en: 'Aquaculture in Africa: Tilapia, a Booming Sector',
        slug: 'aquaculture-afrique-tilapia-essor',
        excerpt_fr: 'La production de tilapia en Afrique a doublé en 5 ans, portée par la demande croissante en protéines animales.',
        excerpt_en: 'Tilapia production in Africa has doubled in 5 years, driven by growing demand for animal protein.',
        content_fr: '<h2>Un secteur en croissance rapide</h2><p>L\'aquaculture africaine connaît une croissance sans précédent, avec le tilapia comme espèce phare. Selon les dernières données de la FAO, la production continentale a atteint 2,3 millions de tonnes en 2025, soit le double du volume de 2020.</p><h3>Les pays leaders</h3><p>L\'Égypte reste le premier producteur africain avec 1,6 million de tonnes, suivie du Nigeria (350 000 tonnes), de l\'Ouganda (120 000 tonnes) et du Ghana (95 000 tonnes).</p><h3>Défis sanitaires</h3><p>La croissance rapide du secteur s\'accompagne de défis sanitaires importants. La maladie du lac tilapia (TiLV) et les parasitoses constituent les principales menaces. Des programmes de biosécurité renforcée sont en cours de déploiement dans les principaux pays producteurs.</p>',
        content_en: '<h2>A Rapidly Growing Sector</h2><p>African aquaculture is experiencing unprecedented growth, with tilapia as the flagship species.</p>',
        category: 'peches',
        type: 'news'
      },
      {
        title_fr: 'Analyse : l\'impact économique des maladies animales en Afrique subsaharienne',
        title_en: 'Analysis: The Economic Impact of Animal Diseases in Sub-Saharan Africa',
        slug: 'analyse-impact-economique-maladies-animales',
        excerpt_fr: 'Une nouvelle étude évalue à 30 milliards de dollars par an les pertes économiques liées aux maladies animales en Afrique subsaharienne.',
        excerpt_en: 'A new study estimates $30 billion per year in economic losses from animal diseases in sub-Saharan Africa.',
        content_fr: '<h2>Des pertes considérables</h2><p>Une étude publiée par la Banque Mondiale en collaboration avec l\'Union Africaine évalue à 30 milliards de dollars par an les pertes économiques directes et indirectes liées aux maladies animales en Afrique subsaharienne.</p><h3>Répartition des pertes</h3><ul><li><strong>Mortalité animale</strong> : 12 milliards USD (40%)</li><li><strong>Baisse de productivité</strong> : 8 milliards USD (27%)</li><li><strong>Restrictions commerciales</strong> : 6 milliards USD (20%)</li><li><strong>Coûts de traitement</strong> : 4 milliards USD (13%)</li></ul><h3>Recommandations</h3><p>L\'étude recommande un investissement annuel de 1,5 milliard de dollars dans les services vétérinaires publics, estimant le retour sur investissement à 1:20.</p>',
        content_en: '<h2>Considerable Losses</h2><p>A World Bank study estimates $30 billion per year in economic losses from animal diseases in sub-Saharan Africa.</p>',
        category: 'analysis',
        type: 'news'
      },
      {
        title_fr: 'Formation en ligne : nouveau cours sur la biosécurité en élevage',
        title_en: 'Online Training: New Course on Biosecurity in Livestock',
        slug: 'formation-biosecurite-elevage',
        excerpt_fr: 'AfricaVet lance un nouveau cours en ligne gratuit sur les principes de biosécurité appliqués à l\'élevage en Afrique.',
        excerpt_en: 'AfricaVet launches a new free online course on biosecurity principles applied to livestock in Africa.',
        content_fr: '<h2>Un cours accessible à tous</h2><p>AfricaVet, en partenariat avec l\'École Inter-États des Sciences et Médecine Vétérinaires de Dakar (EISMV), lance un nouveau cours en ligne gratuit sur la biosécurité en élevage.</p><h3>Programme du cours</h3><ol><li><strong>Module 1</strong> : Principes fondamentaux de la biosécurité</li><li><strong>Module 2</strong> : Évaluation des risques en élevage</li><li><strong>Module 3</strong> : Mesures de biosécurité par type d\'élevage</li><li><strong>Module 4</strong> : Plan de biosécurité : élaboration et mise en œuvre</li><li><strong>Module 5</strong> : Études de cas africains</li></ol><p>Le cours est disponible en français et en anglais, avec une certification gratuite à la clé.</p>',
        content_en: '<h2>A Course Accessible to All</h2><p>AfricaVet, in partnership with EISMV Dakar, launches a new free online course on biosecurity in livestock.</p>',
        category: 'news',
        type: 'article'
      }
    ];

    // Insert posts
    let inserted = 0;
    for (const post of posts) {
      const categoryId = catMap[post.category] || null;
      const now = new Date();
      // Stagger dates so they appear in order
      const publishDate = new Date(now.getTime() - (posts.length - inserted) * 2 * 24 * 60 * 60 * 1000);

      await conn.query(`
        INSERT INTO posts (
          title, title_fr, title_en, slug, excerpt, excerpt_fr, excerpt_en,
          content, content_fr, content_en, type, category_id, author_id,
          status, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)
      `, [
        post.title_fr, post.title_fr, post.title_en, post.slug,
        post.excerpt_fr, post.excerpt_fr, post.excerpt_en,
        post.content_fr, post.content_fr, post.content_en,
        post.type || 'post', categoryId, authorId,
        publishDate, publishDate, publishDate
      ]);
      inserted++;
      console.log(`   ✓ Created: ${post.title_fr.substring(0, 60)}...`);
    }

    console.log(`\n✅ Posts seeding completed: ${inserted} articles created`);

  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    throw error;
  } finally {
    await conn.end();
  }
}

seedPosts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
