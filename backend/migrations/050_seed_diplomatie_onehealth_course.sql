-- ============================================
-- SEED: Diplomatie One Health en contexte africain
-- Migration: 050_seed_diplomatie_onehealth_course.sql
-- Description: Complete course with 6 modules, 30 lessons, 7 quizzes (6 module + 1 final)
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- COURSE
-- ============================================
INSERT INTO courses (
    title_fr, title_en, slug, description_fr, description_en,
    short_description_fr, short_description_en,
    category_id, instructor_id, level, duration_hours, estimated_weeks,
    min_passing_score, allow_retake, max_attempts, sequential_modules,
    is_free, language,
    learning_objectives, target_audience, what_you_will_learn, requirements,
    status, is_featured, is_active, published_at
) VALUES (
    'Diplomatie One Health en contexte africain',
    'One Health Diplomacy in African Context',
    'diplomatie-one-health-afrique',
    'Ce cours approfondi explore les fondements, les institutions et les pratiques de la diplomatie sanitaire selon l''approche One Health (Une Seule Santé) dans le contexte spécifique du continent africain. À travers six modules couvrant les bases conceptuelles, le paysage sanitaire africain, la gouvernance internationale, les organisations continentales, les études de cas concrètes et les compétences de leadership, les apprenants acquerront une vision globale et opérationnelle de la diplomatie One Health. Le cours intègre des données factuelles, des analyses institutionnelles et des exemples tirés de crises sanitaires réelles sur le continent.',
    'This comprehensive course explores the foundations, institutions and practices of health diplomacy through the One Health approach in the specific context of the African continent. Through six modules covering conceptual foundations, the African health landscape, international governance, continental organizations, concrete case studies and leadership skills, learners will gain a comprehensive and operational vision of One Health diplomacy.',
    'Maîtrisez la diplomatie sanitaire One Health appliquée au contexte africain : institutions, négociations, études de cas et leadership.',
    'Master One Health diplomacy applied to the African context: institutions, negotiations, case studies and leadership.',
    4, 1, 'advanced', 30, 10,
    70, TRUE, 3, TRUE,
    TRUE, 'fr',
    '["Comprendre les fondements historiques et scientifiques de l''approche One Health", "Analyser le paysage sanitaire africain et ses défis transfrontaliers", "Maîtriser les cadres réglementaires internationaux (RSI, normes OMSA, Codex)", "Identifier le rôle des organisations africaines (UA, Africa CDC, AU-IBAR, CER)", "Appliquer les leçons des crises sanitaires majeures en Afrique", "Développer des compétences en négociation, plaidoyer et rédaction de politiques sanitaires"]',
    '["Vétérinaires et professionnels de santé animale", "Médecins et professionnels de santé publique", "Cadres des ministères de la Santé, de l''Élevage et de l''Environnement", "Diplomates et fonctionnaires internationaux", "Chercheurs en santé mondiale et One Health", "Étudiants en master ou doctorat en santé publique vétérinaire"]',
    '["Les principes fondateurs de l''approche One Health et leur évolution historique", "Le fonctionnement de l''alliance Quadripartite (OMS, FAO, OMSA, PNUE)", "Les mécanismes de la diplomatie sanitaire internationale", "Le rôle stratégique de l''Africa CDC et de l''AU-IBAR", "Les leçons des réponses africaines à Ebola, H5N1, COVID-19, rage et PPR", "Les techniques de négociation et de plaidoyer en santé mondiale"]',
    '["Connaissances de base en santé publique ou santé animale", "Compréhension générale des organisations internationales", "Intérêt pour les politiques de santé en Afrique"]',
    'published', TRUE, TRUE, NOW()
);

SET @course_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 1: Fondements de l'approche One Health
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Fondements de l''approche One Health', 'Foundations of the One Health Approach',
    'Ce module explore les origines historiques, les principes fondateurs et le cadre institutionnel de l''approche One Health, en mettant l''accent sur les zoonoses et les liens avec les Objectifs de Développement Durable.',
    'This module explores the historical origins, founding principles and institutional framework of the One Health approach, with emphasis on zoonoses and links to the Sustainable Development Goals.',
    1, TRUE, 'published', TRUE, 5);
SET @mod1_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 2: Le paysage sanitaire africain
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Le paysage sanitaire africain', 'The African Health Landscape',
    'Ce module dresse un panorama complet des systèmes de santé animale en Afrique, des maladies transfrontalières, de la résistance antimicrobienne, du changement climatique et de la sécurité sanitaire des aliments.',
    'This module provides a comprehensive overview of animal health systems in Africa, transboundary diseases, antimicrobial resistance, climate change and food safety.',
    2, TRUE, 'published', TRUE, 5);
SET @mod2_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 3: Diplomatie sanitaire et gouvernance
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Diplomatie sanitaire et gouvernance', 'Health Diplomacy and Governance',
    'Ce module examine les principes de la diplomatie sanitaire, le Règlement Sanitaire International, les normes de l''OMSA, les négociations multilatérales et les stratégies de plaidoyer en santé One Health.',
    'This module examines the principles of health diplomacy, the International Health Regulations, WOAH standards, multilateral negotiations and One Health advocacy strategies.',
    3, TRUE, 'published', TRUE, 5);
SET @mod3_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 4: Organisations et initiatives africaines
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Organisations et initiatives africaines', 'African Organizations and Initiatives',
    'Ce module présente les principales institutions africaines impliquées dans la santé One Health : l''Union Africaine, l''Africa CDC, l''AU-IBAR, les Communautés Économiques Régionales et les initiatives de financement.',
    'This module presents the main African institutions involved in One Health: the African Union, Africa CDC, AU-IBAR, Regional Economic Communities and financing initiatives.',
    4, TRUE, 'published', TRUE, 5);
SET @mod4_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 5: Études de cas et réponses africaines
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Études de cas et réponses africaines', 'Case Studies and African Responses',
    'Ce module analyse cinq crises sanitaires majeures en Afrique (H5N1, Ebola, rage, PPR, COVID-19) et les leçons tirées en matière de coordination, diplomatie et coopération sanitaire.',
    'This module analyzes five major health crises in Africa (H5N1, Ebola, rabies, PPR, COVID-19) and the lessons learned in coordination, diplomacy and health cooperation.',
    5, TRUE, 'published', TRUE, 5);
SET @mod5_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 6: Leadership et compétences du diplomate One Health
-- ============================================
INSERT INTO course_modules (course_id, title_fr, title_en, description_fr, description_en, sort_order, has_quiz, status, is_active, lesson_count)
VALUES (@course_id, 'Leadership et compétences du diplomate One Health', 'Leadership and One Health Diplomat Skills',
    'Ce module développe les compétences clés du diplomate One Health : profil professionnel, techniques de négociation, rédaction de politiques, mobilisation de ressources et éthique en diplomatie sanitaire.',
    'This module develops the key skills of the One Health diplomat: professional profile, negotiation techniques, policy writing, resource mobilization and ethics in health diplomacy.',
    6, TRUE, 'published', TRUE, 5);
SET @mod6_id = LAST_INSERT_ID();

-- ============================================
-- MODULE 1 - LEÇONS
-- ============================================

-- M1L1: Origines et évolution du concept One Health
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, is_preview, status, is_active) VALUES
(@mod1_id, 'Origines et évolution du concept One Health', 'Origins and Evolution of the One Health Concept',
'<h2>Origines et évolution du concept One Health</h2>

<h3>Les racines historiques : de l''Antiquité au XIXe siècle</h3>
<p>L''idée que la santé humaine et la santé animale sont intrinsèquement liées n''est pas nouvelle. <strong>Hippocrate</strong> (460-370 av. J.-C.), dans son traité <em>Des airs, des eaux et des lieux</em>, soulignait déjà l''influence de l''environnement sur la santé. Cependant, c''est au XIXe siècle que cette intuition prend une forme scientifique structurée.</p>

<p><strong>Rudolf Virchow</strong> (1821-1902), médecin et pathologiste allemand, est souvent considéré comme le père fondateur de la médecine comparée. En étudiant la trichinose, une maladie parasitaire transmise du porc à l''homme, il forge le terme <strong>« zoonose »</strong> en 1855 et déclare : <em>« Entre la médecine animale et la médecine humaine, il n''y a pas de frontière – et il ne devrait pas y en avoir. »</em> Cette vision unitaire de la médecine posera les fondations conceptuelles de ce qui deviendra l''approche One Health.</p>

<p>Parallèlement, <strong>William Osler</strong> (1849-1919), considéré comme le père de la médecine moderne en Amérique du Nord, a aussi pratiqué la médecine vétérinaire et défendu une vision intégrée de la santé, reconnaissant les liens indissociables entre pathologies humaines et animales.</p>

<h3>Calvin Schwabe et la « One Medicine »</h3>
<p>Au XXe siècle, le vétérinaire épidémiologiste américain <strong>Calvin Schwabe</strong> (1927-2006) formalise le concept de <strong>« One Medicine »</strong> (Une Seule Médecine) dans son ouvrage fondateur <em>Veterinary Medicine and Human Health</em> (1984, 3e édition). Schwabe démontre que la séparation artificielle entre médecine humaine et vétérinaire constitue un obstacle majeur à la compréhension et au contrôle des maladies, en particulier des zoonoses. Son travail sur l''échinococcose au Kenya illustre concrètement cette approche intégrée.</p>

<blockquote><p>« Il n''y a pas de différence de paradigme entre la médecine humaine et la médecine vétérinaire. Les deux sont des études du même processus biologique. » — Calvin Schwabe</p></blockquote>

<h3>Les Principes de Manhattan (2004)</h3>
<p>Le tournant décisif survient en septembre 2004, lorsque la <strong>Wildlife Conservation Society (WCS)</strong> organise un symposium historique à la Rockefeller University de New York. Ce symposium réunit 32 experts internationaux en santé humaine, santé animale et conservation. Les participants adoptent les <strong>« 12 Principes de Manhattan »</strong>, qui établissent formellement les liens entre santé humaine, santé animale et intégrité des écosystèmes.</p>

<p>Les principes clés comprennent :</p>
<ul>
<li>Reconnaître le lien essentiel entre santé humaine, animale domestique et sauvage</li>
<li>Adopter une approche holistique pour prévenir les épidémies et épizooties</li>
<li>Investir dans l''infrastructure mondiale de surveillance sanitaire</li>
<li>Intégrer la conservation de la biodiversité comme mesure de santé publique</li>
<li>Développer des cadres de gouvernance adaptés aux menaces transfrontalières</li>
</ul>

<h3>L''émergence du terme « One Health »</h3>
<p>Le terme <strong>« One Health »</strong> (Une Seule Santé) s''impose progressivement à partir de 2006-2007, porté par des institutions majeures. L''<strong>American Veterinary Medical Association (AVMA)</strong> crée un groupe de travail One Health en 2007. L''<strong>American Medical Association (AMA)</strong> adopte une résolution soutenant le concept en 2007. Le mouvement se structure avec la création de la <strong>One Health Commission</strong> en 2009 et du <strong>One Health Global Network</strong>.</p>

<h3>Les Principes de Berlin (2019)</h3>
<p>En octobre 2019, lors du <strong>One Health World Congress</strong> à Berlin, les experts actualisent les Principes de Manhattan avec les <strong>« Principes de Berlin »</strong>. Ces nouveaux principes intègrent les dimensions absentes en 2004 :</p>
<ul>
<li>La <strong>résistance antimicrobienne (RAM)</strong> comme menace One Health prioritaire</li>
<li>Le <strong>changement climatique</strong> et ses impacts sur la distribution des vecteurs et pathogènes</li>
<li>La <strong>sécurité alimentaire</strong> et les systèmes agroalimentaires durables</li>
<li>La nécessité d''<strong>approches transdisciplinaires</strong> incluant sciences sociales et économiques</li>
<li>L''importance de l''<strong>équité</strong> et de l''accès universel aux soins de santé</li>
</ul>

<h3>La définition opérationnelle OHHLEP (2021)</h3>
<p>En décembre 2021, le <strong>One Health High-Level Expert Panel (OHHLEP)</strong>, créé conjointement par l''OMS, la FAO, l''OMSA et le PNUE, adopte la première <strong>définition opérationnelle consensuelle</strong> de One Health : <em>« One Health est une approche intégrée et unificatrice qui vise à équilibrer et optimiser durablement la santé des personnes, des animaux et des écosystèmes. Elle reconnaît que la santé des humains, des animaux domestiques et sauvages, des plantes et de l''environnement au sens large sont étroitement liées et interdépendantes. »</em></p>

<p>Cette définition marque un jalon important car elle est adoptée par les quatre organisations internationales de référence et sert désormais de base aux politiques et programmes One Health dans le monde entier, y compris en Afrique.</p>',
'text', 20, 1, TRUE, 'published', TRUE);

-- M1L2: Les trois piliers
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod1_id, 'Les trois piliers : santé humaine, animale et environnementale', 'The Three Pillars: Human, Animal and Environmental Health',
'<h2>Les trois piliers : santé humaine, animale et environnementale</h2>

<h3>Le triptyque fondamental</h3>
<p>L''approche One Health repose sur trois piliers indissociables dont les interactions déterminent l''état de santé global des populations. Comprendre ces interconnexions est essentiel pour tout professionnel de la diplomatie sanitaire, car elles définissent les enjeux politiques et les besoins de coordination institutionnelle.</p>

<h3>Premier pilier : la santé humaine</h3>
<p>La santé humaine en Afrique est marquée par un <strong>double fardeau de morbidité</strong> : les maladies infectieuses (paludisme, tuberculose, VIH/SIDA) persistent tandis que les maladies non transmissibles (diabète, hypertension) progressent rapidement. Selon l''OMS, l''Afrique supporte <strong>25 % de la charge mondiale de morbidité</strong> avec seulement <strong>3 % des professionnels de santé mondiaux</strong> et moins de <strong>1 % des dépenses mondiales de santé</strong>.</p>

<p>Les déterminants sociaux — pauvreté, accès à l''eau potable, assainissement, éducation — jouent un rôle crucial. En 2023, environ <strong>400 millions d''Africains</strong> n''avaient pas accès à des services de santé essentiels. La densité médicale moyenne en Afrique subsaharienne est de <strong>2,7 médecins pour 10 000 habitants</strong>, contre une recommandation OMS de 44,5.</p>

<h3>Deuxième pilier : la santé animale</h3>
<p>L''Afrique abrite environ <strong>360 millions de bovins, 430 millions de caprins et 390 millions d''ovins</strong>. Le secteur de l''élevage contribue à <strong>30-50 % du PIB agricole</strong> dans la plupart des pays africains et fait vivre directement ou indirectement environ <strong>350 millions de personnes</strong>.</p>

<p>Les maladies animales causent des pertes économiques considérables :</p>
<ul>
<li><strong>Fièvre aphteuse (FA)</strong> : pertes estimées à 6,5 milliards USD/an en Afrique</li>
<li><strong>Peste des petits ruminants (PPR)</strong> : 2,1 milliards USD/an de pertes</li>
<li><strong>Trypanosomiase animale</strong> : 4,5 milliards USD/an, affectant 10 millions de km² en Afrique</li>
<li><strong>Péripneumonie contagieuse bovine (PPCB)</strong> : mortalité pouvant atteindre 50 % dans les troupeaux naïfs</li>
</ul>

<p>La santé animale est aussi un <strong>enjeu de sécurité alimentaire</strong>. Les produits d''origine animale fournissent des protéines essentielles, du fer héminique et des vitamines B12 irremplaçables pour les populations vulnérables, en particulier les enfants et les femmes enceintes.</p>

<h3>Troisième pilier : la santé environnementale</h3>
<p>L''environnement africain subit des transformations profondes qui affectent directement les deux autres piliers :</p>
<ul>
<li><strong>Déforestation</strong> : l''Afrique perd environ 3,9 millions d''hectares de forêt par an (FAO 2020), créant de nouvelles interfaces homme-faune sauvage</li>
<li><strong>Urbanisation rapide</strong> : la population urbaine africaine doublera d''ici 2050 (de 600 millions à 1,2 milliard), multipliant les risques sanitaires liés à l''assainissement insuffisant</li>
<li><strong>Pollution des eaux</strong> : 115 millions d''Africains dépendent de sources d''eau de surface non traitées</li>
<li><strong>Perte de biodiversité</strong> : le déclin des populations d''espèces sauvages modifie les dynamiques des pathogènes</li>
</ul>

<h3>Les interconnexions : exemples concrets</h3>
<p>Les trois piliers interagissent en permanence. Voici des exemples africains illustratifs :</p>

<p><strong>Fièvre de la Vallée du Rift (FVR) :</strong> Cette zoonose virale illustre parfaitement le nexus One Health. Les fortes pluies (environnement) provoquent la prolifération des moustiques vecteurs, qui infectent le bétail (santé animale). Les humains se contaminent par contact avec les animaux malades ou leurs produits (santé humaine). L''épidémie de 2006-2007 en Afrique de l''Est a causé plus de 1 000 cas humains et des pertes animales massives.</p>

<p><strong>Trypanosomiase :</strong> La mouche tsé-tsé (Glossina spp.) transmet à la fois la <em>nagana</em> (trypanosomiase animale) et la maladie du sommeil (trypanosomiase humaine africaine). La modification des habitats par l''agriculture influence la distribution des glossines, affectant simultanément la santé humaine et animale.</p>

<p><strong>Résistance antimicrobienne :</strong> L''utilisation non réglementée d''antibiotiques dans l''élevage intensif périurbain en Afrique contribue à la sélection de bactéries résistantes qui se transmettent à l''homme via la chaîne alimentaire et l''environnement (sols, eaux usées).</p>

<h3>Les facteurs amplificateurs en Afrique</h3>
<p>Plusieurs facteurs spécifiques au continent africain intensifient les interactions entre les trois piliers :</p>
<ul>
<li><strong>Pastoralisme transhumant</strong> : 50 millions de pasteurs nomades parcourent des corridors transfrontaliers, créant des interfaces dynamiques</li>
<li><strong>Marchés d''animaux vivants</strong> : points chauds de transmission zoonotique dans les zones urbaines et périurbaines</li>
<li><strong>Exploitation minière artisanale</strong> : perturbation des habitats naturels et contact accru avec la faune sauvage</li>
<li><strong>Commerce de viande de brousse</strong> : estimé à 5 millions de tonnes/an en Afrique centrale, interface directe homme-faune</li>
</ul>',
'text', 20, 2, 'published', TRUE);

-- M1L3: Cadre institutionnel international
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod1_id, 'Cadre institutionnel international : l''alliance Quadripartite', 'International Institutional Framework: The Quadripartite Alliance',
'<h2>Cadre institutionnel international : l''alliance Quadripartite</h2>

<h3>La genèse de la collaboration tripartite</h3>
<p>Avant de devenir Quadripartite, la collaboration internationale en matière de One Health s''est structurée autour d''une <strong>alliance tripartite</strong> formée en 2010 entre l''<strong>Organisation Mondiale de la Santé (OMS)</strong>, l''<strong>Organisation des Nations Unies pour l''alimentation et l''agriculture (FAO)</strong> et l''<strong>Organisation Mondiale de la Santé Animale (OMSA, anciennement OIE)</strong>. Cette alliance a été formalisée par une note conceptuelle tripartite intitulée <em>« Sharing responsibilities and coordinating global activities to address health risks at the animal-human-ecosystems interfaces »</em>.</p>

<h3>L''Organisation Mondiale de la Santé (OMS)</h3>
<p>Fondée en 1948, l''OMS est l''autorité directrice et coordinatrice de la santé au sein du système des Nations Unies. Dans le cadre One Health :</p>
<ul>
<li><strong>Règlement Sanitaire International (RSI 2005)</strong> : cadre juridique contraignant pour 196 États Parties, couvrant la détection et la réponse aux urgences de santé publique de portée internationale (USPPI)</li>
<li><strong>Bureau régional pour l''Afrique (AFRO)</strong> basé à Brazzaville : coordonne les activités OMS dans 47 pays africains</li>
<li><strong>Programme de gestion des urgences sanitaires (WHE)</strong> : capacité de réponse rapide déployée lors d''Ebola, COVID-19, mpox</li>
<li><strong>13e Programme général de travail (GPW13, 2019-2025)</strong> : intègre explicitement l''approche One Health</li>
</ul>

<h3>L''Organisation des Nations Unies pour l''alimentation et l''agriculture (FAO)</h3>
<p>La FAO, fondée en 1945 et basée à Rome, joue un rôle central dans la santé animale liée à la sécurité alimentaire :</p>
<ul>
<li><strong>Centre de gestion des crises pour la santé animale (CMC-AH)</strong> : déploiement rapide d''experts lors de flambées de maladies animales</li>
<li><strong>Système mondial d''information sur les maladies animales (EMPRES-i)</strong> : plateforme de surveillance épidémiologique</li>
<li><strong>Commission des mesures sanitaires et phytosanitaires</strong> : élaboration des normes Codex Alimentarius</li>
<li><strong>Bureau régional pour l''Afrique</strong> basé à Accra : programmes ECTAD (Emergency Centre for Transboundary Animal Diseases) dans plus de 25 pays africains</li>
</ul>

<h3>L''Organisation Mondiale de la Santé Animale (OMSA/OIE)</h3>
<p>Créée en 1924 sous le nom d''Office International des Épizooties (OIE), rebaptisée <strong>OMSA</strong> en 2022, elle compte <strong>183 Membres</strong> dont 54 pays africains. Son rôle est fondamental :</p>
<ul>
<li><strong>Code sanitaire pour les animaux terrestres et aquatiques</strong> : normes de référence pour le commerce international</li>
<li><strong>WAHIS (World Animal Health Information System)</strong> : système mondial de notification des maladies animales en temps réel</li>
<li><strong>Processus PVS (Performance des Services Vétérinaires)</strong> : évaluation et renforcement des services vétérinaires nationaux — plus de 140 missions PVS réalisées, dont 45 en Afrique</li>
<li><strong>Représentation sous-régionale pour l''Afrique</strong> : bureaux à Bamako, Nairobi, Gaborone et Tunis</li>
<li><strong>Réseau de laboratoires de référence</strong> : 320 laboratoires dans le monde, dont un nombre croissant en Afrique</li>
</ul>

<h3>Le Programme des Nations Unies pour l''environnement (PNUE)</h3>
<p>Le PNUE, dont le siège est à <strong>Nairobi, Kenya</strong> — la seule agence onusienne dont le siège est en Afrique — rejoint l''alliance en mars 2022, la transformant en <strong>Quadripartite</strong>. Son apport est crucial :</p>
<ul>
<li>Expertise en <strong>biodiversité, changement climatique et pollution</strong></li>
<li>Gestion des <strong>écosystèmes</strong> et des interfaces homme-faune sauvage</li>
<li>Cadre juridique environnemental : <strong>Convention sur la Diversité Biologique (CDB)</strong>, conventions de Bâle, Rotterdam, Stockholm</li>
<li>Monitoring environnemental : qualité de l''air, de l''eau, des sols</li>
</ul>

<h3>Le Plan d''action conjoint One Health (2022-2026)</h3>
<p>En octobre 2022, l''alliance Quadripartite lance le <strong>One Health Joint Plan of Action (OH JPA)</strong>, articulé autour de six pistes d''action :</p>
<ol>
<li><strong>Renforcer les capacités One Health</strong> des pays</li>
<li><strong>Réduire les risques</strong> liés aux zoonoses émergentes et ré-émergentes</li>
<li><strong>Lutter contre la résistance antimicrobienne (RAM)</strong></li>
<li><strong>Améliorer la sécurité sanitaire des aliments</strong></li>
<li><strong>Réduire les menaces environnementales</strong></li>
<li><strong>Intégrer la santé dans les politiques de développement</strong></li>
</ol>

<p>Ce plan représente un investissement estimé à <strong>861 millions USD sur cinq ans</strong>, dont une part significative est destinée à l''Afrique. Il constitue le cadre de référence pour les pays africains développant leurs propres plateformes One Health nationales.</p>

<h3>Implications pour la diplomatie africaine</h3>
<p>Pour les diplomates et décideurs africains, comprendre le fonctionnement de l''alliance Quadripartite est indispensable car :</p>
<ul>
<li>Les <strong>normes</strong> élaborées par ces organisations sont contraignantes ou quasi-contraignantes pour les États membres</li>
<li>Les <strong>mécanismes de financement</strong> internationaux s''alignent sur ces cadres</li>
<li>Les <strong>positions de négociation</strong> des blocs africains doivent s''articuler avec ces mandats institutionnels</li>
<li>La <strong>représentation africaine</strong> dans les organes directeurs de ces organisations est un enjeu stratégique</li>
</ul>',
'text', 20, 3, 'published', TRUE);

-- M1L4: Les zoonoses
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod1_id, 'Les zoonoses : interface homme-animal', 'Zoonoses: The Human-Animal Interface',
'<h2>Les zoonoses : interface homme-animal</h2>

<h3>Définition et ampleur du problème</h3>
<p>Les zoonoses sont des maladies infectieuses qui se transmettent naturellement des animaux vertébrés à l''homme et vice-versa. Selon les données compilées par l''OMS et l''OMSA, <strong>75 % des maladies infectieuses émergentes chez l''homme sont d''origine zoonotique</strong>. Sur les 1 400 agents pathogènes humains identifiés, environ <strong>60 % sont d''origine animale</strong>. Chaque année, les zoonoses causent <strong>2,5 milliards de cas de maladie</strong> et <strong>2,7 millions de décès</strong> dans le monde.</p>

<h3>Mécanismes de franchissement de la barrière d''espèce (spillover)</h3>
<p>Le <strong>spillover</strong> (franchissement de barrière d''espèce) est le processus par lequel un pathogène passe d''un réservoir animal à l''homme. Plusieurs facteurs facilitent ce phénomène :</p>
<ul>
<li><strong>Contact direct</strong> : manipulation d''animaux infectés, abattage, dépeçage (exemple : Ebola via la manipulation de chauves-souris frugivores ou de primates)</li>
<li><strong>Contact indirect</strong> : vecteurs arthropodes (moustiques, tiques), environnement contaminé</li>
<li><strong>Voie alimentaire</strong> : consommation de produits animaux contaminés (lait non pasteurisé → brucellose, viande mal cuite → anthrax)</li>
<li><strong>Voie aérosol</strong> : inhalation de particules contaminées (fièvre Q, influenza aviaire)</li>
</ul>

<h3>Les zoonoses majeures en Afrique</h3>

<p><strong>Rage :</strong> L''Afrique est le continent le plus touché par la rage, avec environ <strong>21 000 décès humains par an</strong> (36 % des décès mondiaux). Le chien domestique est responsable de <strong>99 % des transmissions</strong> à l''homme. Le coût économique est estimé à <strong>583 millions USD/an</strong> en Afrique, incluant les pertes en vies humaines, les traitements post-exposition et les pertes de bétail. Malgré l''existence d''un vaccin efficace, les taux de vaccination canine restent inférieurs à <strong>20 %</strong> dans la plupart des pays africains, loin du seuil de <strong>70 %</strong> nécessaire pour interrompre la transmission.</p>

<p><strong>Brucellose :</strong> Causée principalement par <em>Brucella abortus</em> (bovins) et <em>B. melitensis</em> (petits ruminants), la brucellose est endémique dans toute l''Afrique. Elle provoque des avortements chez le bétail et une fièvre ondulante chronique chez l''homme. La prévalence chez les bovins varie de <strong>5 à 25 %</strong> selon les régions, et l''incidence humaine est largement sous-estimée en raison de diagnostics erronés (confondue avec le paludisme).</p>

<p><strong>Tuberculose bovine :</strong> <em>Mycobacterium bovis</em> est responsable de <strong>10 % des cas de tuberculose humaine</strong> en Afrique, principalement via la consommation de lait non pasteurisé. La co-infection avec le VIH aggrave considérablement le pronostic. Le dépistage systématique chez les bovins (test tuberculinique intradermique) reste rare en Afrique subsaharienne.</p>

<p><strong>Anthrax (Fièvre charbonneuse) :</strong> <em>Bacillus anthracis</em> persiste dans les sols sous forme de spores pendant des décennies. Des foyers récurrents sont signalés en Afrique de l''Ouest, de l''Est et australe. Au Zimbabwe, une flambée en 2004 a causé plus de <strong>10 000 cas chez le bétail</strong> et 350 cas humains. La maladie est souvent associée à la consommation de viande d''animaux morts de cause inconnue.</p>

<p><strong>Fièvre de la Vallée du Rift (FVR) :</strong> Ce virus à transmission vectorielle (moustiques du genre <em>Aedes</em> et <em>Culex</em>) cause des avortements en tempête chez les ruminants et une fièvre hémorragique chez l''homme. Les épidémies cycliques sont liées aux phénomènes El Niño/La Niña. L''épidémie de 2006-2007 au Kenya, en Somalie et en Tanzanie a touché plus de <strong>700 personnes</strong> avec un taux de létalité de <strong>23 %</strong>.</p>

<h3>Les facteurs de risque spécifiques à l''Afrique</h3>
<p>Plusieurs facteurs amplifient le risque zoonotique sur le continent :</p>
<ul>
<li><strong>Proximité homme-animal</strong> : dans de nombreuses communautés rurales, les animaux partagent l''habitat domestique</li>
<li><strong>Faiblesse des systèmes de surveillance</strong> : seulement <strong>19 des 54 pays africains</strong> ont des systèmes de surveillance zoonotique intégrés opérationnels</li>
<li><strong>Capacités de laboratoire limitées</strong> : moins de <strong>30 %</strong> des pays africains disposent de laboratoires BSL-3</li>
<li><strong>Croissance démographique</strong> : la population africaine atteindra 2,5 milliards en 2050, intensifiant la pression sur les habitats naturels</li>
<li><strong>Commerce informel d''animaux</strong> : les marchés de bétail transfrontaliers échappent largement à la surveillance sanitaire</li>
</ul>

<h3>Vers une surveillance intégrée</h3>
<p>La réponse aux zoonoses exige une approche intégrée, associant les services de santé publique, les services vétérinaires et les acteurs environnementaux. Des initiatives comme le <strong>GHSA (Global Health Security Agenda)</strong> et le <strong>programme REDISSE</strong> de la Banque mondiale visent à renforcer ces capacités en Afrique de l''Ouest et centrale. La clé réside dans l''<strong>interopérabilité des systèmes de surveillance</strong> humaine et animale, qui reste un défi majeur sur le continent.</p>',
'text', 22, 4, 'published', TRUE);

-- M1L5: One Health et les ODD
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod1_id, 'One Health et les Objectifs de Développement Durable', 'One Health and the Sustainable Development Goals',
'<h2>One Health et les Objectifs de Développement Durable</h2>

<h3>L''Agenda 2030 et l''approche One Health</h3>
<p>Adoptés par l''Assemblée générale des Nations Unies en septembre 2015, les <strong>17 Objectifs de Développement Durable (ODD)</strong> constituent le cadre de référence mondial pour le développement à l''horizon 2030. L''approche One Health est un catalyseur transversal qui contribue directement ou indirectement à au moins <strong>12 des 17 ODD</strong>. Pour les diplomates africains, cette convergence offre un levier stratégique puissant pour mobiliser des ressources et construire des coalitions politiques.</p>

<h3>ODD 1 : Pas de pauvreté</h3>
<p>En Afrique, <strong>70 % des personnes vivant dans l''extrême pauvreté</strong> dépendent de l''élevage pour leur subsistance. Les épizooties comme la peste bovine (éradiquée en 2011) ou la PPR peuvent dévaster des communautés entières. La campagne mondiale d''éradication de la peste bovine, qui a coûté <strong>5 milliards USD sur 50 ans</strong>, génère désormais des économies annuelles estimées à <strong>920 millions USD</strong> pour l''Afrique seule. Les interventions One Health intégrées — vaccination animale combinée à la sensibilisation sanitaire humaine — offrent le meilleur rapport coût-efficacité.</p>

<h3>ODD 2 : Faim « zéro »</h3>
<p>La sécurité alimentaire en Afrique est directement menacée par les maladies animales. Les pertes de production animale dues aux maladies représentent <strong>25-30 % de la production</strong> dans les pays en développement. La <strong>trypanosomiase animale</strong> rend 10 millions de km² impropres à l''élevage bovin en Afrique. Les aflatoxines, produites par des champignons contaminant les cultures céréalières, causent des pertes de <strong>670 millions USD/an</strong> en Afrique et augmentent le risque de cancer du foie. L''approche One Health intègre la lutte contre ces menaces dans une stratégie cohérente.</p>

<h3>ODD 3 : Bonne santé et bien-être</h3>
<p>C''est l''ODD le plus directement lié à One Health. La cible 3.3 vise à mettre fin aux épidémies de maladies tropicales négligées, dont plusieurs sont zoonotiques (rage, échinococcose, leishmaniose, trypanosomiase humaine africaine). La cible 3.d sur le renforcement des capacités d''alerte et de gestion des risques sanitaires est au cœur du RSI 2005. Le <strong>Joint External Evaluation (JEE)</strong> évalue spécifiquement les capacités One Health des pays, et à ce jour, <strong>46 pays africains</strong> ont complété au moins une évaluation JEE.</p>

<h3>ODD 6 : Eau propre et assainissement</h3>
<p>L''interface eau-santé-environnement est fondamentale en contexte One Health. Les <strong>maladies hydriques</strong> (choléra, typhoïde, leptospirose) sont souvent liées à la contamination des sources d''eau par les déjections animales. En Afrique subsaharienne, <strong>36 % de la population</strong> n''a pas accès à l''eau potable gérée en toute sécurité. Les systèmes pastoraux transhumants et les abreuvoirs partagés entre bétail et communautés humaines sont des points critiques de transmission.</p>

<h3>ODD 13 : Mesures relatives à la lutte contre les changements climatiques</h3>
<p>Le changement climatique est un <strong>multiplicateur de menaces</strong> One Health en Afrique :</p>
<ul>
<li>Expansion des zones favorables aux vecteurs (moustiques, tiques) vers de nouvelles altitudes et latitudes</li>
<li>Modification des régimes pluviométriques affectant les cycles épidémiologiques de la FVR</li>
<li>Sécheresses prolongées forçant les déplacements de bétail et les conflits pastoraux</li>
<li>L''élevage contribue à <strong>14,5 % des émissions mondiales de gaz à effet de serre</strong> (FAO), dont une part importante en Afrique</li>
</ul>
<p>Le <strong>Cadre de l''Union Africaine sur le changement climatique</strong> intègre désormais des composantes One Health, reconnaissant que l''adaptation climatique doit considérer simultanément la santé humaine, animale et environnementale.</p>

<h3>ODD 15 : Vie terrestre</h3>
<p>La conservation de la biodiversité est un pilier de la prévention des pandémies. La <strong>déforestation</strong> et la fragmentation des habitats augmentent les contacts entre faune sauvage et populations humaines/animales domestiques, favorisant le spillover de pathogènes. Le bassin du Congo, deuxième massif forestier mondial, perd <strong>500 000 hectares/an</strong>. Les <strong>aires protégées</strong> d''Afrique (couvrant environ 14 % du territoire continental) jouent un rôle de tampon épidémiologique en maintenant les écosystèmes intacts.</p>

<h3>Indicateurs et mécanismes de suivi</h3>
<p>Le suivi de la contribution One Health aux ODD s''appuie sur plusieurs cadres :</p>
<ul>
<li><strong>Indice de sécurité sanitaire mondiale (GHS Index)</strong> : évalue 195 pays ; en 2021, le score moyen africain était de <strong>30,8/100</strong> contre une moyenne mondiale de 38,9</li>
<li><strong>Outil d''évaluation SPAR (State Party Self-Assessment Annual Reporting)</strong> : auto-évaluation RSI des pays</li>
<li><strong>Outil PVS de l''OMSA</strong> : évaluation des services vétérinaires selon 47 compétences critiques</li>
<li><strong>Scorecard de l''Africa CDC</strong> : tableau de bord continental des capacités de préparation sanitaire</li>
</ul>

<p>Pour les négociateurs africains, l''intégration de l''approche One Health dans les rapports volontaires nationaux (VNR) sur les ODD constitue un levier stratégique pour attirer les financements internationaux et démontrer la transversalité des investissements en santé.</p>',
'text', 18, 5, 'published', TRUE);

-- ============================================
-- MODULE 2 - LEÇONS
-- ============================================

-- M2L1: Panorama des systèmes de santé animale en Afrique
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod2_id, 'Panorama des systèmes de santé animale en Afrique', 'Overview of Animal Health Systems in Africa',
'<h2>Panorama des systèmes de santé animale en Afrique</h2>

<h3>Héritage colonial et restructurations post-indépendance</h3>
<p>Les systèmes de santé animale en Afrique portent l''empreinte de l''histoire coloniale. Les puissances coloniales avaient mis en place des <strong>services vétérinaires étatiques centralisés</strong>, principalement orientés vers la protection du bétail des colons et le contrôle des maladies affectant le commerce. Après les indépendances (années 1960-1970), la plupart des pays ont maintenu ces structures, mais les <strong>programmes d''ajustement structurel</strong> des années 1980-1990, imposés par le FMI et la Banque mondiale, ont entraîné un démantèlement massif des services vétérinaires publics.</p>

<p>Les conséquences de cette libéralisation ont été dramatiques :</p>
<ul>
<li>Réduction de <strong>40-60 %</strong> des effectifs vétérinaires publics dans de nombreux pays</li>
<li>Fermeture de laboratoires de diagnostic vétérinaire régionaux</li>
<li>Abandon des campagnes de vaccination de masse (sauf pour la peste bovine, financée internationalement)</li>
<li>Privatisation partielle sans cadre réglementaire adéquat</li>
</ul>

<h3>Ressources humaines vétérinaires : un déficit chronique</h3>
<p>L''Afrique souffre d''un <strong>déficit critique en personnels vétérinaires</strong>. Selon les données de l''OMSA et de l''AU-IBAR :</p>
<ul>
<li>L''Afrique compte environ <strong>75 000 vétérinaires</strong> pour 1,4 milliard d''habitants et plus d''un milliard de têtes de bétail</li>
<li>Le ratio moyen est de <strong>1 vétérinaire pour 57 000 habitants</strong> (contre 1 pour 3 000 en Europe)</li>
<li>Seuls <strong>36 des 54 pays africains</strong> disposent d''une faculté de médecine vétérinaire</li>
<li>Le continent forme environ <strong>5 000 vétérinaires par an</strong>, insuffisant pour combler les départs à la retraite et la croissance du cheptel</li>
<li>La <strong>fuite des cerveaux</strong> aggrave le problème : 20-30 % des diplômés émigrent vers les pays développés</li>
</ul>

<p>Les <strong>paraprofessionnels vétérinaires</strong> (auxiliaires, agents communautaires de santé animale, inséminateurs) constituent la colonne vertébrale réelle des services de terrain. L''OMSA a publié en 2019 des <strong>Lignes directrices sur les compétences des paraprofessionnels vétérinaires</strong>, reconnaissant formellement leur rôle essentiel. Plusieurs pays africains (Kenya, Éthiopie, Tchad, Mali) ont développé des cadres nationaux de formation et d''accréditation de ces agents.</p>

<h3>Infrastructure de laboratoire</h3>
<p>Le diagnostic est la pierre angulaire de la surveillance épidémiologique. En Afrique :</p>
<ul>
<li><strong>Laboratoires de référence nationaux</strong> : la plupart des pays disposent d''un laboratoire central vétérinaire, mais leurs capacités varient considérablement</li>
<li><strong>Laboratoires régionaux de l''UA-PANVAC</strong> : le Centre Panafricain de Vaccins Vétérinaires, basé à Debre Zeit (Éthiopie), assure le contrôle de qualité des vaccins vétérinaires</li>
<li><strong>Réseau RESOLAB</strong> : réseau de laboratoires de diagnostic de la grippe aviaire et de la maladie de Newcastle en Afrique de l''Ouest et centrale, soutenu par la FAO</li>
<li>Défis persistants : maintenance des équipements, approvisionnement en réactifs, chaîne du froid, biosécurité, accréditation ISO 17025</li>
</ul>

<h3>Budgets et financement</h3>
<p>Le financement des services vétérinaires en Afrique reste chroniquement insuffisant :</p>
<ul>
<li>Les budgets nationaux alloués à la santé animale représentent généralement <strong>moins de 1 % du budget agricole</strong></li>
<li>La <strong>dépendance aux financements extérieurs</strong> est forte : 50-80 % des programmes de lutte contre les maladies animales sont financés par des bailleurs internationaux</li>
<li>Le ratio investissement/retour est pourtant favorable : <strong>1 USD investi dans les services vétérinaires rapporte 5-7 USD</strong> en bénéfices économiques (Banque mondiale)</li>
</ul>

<h3>Processus PVS : évaluer pour mieux investir</h3>
<p>Le <strong>Processus PVS (Performance des Services Vétérinaires)</strong> de l''OMSA est l''outil de référence pour évaluer et renforcer les services vétérinaires. Il comprend quatre étapes : évaluation externe, analyse des écarts, missions de suivi et législation vétérinaire. À ce jour, <strong>45 pays africains</strong> ont bénéficié d''au moins une mission PVS. Les résultats montrent des lacunes récurrentes en matière de :</p>
<ul>
<li>Formation continue des agents</li>
<li>Coordination avec le secteur de la santé publique</li>
<li>Capacités de réponse aux urgences</li>
<li>Législation vétérinaire actualisée</li>
</ul>',
'text', 20, 1, 'published', TRUE);

-- M2L2: Maladies transfrontalières animales
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod2_id, 'Maladies transfrontalières animales (TADs)', 'Transboundary Animal Diseases (TADs)',
'<h2>Maladies transfrontalières animales (TADs)</h2>

<h3>Définition et enjeux</h3>
<p>Les <strong>maladies animales transfrontalières (TADs — Transboundary Animal Diseases)</strong> sont des maladies épidémiques hautement contagieuses qui se propagent rapidement au-delà des frontières nationales, causant des taux élevés de mortalité et de morbidité, avec des conséquences socio-économiques et sanitaires majeures. En Afrique, ces maladies constituent la première menace pour la sécurité alimentaire liée à l''élevage et un obstacle majeur au commerce régional et international de produits animaux.</p>

<h3>Fièvre aphteuse (FA)</h3>
<p>La fièvre aphteuse, causée par un virus de la famille des <em>Picornaviridae</em>, est sans doute la TAD la plus redoutée économiquement. En Afrique :</p>
<ul>
<li><strong>Six des sept sérotypes</strong> du virus circulent sur le continent (O, A, C, SAT1, SAT2, SAT3), contre 1-2 dans les autres régions</li>
<li>Les <strong>buffles d''Afrique</strong> (<em>Syncerus caffer</em>) constituent un réservoir sauvage permanent pour les sérotypes SAT</li>
<li>Les pertes économiques directes et indirectes sont estimées à <strong>6,5 milliards USD/an</strong></li>
<li>La maladie bloque l''accès aux marchés lucratifs de l''UE et du Moyen-Orient pour la viande et les produits laitiers</li>
<li>La <strong>Progressive Control Pathway (PCP-FMD)</strong> de la FAO et de l''OMSA guide les pays vers un contrôle progressif ; la plupart des pays africains sont aux stades 0-2 (sur 5)</li>
</ul>

<h3>Peste des petits ruminants (PPR)</h3>
<p>Causée par un <em>Morbillivirus</em>, la PPR affecte les chèvres et les moutons avec une mortalité pouvant atteindre <strong>90 % chez les animaux naïfs</strong>. C''est la TAD la plus importante pour les communautés pauvres en Afrique :</p>
<ul>
<li>Présente dans <strong>48 pays africains</strong> sur 54</li>
<li>Pertes annuelles estimées à <strong>2,1 milliards USD</strong> en Afrique</li>
<li>Affecte de manière disproportionnée les femmes et les communautés pastorales, qui dépendent le plus des petits ruminants</li>
<li>La <strong>Stratégie mondiale d''éradication de la PPR (PPR-GCES)</strong>, lancée en 2015 par la FAO et l''OMSA, vise l''éradication d''ici 2030</li>
<li>Un vaccin thermostable et très efficace (PPR Vac) existe, avec une seule dose conférant une immunité à vie</li>
</ul>

<h3>Péripneumonie contagieuse bovine (PPCB)</h3>
<p>Causée par <em>Mycoplasma mycoides subsp. mycoides</em>, la PPCB est une maladie respiratoire des bovins endémique en Afrique subsaharienne :</p>
<ul>
<li>Mortalité de <strong>30-50 %</strong> dans les troupeaux naïfs</li>
<li>Présente dans <strong>27 pays africains</strong></li>
<li>Le vaccin disponible (T1/44) offre une protection partielle et de courte durée (6-12 mois)</li>
<li>La transhumance pastorale facilite la propagation entre pays</li>
<li>La maladie a été <strong>éradiquée d''Europe au XIXe siècle</strong> grâce à l''abattage systématique, une stratégie inapplicable dans le contexte socio-économique africain</li>
</ul>

<h3>Peste porcine africaine (PPA)</h3>
<p>La PPA, causée par un virus à ADN de la famille des <em>Asfarviridae</em>, est devenue une <strong>menace mondiale</strong> depuis son introduction en Chine en 2018. En Afrique :</p>
<ul>
<li>Le virus est <strong>originaire d''Afrique</strong>, où il circule dans un cycle sauvage impliquant les phacochères et les tiques molles <em>Ornithodoros</em></li>
<li>Mortalité de <strong>100 %</strong> dans les formes aiguës — il n''existe <strong>ni vaccin ni traitement</strong></li>
<li>Le secteur porcin en Afrique représente <strong>40 millions de porcs</strong>, avec une croissance rapide en élevage urbain et périurbain</li>
<li>Les mesures de contrôle reposent exclusivement sur la biosécurité, la surveillance et l''abattage sanitaire</li>
</ul>

<h3>Fièvre de la Vallée du Rift (FVR)</h3>
<p>Cette arbovirose, transmise par les moustiques, est un exemple parfait de maladie One Health :</p>
<ul>
<li><strong>Réservoir</strong> : moustiques du genre <em>Aedes</em> (transmission transovarienne — le virus survit dans les œufs pendant des années dans les sols secs)</li>
<li><strong>Amplification</strong> : ruminants domestiques (bovins, ovins, caprins) avec avortements en tempête</li>
<li><strong>Transmission à l''homme</strong> : contact avec les fluides d''animaux infectés, piqûres de moustiques</li>
<li>Épidémies cycliques liées aux phénomènes <strong>ENSO (El Niño)</strong> et aux fortes pluies</li>
<li>Le <strong>système d''alerte précoce FAO/NASA</strong> utilise l''imagerie satellite pour prédire les zones à risque de FVR en Afrique de l''Est</li>
</ul>

<h3>Impact sur le commerce et la diplomatie</h3>
<p>Les TADs ont des implications diplomatiques majeures :</p>
<ul>
<li>Les <strong>embargos commerciaux</strong> imposés après des foyers de FA ou de FVR coûtent des centaines de millions USD aux pays exportateurs africains</li>
<li>Les <strong>normes SPS de l''OMC</strong> exigent la conformité aux standards OMSA pour le commerce international</li>
<li>La <strong>Zone de libre-échange continentale africaine (ZLECAf)</strong>, entrée en vigueur en 2021, nécessite une harmonisation des standards sanitaires entre les 54 pays</li>
<li>Les négociations commerciales bilatérales (UE-Afrique, accords AGOA) incluent systématiquement des clauses sanitaires</li>
</ul>',
'text', 22, 2, 'published', TRUE);

-- M2L3: Résistance antimicrobienne en Afrique
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod2_id, 'Résistance antimicrobienne en Afrique', 'Antimicrobial Resistance in Africa',
'<h2>Résistance antimicrobienne en Afrique</h2>

<h3>L''ampleur de la crise mondiale</h3>
<p>La résistance antimicrobienne (RAM ou AMR en anglais) est considérée par l''OMS comme l''une des <strong>dix principales menaces pour la santé publique mondiale</strong>. Selon l''étude historique publiée dans <em>The Lancet</em> en janvier 2022 (GRAM Project), la RAM a été directement responsable de <strong>1,27 million de décès</strong> et associée à <strong>4,95 millions de décès</strong> dans le monde en 2019. L''Afrique subsaharienne est la région la plus touchée, avec un taux de mortalité attribuable à la RAM de <strong>23,7 pour 100 000 habitants</strong>, le plus élevé au monde.</p>

<h3>Facteurs spécifiques au contexte africain</h3>
<p>Plusieurs facteurs font de l''Afrique un terrain particulièrement vulnérable à la RAM :</p>

<p><strong>Usage non réglementé des antibiotiques dans l''élevage :</strong></p>
<ul>
<li>Dans de nombreux pays africains, les antibiotiques sont vendus <strong>sans ordonnance</strong> dans les marchés et les pharmacies de rue, tant pour l''usage humain qu''animal</li>
<li>Les antibiotiques sont utilisés comme <strong>promoteurs de croissance</strong> dans l''aviculture commerciale et l''élevage porcin intensif</li>
<li>La <strong>tétracycline</strong>, la <strong>pénicilline</strong> et les <strong>sulfamides</strong> sont les antibiotiques les plus abusés dans l''élevage africain</li>
<li>Des études au Nigeria, au Kenya et au Ghana ont trouvé des résidus d''antibiotiques dans <strong>30-60 %</strong> des échantillons de lait et de viande analysés</li>
</ul>

<p><strong>Automédication et dispensation informelle :</strong></p>
<ul>
<li>En santé humaine, <strong>50-80 %</strong> des antibiotiques sont dispensés sans prescription dans de nombreux pays africains</li>
<li>Le phénomène des <strong>« drug shops »</strong> informels est répandu en Afrique de l''Est et de l''Ouest</li>
<li>Les antibiotiques contrefaits représentent <strong>10-30 %</strong> du marché pharmaceutique dans certains pays, avec des concentrations subthérapeutiques favorisant la résistance</li>
</ul>

<h3>Les pathogènes résistants prioritaires en Afrique</h3>
<ul>
<li><strong><em>Escherichia coli</em> résistant aux céphalosporines</strong> : prévalence croissante dans les élevages avicoles et les eaux usées urbaines</li>
<li><strong><em>Staphylococcus aureus</em> résistant à la méthicilline (SARM)</strong> : identifié chez le bétail et les éleveurs au Nigeria, Tanzanie, Afrique du Sud</li>
<li><strong><em>Salmonella</em> multirésistante</strong> : isolée dans les chaînes alimentaires de poulet dans toute l''Afrique subsaharienne</li>
<li><strong><em>Mycobacterium tuberculosis</em> multirésistant (MDR-TB)</strong> : 25 000 cas estimés en Afrique en 2022</li>
<li><strong><em>Plasmodium falciparum</em></strong> : résistance émergente à l''artémisinine détectée au Rwanda et en Ouganda (2020-2023)</li>
</ul>

<h3>Plan d''action mondial et réponses africaines</h3>
<p>En 2015, l''OMS adopte le <strong>Plan d''action mondial pour combattre la RAM (GAP-AMR)</strong>, demandant à chaque pays de développer un Plan d''Action National (PAN). L''état d''avancement en Afrique :</p>
<ul>
<li><strong>42 pays africains</strong> ont développé un PAN-RAM (2023)</li>
<li>Seulement <strong>18 pays</strong> ont un PAN couvrant simultanément les secteurs humain, animal et environnemental (approche One Health)</li>
<li>Le <strong>Cadre africain de lutte contre la RAM</strong> a été adopté par l''Union Africaine en 2017</li>
<li>L''<strong>Africa CDC</strong> coordonne le <strong>réseau AGISAR-Africa</strong> pour la surveillance intégrée de la RAM</li>
</ul>

<h3>Le Réseau GLASS et la surveillance en Afrique</h3>
<p>Le <strong>Global Antimicrobial Resistance and Use Surveillance System (GLASS)</strong> de l''OMS collecte les données de surveillance de la RAM. En Afrique, seulement <strong>15 pays</strong> participent activement au GLASS, contre la totalité des pays européens. Les défis incluent :</p>
<ul>
<li>Le manque de laboratoires de microbiologie équipés pour les antibiogrammes</li>
<li>L''absence de systèmes d''information intégrés entre les laboratoires humains et vétérinaires</li>
<li>Le coût des réactifs et consommables pour la culture bactérienne</li>
</ul>

<h3>Interventions One Health contre la RAM</h3>
<p>Des approches prometteuses émergent sur le continent :</p>
<ul>
<li><strong>Programme Fleming Fund</strong> : financé par le Royaume-Uni (265 millions GBP), soutient 24 pays africains dans le renforcement de la surveillance de la RAM</li>
<li><strong>Projet SAFETYNET</strong> : initiative FAO pour réduire l''usage des antibiotiques dans l''aquaculture en Afrique</li>
<li><strong>Législation sur les antibiotiques</strong> : le Kenya, le Ghana et l''Afrique du Sud ont adopté des lois restreignant l''usage des antibiotiques comme promoteurs de croissance</li>
<li><strong>Antibiogouvernance</strong> : programmes hospitaliers de gestion rationnelle des antibiotiques (antimicrobial stewardship) dans les hôpitaux de référence</li>
</ul>',
'text', 20, 3, 'published', TRUE);

-- M2L4: Changement climatique et santé One Health
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod2_id, 'Changement climatique et santé One Health en Afrique', 'Climate Change and One Health in Africa',
'<h2>Changement climatique et santé One Health en Afrique</h2>

<h3>L''Afrique face au changement climatique : vulnérabilité disproportionnée</h3>
<p>L''Afrique est le continent <strong>le plus vulnérable</strong> au changement climatique tout en étant le <strong>moins responsable</strong> : le continent ne contribue qu''à <strong>3,8 % des émissions mondiales de gaz à effet de serre</strong> (2021). Selon le GIEC (AR6, 2022), les températures moyennes en Afrique ont déjà augmenté de <strong>0,7-1,1°C</strong> par rapport à la période préindustrielle, et les projections indiquent un réchauffement de <strong>2-4°C d''ici 2100</strong> selon les scénarios. Les impacts sur la santé One Health sont multidimensionnels et s''intensifient.</p>

<h3>Expansion des vecteurs et des maladies vectorielles</h3>
<p>Le réchauffement climatique modifie la distribution géographique des arthropodes vecteurs de maladies :</p>

<p><strong>Paludisme :</strong> Les modèles prédictifs montrent une expansion des zones de transmission de <em>Plasmodium falciparum</em> vers les <strong>hauts plateaux d''Afrique de l''Est</strong> (Kenya, Éthiopie, Rwanda, Burundi) où les populations n''ont pas d''immunité acquise. Des cas de paludisme sont désormais signalés à des altitudes supérieures à <strong>2 000 mètres</strong>, alors qu''ils étaient historiquement rares au-dessus de 1 500 mètres.</p>

<p><strong>Dengue et fièvre jaune :</strong> L''aire de distribution d''<em>Aedes aegypti</em> s''étend, avec des flambées de dengue signalées dans des régions précédemment indemnes. La fièvre jaune connaît une résurgence avec des épidémies majeures en Angola (2016), au Nigeria (2017-2020) et en Éthiopie (2023).</p>

<p><strong>Fièvre de la Vallée du Rift :</strong> Les événements El Niño, amplifiés par le changement climatique, déclenchent les cycles épidémiques de FVR en Afrique de l''Est. Le système d''alerte précoce FAO/NASA, basé sur les indices de végétation satellite (NDVI), permet désormais de prédire les zones à risque <strong>2-4 mois</strong> à l''avance.</p>

<h3>Sécheresses, inondations et crises pastorales</h3>
<p>L''Afrique subit une augmentation de la fréquence et de l''intensité des événements météorologiques extrêmes :</p>

<p><strong>Sécheresses :</strong></p>
<ul>
<li>La Corne de l''Afrique a connu sa <strong>pire sécheresse en 40 ans</strong> en 2021-2023, avec 5 saisons des pluies consécutives déficitaires</li>
<li>Plus de <strong>13 millions de têtes de bétail</strong> ont péri en Somalie, Kenya et Éthiopie entre 2021 et 2023</li>
<li>Les pertes de bétail provoquent une crise nutritionnelle humaine (malnutrition aiguë) et des déplacements de populations</li>
<li>Les communautés pastorales, privées de leurs troupeaux, perdent leur capital productif et leur filet de sécurité</li>
</ul>

<p><strong>Inondations :</strong></p>
<ul>
<li>Les inondations multiplient les gîtes larvaires de moustiques vecteurs</li>
<li>Elles contaminent les sources d''eau par les déjections animales (cholera, leptospirose)</li>
<li>Les inondations au Mozambique (cyclone Idai, 2019) ont provoqué une épidémie de choléra avec plus de <strong>6 700 cas</strong></li>
</ul>

<h3>Impact sur la production agricole et la sécurité alimentaire</h3>
<ul>
<li>Les rendements agricoles en Afrique pourraient diminuer de <strong>20-30 % d''ici 2050</strong> selon le GIEC</li>
<li>Le stress thermique réduit la productivité du bétail (production laitière, gain de poids, reproduction)</li>
<li>Les mycotoxines (aflatoxines) prolifèrent dans les conditions de chaleur et d''humidité accrues</li>
<li>La pêche continentale et côtière est menacée par le réchauffement des eaux et l''acidification des océans</li>
</ul>

<h3>Migration, conflits et santé</h3>
<p>Le changement climatique est un <strong>multiplicateur de conflits</strong> en Afrique :</p>
<ul>
<li>Les conflits entre agriculteurs et éleveurs s''intensifient dans le Sahel (Mali, Burkina Faso, Nigeria) en raison de la raréfaction des pâturages et des points d''eau</li>
<li>Les <strong>déplacements climatiques</strong> sont estimés à 86 millions de personnes en Afrique subsaharienne d''ici 2050 (Banque mondiale, Groundswell 2021)</li>
<li>Les camps de réfugiés et de déplacés créent des conditions propices aux épidémies (surpeuplement, assainissement insuffisant)</li>
</ul>

<h3>Réponses africaines et plaidoyer climatique</h3>
<p>L''Afrique développe des stratégies d''adaptation intégrant la dimension One Health :</p>
<ul>
<li>Le <strong>Programme d''adaptation de l''agriculture africaine (AAA)</strong>, lancé à la COP22 de Marrakech</li>
<li>Les <strong>Contributions Déterminées au niveau National (CDN/NDC)</strong> : 53 pays africains ont soumis des CDN incluant l''agriculture et la santé</li>
<li>Le <strong>Fonds vert pour le climat</strong> : 37 % des financements approuvés pour l''Afrique concernent l''adaptation</li>
<li>L''<strong>Initiative africaine d''adaptation (AAI)</strong> de l''Union Africaine vise à mobiliser 25 milliards USD</li>
</ul>',
'text', 22, 4, 'published', TRUE);

-- M2L5: Sécurité sanitaire des aliments
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod2_id, 'Sécurité sanitaire des aliments et commerce', 'Food Safety and Trade',
'<h2>Sécurité sanitaire des aliments et commerce</h2>

<h3>L''enjeu de la sécurité sanitaire des aliments en Afrique</h3>
<p>La sécurité sanitaire des aliments (food safety) est un pilier souvent négligé de l''approche One Health. Selon l''OMS, les maladies d''origine alimentaire touchent <strong>91 millions de personnes par an en Afrique</strong>, causant <strong>137 000 décès</strong> — soit un tiers de la charge mondiale. Le coût économique des maladies d''origine alimentaire en Afrique est estimé à <strong>16,7 milliards USD par an</strong> en perte de productivité et frais de santé.</p>

<h3>Le Codex Alimentarius et l''Afrique</h3>
<p>Le <strong>Codex Alimentarius</strong>, programme conjoint FAO/OMS créé en 1963, établit les normes alimentaires internationales de référence. Pour l''Afrique :</p>
<ul>
<li>Les <strong>54 pays africains</strong> sont membres du Codex, mais leur participation active aux réunions et à l''élaboration des normes reste limitée</li>
<li>Le <strong>Comité coordonnateur FAO/OMS pour l''Afrique (CCAFRICA)</strong> coordonne les positions africaines</li>
<li>L''Afrique dispose de seulement <strong>2 Comités du Codex hébergés</strong> sur le continent (CCAFRICA), contre 8 en Europe</li>
<li>La faible représentation africaine dans les discussions techniques conduit à l''adoption de normes qui ne reflètent pas toujours les réalités du continent</li>
</ul>

<h3>L''Accord SPS de l''OMC</h3>
<p>L''<strong>Accord sur l''application des mesures sanitaires et phytosanitaires (SPS)</strong> de l''OMC, entré en vigueur en 1995, régit les mesures de protection sanitaire dans le commerce international. Il reconnaît les normes du Codex (aliments), de l''OMSA (santé animale) et de la CIPV (santé végétale) comme références scientifiques. Les implications pour l''Afrique :</p>
<ul>
<li><strong>Barrières non tarifaires</strong> : les exigences SPS constituent le principal obstacle aux exportations agroalimentaires africaines. Les rejets de produits alimentaires africains aux frontières de l''UE dépassent <strong>500 notifications par an</strong> via le système RASFF</li>
<li><strong>Normes privées</strong> : GlobalGAP, BRC, IFS — ces standards de la grande distribution vont au-delà des normes publiques et sont difficiles à atteindre pour les producteurs africains</li>
<li><strong>Fonds pour l''Application des Normes et le Développement du Commerce (STDF)</strong> : mécanisme de financement OMC/FAO/OMSA/Banque mondiale pour aider les pays en développement à se conformer aux normes SPS, avec plus de 100 projets financés en Afrique</li>
</ul>

<h3>Standards régionaux africains</h3>
<p>Les Communautés Économiques Régionales (CER) développent leurs propres cadres SPS :</p>
<ul>
<li><strong>COMESA</strong> : a adopté les <strong>Règlements SPS harmonisés du COMESA</strong> en 2009, couvrant 21 pays. Le COMESA a créé l''<strong>Alliance pour la sécurité sanitaire des aliments</strong> et investit dans les laboratoires régionaux de référence</li>
<li><strong>CEDEAO</strong> : le <strong>Règlement SPS de la CEDEAO (C/REG.21/11/10)</strong> harmonise les procédures d''inspection et de certification pour 15 pays ouest-africains</li>
<li><strong>EAC</strong> : la Communauté d''Afrique de l''Est a développé des <strong>protocoles SPS harmonisés</strong> facilitant le commerce du bétail et des produits animaux entre 7 pays membres</li>
<li><strong>SADC</strong> : le <strong>Protocole SPS de la SADC</strong> et le Programme régional de contrôle de la FVR et de la FA</li>
</ul>

<h3>Les marchés informels : le défi majeur</h3>
<p>En Afrique, <strong>80-90 % des produits alimentaires d''origine animale</strong> sont commercialisés via des circuits informels :</p>
<ul>
<li>Abattage non contrôlé : seulement <strong>10-20 %</strong> du bétail est abattu dans des abattoirs inspectés en Afrique subsaharienne</li>
<li>Le <strong>lait cru</strong> représente 80-95 % du lait consommé dans la plupart des pays d''Afrique de l''Est et de l''Ouest, avec des risques de tuberculose bovine et de brucellose</li>
<li>Les <strong>marchés d''animaux vivants</strong> fonctionnent sans contrôle sanitaire systématique</li>
<li>La <strong>chaîne du froid</strong> est souvent inexistante dans les zones rurales et périurbaines</li>
</ul>

<h3>La ZLECAf et l''harmonisation sanitaire</h3>
<p>La <strong>Zone de Libre-Échange Continentale Africaine (ZLECAf)</strong>, lancée en janvier 2021, crée le plus grand marché unique au monde (1,4 milliard de personnes). L''<strong>Annexe SPS de la ZLECAf</strong>, en cours de négociation, devra :</p>
<ul>
<li>Harmoniser les mesures SPS entre 54 pays aux capacités très hétérogènes</li>
<li>Mettre en place un mécanisme de reconnaissance mutuelle des certificats sanitaires</li>
<li>Créer un système continental d''alerte rapide pour les contaminations alimentaires</li>
<li>Équilibrer la protection sanitaire avec la facilitation du commerce</li>
</ul>

<p>Pour les diplomates One Health, la négociation de l''Annexe SPS de la ZLECAf représente un enjeu stratégique majeur : elle déterminera la capacité du continent à commercer en toute sécurité tout en protégeant les consommateurs et les éleveurs.</p>',
'text', 20, 5, 'published', TRUE);

-- ============================================
-- MODULE 3 - LEÇONS
-- ============================================

-- M3L1: Principes de la diplomatie sanitaire
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod3_id, 'Principes de la diplomatie sanitaire', 'Principles of Health Diplomacy',
'<h2>Principes de la diplomatie sanitaire</h2>

<h3>Définition et portée</h3>
<p>La <strong>diplomatie sanitaire</strong> (health diplomacy) désigne l''ensemble des processus de négociation qui façonnent et gèrent l''environnement politique mondial pour la santé. Selon <strong>Kickbusch, Silberschmidt et Buss (2007)</strong>, elle se situe à l''intersection de la politique étrangère, de la sécurité et de la santé publique. Elle englobe les négociations entre États, les accords bilatéraux et multilatéraux, et l''utilisation de la santé comme instrument de politique étrangère.</p>

<h3>Diplomatie sanitaire « dure » vs « douce »</h3>

<p><strong>Diplomatie sanitaire « dure » (hard health diplomacy) :</strong></p>
<ul>
<li>Négociation de <strong>traités contraignants</strong> (RSI 2005, Convention-cadre antitabac)</li>
<li><strong>Sanctions commerciales</strong> liées à des enjeux sanitaires (embargos SPS)</li>
<li><strong>Conditionnalité</strong> de l''aide liée à des réformes sanitaires</li>
<li><strong>Règlement des différends</strong> à l''OMC sur les mesures SPS</li>
<li>Exemple africain : le <strong>Protocole de Maputo</strong> (2003) intégrant des droits sanitaires</li>
</ul>

<p><strong>Diplomatie sanitaire « douce » (soft health diplomacy) :</strong></p>
<ul>
<li><strong>Coopération technique</strong> : envoi d''experts, programmes de formation</li>
<li><strong>Aide humanitaire sanitaire</strong> : réponse aux épidémies, dons de vaccins</li>
<li><strong>Diplomatie scientifique</strong> : collaboration en recherche, partage de données</li>
<li>Exemple : la <strong>coopération Cuba-Afrique</strong> en santé, avec plus de 76 000 professionnels de santé cubains déployés en Afrique depuis les années 1960</li>
</ul>

<h3>Évolution historique</h3>
<ul>
<li><strong>XIXe siècle</strong> : premières Conférences Sanitaires Internationales (1851-1938) contre le choléra et la peste</li>
<li><strong>1945-1990</strong> : création de l''OMS, éradication de la variole (1980)</li>
<li><strong>1990-2000</strong> : VIH/SIDA transforme la santé en enjeu de sécurité nationale</li>
<li><strong>2000-2015</strong> : les OMD et le Fonds mondial placent la santé au cœur de l''aide au développement</li>
<li><strong>2015-présent</strong> : ODD, pandémies et One Health redéfinissent la diplomatie sanitaire</li>
</ul>

<h3>Acteurs de la diplomatie sanitaire en Afrique</h3>
<ul>
<li><strong>États</strong> : ministères de la Santé, de l''Agriculture/Élevage, des Affaires étrangères, de l''Environnement</li>
<li><strong>Union Africaine</strong> : Africa CDC, AU-IBAR</li>
<li><strong>CER</strong> : CEDEAO, CEEAC, EAC, SADC, COMESA, IGAD</li>
<li><strong>Organisations internationales</strong> : OMS/AFRO, FAO, OMSA, PNUE</li>
<li><strong>Société civile et secteur privé</strong></li>
<li><strong>Partenaires bilatéraux</strong> : USAID, GIZ, AFD, DFID, JICA</li>
<li><strong>Philanthropies</strong> : Fondation Gates, Wellcome Trust</li>
</ul>

<h3>Enjeux contemporains</h3>
<ul>
<li>Le <strong>Traité sur les pandémies</strong> (en négociation à l''OMS depuis 2022) : le Groupe Afrique négocie l''équité d''accès et le partage des pathogènes</li>
<li>La <strong>souveraineté sanitaire</strong> : le COVID-19 a révélé la dépendance de l''Afrique (99 % des vaccins importés)</li>
<li>La <strong>gouvernance numérique de la santé</strong> : données génomiques, IA en santé</li>
<li>La <strong>justice climatique sanitaire</strong> : financements pour l''adaptation sanitaire au changement climatique</li>
</ul>',
'text', 20, 1, 'published', TRUE);

-- M3L2: Le RSI 2005 et l'Afrique
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod3_id, 'Le Règlement Sanitaire International (RSI 2005) et l''Afrique', 'The International Health Regulations (IHR 2005) and Africa',
'<h2>Le Règlement Sanitaire International (RSI 2005) et l''Afrique</h2>

<h3>Cadre juridique</h3>
<p>Le <strong>RSI</strong>, adopté en mai 2005 et entré en vigueur le 15 juin 2007, est le seul <strong>instrument juridique international contraignant</strong> en matière de sécurité sanitaire. Il lie <strong>196 États Parties</strong>, dont les 54 pays africains. Son objectif : prévenir la propagation internationale des maladies tout en évitant les entraves inutiles au commerce.</p>

<h3>Les 13 capacités essentielles</h3>
<p>Le RSI exige de chaque État le développement de 13 capacités essentielles, dont :</p>
<ul>
<li><strong>Législation et politique</strong> : cadre juridique national</li>
<li><strong>Point Focal National (PFN)</strong> : opérationnel 24h/24</li>
<li><strong>Surveillance</strong> : détection, notification, investigation</li>
<li><strong>Riposte</strong> : capacité de réponse rapide</li>
<li><strong>Laboratoire</strong> : diagnostic de référence</li>
<li><strong>Points d''entrée</strong> : surveillance aux frontières</li>
<li><strong>Événements zoonotiques</strong> : interface One Health</li>
<li><strong>Sécurité sanitaire des aliments</strong></li>
</ul>

<h3>Le Joint External Evaluation (JEE)</h3>
<p>Le JEE évalue 19 domaines techniques avec 49 indicateurs (score 1-5). En Afrique :</p>
<ul>
<li><strong>46 pays</strong> ont complété au moins un cycle JEE</li>
<li>Score moyen africain : <strong>2,1/5</strong> (capacités « limitées »)</li>
<li>Domaines les plus faibles : points d''entrée (1,8), laboratoires (2,0), ressources humaines (1,9)</li>
<li>Les résultats alimentent les <strong>Plans d''Action Nationaux pour la Sécurité Sanitaire (NAPHS)</strong></li>
</ul>

<h3>Défis de mise en œuvre</h3>
<ul>
<li><strong>Coût</strong> : 1-3 milliards USD nécessaires pour la mise en conformité RSI en Afrique</li>
<li><strong>Notification</strong> : réticence par crainte de sanctions commerciales</li>
<li><strong>Points d''entrée</strong> : couverture insuffisante des milliers de postes frontières terrestres</li>
<li><strong>Coordination intersectorielle</strong> : le RSI relève de la Santé mais les zoonoses exigent l''Agriculture et l''Environnement</li>
</ul>

<h3>Amendements RSI (2024)</h3>
<p>L''AMS a adopté en mai 2024 des amendements renforçant l''équité d''accès aux contre-mesures médicales, le partage de pathogènes, et créant un mécanisme de financement. Le <strong>Groupe Afrique</strong> a joué un rôle déterminant dans ces négociations.</p>',
'text', 22, 2, 'published', TRUE);

-- M3L3: Les normes de l'OMSA
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod3_id, 'Les normes de l''OMSA et le commerce international', 'WOAH Standards and International Trade',
'<h2>Les normes de l''OMSA et le commerce international</h2>

<h3>L''OMSA : organisme de référence</h3>
<p>L''<strong>OMSA</strong> (ex-OIE, renommée en 2022), avec <strong>183 Membres</strong> dont 54 africains, produit les normes de référence pour le commerce international des animaux et produits animaux. L''Accord SPS de l''OMC reconnaît ses codes comme normes de référence, leur conférant une portée quasi contraignante.</p>

<h3>Les instruments normatifs</h3>
<ul>
<li><strong>Code sanitaire pour les animaux terrestres</strong> : normes de prévention et contrôle, y compris zoonoses</li>
<li><strong>Code sanitaire pour les animaux aquatiques</strong></li>
<li><strong>Manuels des tests de diagnostic et des vaccins</strong> : protocoles standardisés</li>
</ul>

<h3>Le Processus PVS</h3>
<p>Outil phare de l''OMSA, il évalue les services vétérinaires selon <strong>47 compétences critiques</strong> en 4 piliers : ressources, autorité technique, interaction parties prenantes, accès aux marchés. En Afrique : <strong>45 évaluations PVS</strong> réalisées, révélant des besoins d''investissement de 50-200 millions USD par pays sur 5 ans.</p>

<h3>Statuts sanitaires et commerce</h3>
<p>L''OMSA reconnaît les statuts sanitaires officiels pour la FA, la peste bovine, la PPR. En 2023, seuls le <strong>Botswana, la Namibie et l''Eswatini</strong> ont des zones indemnes de FA sans vaccination permettant l''export vers l''UE. La plupart des pays africains restent exclus des marchés premium.</p>

<h3>WAHIS : système de notification</h3>
<p>Le <strong>WAHIS</strong> collecte les notifications de 117 maladies de la liste OMSA en temps réel. Les 183 Membres sont tenus de notifier toute apparition, avec des rapports semestriels et annuels.</p>

<h3>Implications diplomatiques</h3>
<ul>
<li>Les APE UE-Afrique incluent des chapitres SPS basés sur les normes OMSA</li>
<li>La ZLECAf devra intégrer ces standards dans son annexe SPS</li>
<li>L''Afrique détient <strong>54 voix sur 183</strong> à la Session générale — un poids considérable si le continent est uni</li>
<li>La représentation africaine dans les Commissions spécialisées reste insuffisante</li>
</ul>',
'text', 22, 3, 'published', TRUE);

-- M3L4: Négociations multilatérales
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod3_id, 'Négociations multilatérales en santé', 'Multilateral Health Negotiations',
'<h2>Négociations multilatérales en santé</h2>

<h3>Les arènes de négociation</h3>
<p>La diplomatie One Health se déploie dans de multiples enceintes multilatérales, chacune avec ses règles et sa culture de négociation.</p>

<h3>L''Assemblée mondiale de la Santé (AMS)</h3>
<ul>
<li>Organe suprême de l''OMS, réunit annuellement en mai à Genève les 194 États Membres</li>
<li>Résolutions adoptées par consensus ou vote (un pays = une voix)</li>
<li>Le <strong>Groupe Afrique</strong> (47 pays AFRO) coordonne ses positions avant chaque session</li>
<li>Exemples de résolutions africaines : WHA70.16 sur la RAM, WHA71.1 sur la préparation aux urgences</li>
</ul>

<h3>La Session générale de l''OMSA</h3>
<ul>
<li>Organe décisionnel suprême, annuel en mai à Paris</li>
<li>Adoption des modifications aux Codes et Manuels par vote des Délégués</li>
<li>Reconnaissance des statuts sanitaires examinée par les Commissions scientifiques</li>
<li>L''Afrique = 54 voix sur 183, soit ~30 % du poids électoral</li>
</ul>

<h3>Le Codex Alimentarius</h3>
<ul>
<li>Commission biennale et comités techniques permanents</li>
<li><strong>CCRVDF</strong> : limites maximales de résidus vétérinaires — impact direct sur les exportations africaines</li>
<li>Le Fonds fiduciaire FAO/OMS finance la participation de délégués africains</li>
</ul>

<h3>Techniques de négociation</h3>
<p><strong>Constitution de coalitions :</strong></p>
<ul>
<li>Groupe Afrique = plus grand bloc régional numériquement à l''OMS et à l''OMSA</li>
<li>Alliances stratégiques avec G77+Chine, PMA, PEID</li>
<li>Coordination intra-africaine cruciale mais souvent fragilisée par des intérêts divergents</li>
</ul>

<p><strong>Stratégies :</strong></p>
<ul>
<li>Soumettre des <strong>propositions de texte</strong> plutôt que des déclarations générales</li>
<li>Identifier les <strong>lignes rouges</strong> et les marges de manœuvre</li>
<li>Négocier des <strong>trade-offs</strong> : concessions secondaires contre gains prioritaires</li>
<li>Les décisions se préparent souvent dans les <strong>consultations informelles</strong></li>
</ul>

<h3>Défis des négociateurs africains</h3>
<ul>
<li><strong>Taille des délégations</strong> : 1-3 personnes vs 10-20 pour les pays développés</li>
<li><strong>Rotation fréquente</strong> : perte de mémoire institutionnelle</li>
<li><strong>Double compétence</strong> : expertise technique + diplomatique rarement réunie</li>
<li><strong>Financement</strong> : frais de déplacement limitant la participation aux sessions</li>
</ul>',
'text', 20, 4, 'published', TRUE);

-- M3L5: Plaidoyer et communication stratégique
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod3_id, 'Plaidoyer et communication stratégique One Health', 'One Health Advocacy and Strategic Communication',
'<h2>Plaidoyer et communication stratégique One Health</h2>

<h3>Le plaidoyer : définition</h3>
<p>Le <strong>plaidoyer</strong> (advocacy) en diplomatie sanitaire désigne les actions visant à influencer les décisions politiques, les allocations budgétaires et les comportements institutionnels en faveur de One Health. Il opère en amont et en parallèle des processus décisionnels formels.</p>

<h3>Cadre ADVO</h3>
<ul>
<li><strong>A</strong>nalyse : cartographie des parties prenantes, analyse du paysage politique, fenêtres d''opportunité</li>
<li><strong>D</strong>éveloppement du message : formulation adaptée aux audiences</li>
<li><strong>V</strong>éhicules : médias, événements, réseaux sociaux, publications</li>
<li><strong>O</strong>utreach : mise en œuvre, suivi et évaluation d''impact</li>
</ul>

<p>L''étude de la <strong>Banque mondiale (2012)</strong> a démontré qu''un investissement de <strong>3,4 milliards USD/an</strong> en prévention One Health éviterait des pertes pandémiques de <strong>30 milliards USD/an</strong>.</p>

<h3>Cartographie des parties prenantes</h3>
<ul>
<li><strong>Champions</strong> : alliés actifs (chefs d''État sensibilisés, leaders d''opinion)</li>
<li><strong>Décideurs</strong> : ministres, directeurs généraux, parlementaires</li>
<li><strong>Influenceurs</strong> : conseillers, médias, académiques</li>
<li><strong>Opposants</strong> : intérêts sectoriels, bureaucraties compartimentées</li>
</ul>

<h3>Construction des messages par audience</h3>
<p><strong>Décideurs politiques :</strong> « Investir 1 USD dans la prévention One Health économise 5-7 USD en réponse aux crises. Les pandémies zoonotiques sont des menaces à la sécurité nationale. »</p>
<p><strong>Bailleurs :</strong> Données probantes sur le retour sur investissement, alignement ODD, innovation transversale.</p>
<p><strong>Grand public :</strong> Témoignages personnels, infographies, appels à l''action concrets.</p>

<h3>Outils de communication stratégique</h3>
<ul>
<li><strong>Policy briefs</strong> : 2-4 pages synthétisant l''évidence et les recommandations</li>
<li><strong>Fact sheets</strong> : fiches techniques chiffrées</li>
<li><strong>Op-eds</strong> : tribunes dans les médias influents</li>
<li><strong>Side events</strong> : événements parallèles lors des conférences internationales</li>
<li><strong>Coalitions</strong> : alliances multi-acteurs (One Health Platform, PREZODE)</li>
</ul>

<h3>Campagnes réussies en Afrique</h3>
<ul>
<li><strong>« Zero by 30 »</strong> : élimination de la rage humaine d''ici 2030, portée par le Quadripartite avec des pays champions africains</li>
<li><strong>New Public Health Order</strong> de l''Africa CDC : nouveau paradigme incluant One Health</li>
<li><strong>« Pandemic Preparedness is an Investment »</strong> : plaidoyer de la Commission de l''UA</li>
</ul>',
'text', 18, 5, 'published', TRUE);

-- ============================================
-- MODULE 4 - LEÇONS
-- ============================================

-- M4L1: L'Union Africaine et l'Africa CDC
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod4_id, 'L''Union Africaine et la santé : Africa CDC', 'The African Union and Health: Africa CDC',
'<h2>L''Union Africaine et la santé : Africa CDC</h2>

<h3>Genèse</h3>
<p>Les <strong>Africa CDC</strong> ont été créés par la 25e Assemblée de l''UA en janvier 2017, suite aux leçons de l''épidémie d''Ebola 2014-2016. Premier directeur : <strong>Dr John Nkengasong</strong> (Cameroun), suivi de <strong>Dr Jean Kaseya</strong> (RDC).</p>

<h3>Mandat et structure</h3>
<p>Institution spécialisée de l''UA couvrant : surveillance continentale, préparation et réponse aux urgences, réseaux de laboratoires, systèmes d''information sanitaire, développement des capacités. Opère via <strong>5 Centres Collaborateurs Régionaux</strong> : Le Caire (Nord), Abuja (Ouest), Libreville (Centre), Nairobi (Est), Lusaka (Austral).</p>

<h3>Le New Public Health Order (NPHO)</h3>
<p>Lancé en 2021, le NPHO articule 5 piliers :</p>
<ol>
<li><strong>Institutions renforcées</strong> : INSP dans chaque pays</li>
<li><strong>Main-d''œuvre</strong> : 6 000 épidémiologistes de terrain</li>
<li><strong>Fabrication locale</strong> : 60 % des vaccins produits en Afrique d''ici 2040 (vs 1 %)</li>
<li><strong>Partenariats transformateurs</strong> : relations équitables</li>
<li><strong>Financement durable</strong> : mobilisation domestique</li>
</ol>

<h3>Réponse au COVID-19</h3>
<ul>
<li><strong>AFTCOR</strong> activée le 5 février 2020, avant le premier cas africain</li>
<li><strong>PACT</strong> : de 2 à 750 laboratoires de diagnostic en un an</li>
<li><strong>AVAT</strong> : négociation de 400 millions de doses de vaccins</li>
<li>Réseau de <strong>séquençage génomique</strong> : identification du variant Beta (Afrique du Sud)</li>
</ul>

<h3>One Health à l''Africa CDC</h3>
<ul>
<li>Division One Health créée en 2022</li>
<li>Collaboration avec AU-IBAR pour la surveillance des zoonoses</li>
<li>Cadre continental One Health en développement</li>
<li>L''Agenda 2063 fixe l''objectif d''espérance de vie à 75 ans d''ici 2063</li>
</ul>',
'text', 20, 1, 'published', TRUE);

-- M4L2: AU-IBAR
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod4_id, 'AU-IBAR et la santé animale panafricaine', 'AU-IBAR and Pan-African Animal Health',
'<h2>AU-IBAR et la santé animale panafricaine</h2>

<h3>Historique et mandat</h3>
<p>Le <strong>Bureau Interafricain des Ressources Animales (AU-IBAR)</strong>, basé à Nairobi, est la plus ancienne institution technique panafricaine dédiée à l''élevage (fondée en 1951). Mandat : coordination continentale des politiques de santé et production animale, renforcement des services vétérinaires, harmonisation réglementaire, information épidémiologique.</p>

<h3>Programmes majeurs</h3>
<p><strong>VET-GOV</strong> (30M EUR, UE, 2012-2019) : gouvernance vétérinaire dans 54 pays. A soutenu 25 évaluations PVS, harmonisé les curricula vétérinaires, créé l''Association des Conseils de l''Ordre Vétérinaire d''Afrique.</p>

<p><strong>STSD</strong> : facilite le commerce intra-africain dans le cadre de la ZLECAf via l''harmonisation des certificats sanitaires et la formation d''inspecteurs aux postes frontières.</p>

<p><strong>LiDeSA 2015-2035</strong> : stratégie à 20 ans visant +50 % de production animale, -50 % de pertes dues aux maladies, et 10 % du commerce mondial (vs 2 %).</p>

<h3>ARIS et surveillance</h3>
<p>L''<strong>Animal Resources Information System (ARIS)</strong> collecte les données de 47 pays sur 30+ maladies prioritaires, avec intégration au WAHIS de l''OMSA.</p>

<h3>AU-PANVAC</h3>
<p>Le Centre Panafricain de Vaccins Vétérinaires (Debre Zeit, Éthiopie) assure le contrôle qualité : <strong>40 % des vaccins vétérinaires en Afrique échouent aux tests</strong>. Plus de 3 000 lots testés, développement de vaccins thermostables.</p>

<h3>Coordination</h3>
<p>AU-IBAR coordonne avec les 8 CER, la FAO-ECTAD (25+ pays), l''OMSA (4 bureaux sous-régionaux), les réseaux de laboratoires (RESOLAB, EARLN) et les organisations pastorales.</p>',
'text', 22, 2, 'published', TRUE);

-- M4L3: Les CER et la santé
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod4_id, 'Les Communautés Économiques Régionales et la santé', 'Regional Economic Communities and Health',
'<h2>Les Communautés Économiques Régionales et la santé</h2>

<h3>Architecture régionale</h3>
<p>L''UA reconnaît <strong>8 CER</strong> comme piliers de l''intégration continentale. Chacune développe des politiques de santé avec des degrés de maturité variables.</p>

<h3>CEDEAO (Afrique de l''Ouest, 15 membres)</h3>
<ul>
<li><strong>OOAS/WAHO</strong> (Bobo-Dioulasso) : institution sanitaire spécialisée, ~15M USD/an</li>
<li><strong>CRSCM</strong> (2020) : équivalent régional de l''Africa CDC</li>
<li>Coordination de la réponse à Ebola 2014-2016 et programme <strong>REDISSE</strong> (600M USD, Banque mondiale)</li>
<li>Règlement SPS régional (C/REG.21/11/10) pour 15 pays</li>
</ul>

<h3>CEEAC (Afrique centrale, 11 membres)</h3>
<ul>
<li><strong>OCEAC</strong> (Yaoundé) : maladies tropicales</li>
<li>Programme CEMAC de sécurité alimentaire</li>
<li>Défis : instabilité politique, zones forestières, Ebola et mpox</li>
</ul>

<h3>EAC (Afrique de l''Est, 7 membres)</h3>
<ul>
<li>EAC Health Protocol intégrant la surveillance des zoonoses</li>
<li>Kenya, Tanzanie, Ouganda : plateformes nationales One Health parmi les plus avancées d''Afrique</li>
<li>East African Health Research Commission (EAHRC)</li>
</ul>

<h3>SADC (Afrique australe, 16 membres)</h3>
<ul>
<li>Programme régional de contrôle de la FA le plus avancé d''Afrique</li>
<li>Zones indemnes au Botswana, Namibie, Eswatini</li>
<li>SADC Pharmaceutical Business Plan pour les médicaments vétérinaires</li>
</ul>

<h3>IGAD (Corne de l''Afrique, 8 membres)</h3>
<ul>
<li><strong>ICPALD</strong> (Nairobi) : résilience pastorale</li>
<li>Protocole de transhumance transfrontalière</li>
<li>Système d''alerte précoce CEWARN pour les conflits pastoraux</li>
<li>Vaccination transfrontalière PPR et PPCB</li>
</ul>

<h3>Défis inter-CER</h3>
<ul>
<li>Chevauchements de mandats (pays membres de 2-3 CER)</li>
<li>Normes sanitaires non harmonisées entre CER</li>
<li>Dépendance aux bailleurs internationaux</li>
<li>AU-IBAR coordonne pour éviter duplications</li>
</ul>',
'text', 20, 3, 'published', TRUE);

-- M4L4: Initiatives continentales
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod4_id, 'Initiatives continentales : GHSA, PVS, EPT, REDISSE', 'Continental Initiatives: GHSA, PVS, EPT, REDISSE',
'<h2>Initiatives continentales : GHSA, PVS, EPT, REDISSE</h2>

<h3>GHSA (Global Health Security Agenda)</h3>
<p>Lancé en 2014, le GHSA accélère la mise en conformité RSI. <strong>32 pays africains</strong> participent, avec 11 « Action Packages » dont « Zoonotic Disease » et « AMR ». Financements majeurs : USAID EPT/EPT-2 (1 Md USD, 15 pays africains), programme PREDICT (1 200 nouveaux virus identifiés dont 160 coronavirus).</p>

<h3>Processus PVS en Afrique</h3>
<ul>
<li><strong>45 évaluations PVS</strong> réalisées, besoin cumulé de <strong>4 milliards USD</strong></li>
<li>35 missions de législation vétérinaire</li>
<li>Amélioration moyenne de 15-20 % des scores sur 5 ans</li>
<li>Catalyseur de plateformes nationales One Health (Kenya, Tanzanie, Éthiopie, Cameroun, Sénégal)</li>
</ul>

<h3>Programme REDISSE</h3>
<p>Plus grand investissement en surveillance en Afrique de l''Ouest, financé par la Banque mondiale :</p>
<ul>
<li>Phase 1 (2016) : 110M USD — Guinée, Sénégal, Sierra Leone</li>
<li>Phase 2 (2017) : 125M USD — Nigeria, Liberia</li>
<li>Phase 3 (2018) : 215M USD — 9 pays additionnels</li>
<li>Phase 4 (2020) : extension + COVID-19</li>
<li>Total : <strong>600+ millions USD</strong></li>
</ul>
<p>Résultats : 50+ laboratoires construits, 3 000+ épidémiologistes formés, systèmes DHIS2/EIDSS déployés, composante One Health intégrée.</p>

<h3>Autres initiatives</h3>
<ul>
<li><strong>PREZODE</strong> (2021) : prévention de l''émergence de zoonoses aux interfaces homme-animal-environnement</li>
<li><strong>AFROHUN</strong> : réseau de 85 universités dans 20 pays intégrant One Health dans les curricula</li>
<li><strong>OHCEA</strong> : réseau universitaire One Health en Afrique de l''Est et centrale (8 pays)</li>
</ul>',
'text', 22, 4, 'published', TRUE);

-- M4L5: Financement de la santé
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod4_id, 'Financement de la santé en Afrique', 'Health Financing in Africa',
'<h2>Financement de la santé en Afrique</h2>

<h3>État des lieux</h3>
<ul>
<li>Dépense totale de santé per capita : <strong>98 USD</strong> en ASS vs 4 921 USD (OCDE)</li>
<li>Dépenses publiques : <strong>1,9 % du PIB</strong> (objectif OMS : 5 %)</li>
<li>Paiements directs des ménages : <strong>36 %</strong> des dépenses, poussant 11 millions dans la pauvreté</li>
<li>Aide extérieure : 20-40 % des budgets santé des pays à faible revenu</li>
</ul>

<h3>Déclaration d''Abuja (2001)</h3>
<p>Engagement de 15 % du budget national à la santé. 25 ans après, seuls <strong>5 pays</strong> ont atteint l''objectif (Rwanda, Botswana, Malawi, Zambie, Eswatini). Moyenne : 8-9 %. La déclaration ne couvre pas la santé animale ni l''environnement.</p>

<h3>Santé animale : le parent pauvre</h3>
<ul>
<li>Budgets vétérinaires : 0,5-2 % du budget agricole</li>
<li>Vaccinations : 50-80 % financées par l''extérieur</li>
<li>Ratio coût-bénéfice pourtant excellent : 1 USD investi = 5-7 USD de retour</li>
</ul>

<h3>Principaux bailleurs</h3>
<p><strong>Multilatéraux :</strong> Banque mondiale (REDISSE, HEAL, Pandemic Fund), Fonds mondial (5,4 Md USD pour l''Afrique 2023-2025), Gavi (9 Md USD depuis 2000), BAfD.</p>
<p><strong>Bilatéraux :</strong> USAID (6 Md/an, 70 % Afrique), UE (3 Md EUR/an), GIZ, AFD, DFID, JICA, Chine.</p>
<p><strong>Philanthropies :</strong> Gates (5 Md/an), Wellcome Trust, Mastercard Foundation.</p>

<h3>Mécanismes innovants</h3>
<ul>
<li><strong>Pandemic Fund</strong> (2022) : 1,6 Md USD pour la préparation aux pandémies</li>
<li>Taxes de solidarité sur les billets d''avion (Congo, Gabon)</li>
<li>Assurance bétail indicielle (IBLI, Kenya/Éthiopie)</li>
<li>Impact investing dans les chaînes de valeur de l''élevage</li>
</ul>

<h3>Arguments clés pour le plaidoyer</h3>
<ol>
<li><strong>Efficience</strong> : les approches intégrées One Health coûtent moins que les réponses cloisonnées</li>
<li><strong>Prévention</strong> : 100x moins cher que la réponse aux pandémies</li>
<li><strong>Transversalité</strong> : un investissement One Health contribue à multiples ODD</li>
</ol>',
'text', 20, 5, 'published', TRUE);

-- ============================================
-- MODULE 5 - LEÇONS
-- ============================================

-- M5L1: Grippe aviaire H5N1
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod5_id, 'Gestion de la grippe aviaire H5N1 en Afrique de l''Ouest', 'Managing Avian Influenza H5N1 in West Africa',
'<h2>Gestion de la grippe aviaire H5N1 en Afrique de l''Ouest</h2>

<h3>Contexte de l''émergence</h3>
<p>Le virus <strong>influenza aviaire hautement pathogène (IAHP) H5N1</strong> a été détecté pour la première fois en Afrique en <strong>février 2006</strong>, au Nigeria, probablement introduit par des oiseaux migrateurs en provenance d''Asie via les voies de migration paléarctiques. En quelques mois, le virus s''est propagé au Niger, au Burkina Faso, au Cameroun, à la Côte d''Ivoire, au Ghana, au Togo, au Bénin et à l''Égypte. Ce fut le premier test majeur de la capacité de réponse One Health du continent.</p>

<h3>Chronologie de la crise</h3>
<ul>
<li><strong>Février 2006</strong> : premier foyer confirmé à Kaduna, Nigeria — 46 000 volailles mortes ou abattues</li>
<li><strong>Mars-avril 2006</strong> : propagation à 7 pays ouest-africains en 2 mois</li>
<li><strong>Janvier 2007</strong> : premier cas humain confirmé au Nigeria (décès d''une jeune fille de 22 ans à Lagos)</li>
<li><strong>2006-2008</strong> : plus de <strong>1,5 million de volailles</strong> mortes ou abattues au Nigeria seul</li>
<li><strong>2015-2017</strong> : résurgence du H5N1 et apparition du H5N8 en Afrique de l''Ouest et australe</li>
<li><strong>2021-2023</strong> : vagues de H5N1 clade 2.3.4.4b touchant 26 pays africains, avec mortalité massive chez les oiseaux sauvages</li>
</ul>

<h3>Échecs de coordination initiaux</h3>
<p>La première vague de 2006 a révélé des failles systémiques :</p>
<ul>
<li><strong>Détection tardive</strong> : les premiers foyers au Nigeria ont été identifiés <strong>3-4 semaines</strong> après le début des mortalités, par manque de surveillance active dans les élevages avicoles</li>
<li><strong>Communication défaillante</strong> : absence de coordination entre services vétérinaires et services de santé publique</li>
<li><strong>Capacités de laboratoire</strong> : en 2006, seulement 3 pays ouest-africains pouvaient confirmer le H5N1 par PCR</li>
<li><strong>Compensation</strong> : les mécanismes d''indemnisation des éleveurs étaient inexistants ou inadéquats, poussant à la dissimulation des foyers</li>
<li><strong>Biosécurité</strong> : les élevages avicoles artisanaux (98 % du secteur) n''avaient aucune mesure de biosécurité</li>
</ul>

<h3>Réponse internationale et leçons apprises</h3>
<p>La communauté internationale a mobilisé d''importants moyens :</p>
<ul>
<li><strong>FAO-ECTAD</strong> : déploiement d''experts et de laboratoires mobiles dans 8 pays</li>
<li><strong>OMS</strong> : renforcement de la surveillance des cas humains</li>
<li><strong>Banque mondiale</strong> : 500 millions USD via le programme <strong>GAHP (Global Avian and Human Influenza Project)</strong></li>
<li><strong>Réseau OFFLU</strong> (OIE/FAO) : coordination de la surveillance virologique et partage de souches</li>
</ul>

<p>Leçons clés :</p>
<ul>
<li>La <strong>surveillance active</strong> dans les élevages et les zones humides (oiseaux migrateurs) est indispensable</li>
<li>Les <strong>plans de contingence</strong> doivent être préparés avant les crises, pas pendant</li>
<li>La <strong>communication de crise</strong> doit être coordonnée entre secteurs pour éviter la panique ou le déni</li>
<li>La <strong>compensation des éleveurs</strong> est essentielle pour encourager la notification des foyers</li>
<li>Le réseau <strong>RESOLAB</strong> (réseau de laboratoires pour la grippe aviaire en Afrique de l''Ouest) a été créé en réponse directe à cette crise</li>
</ul>',
'text', 22, 1, 'published', TRUE);

-- M5L2: Ebola
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod5_id, 'Réponse à Ebola : diplomatie sanitaire en action', 'Ebola Response: Health Diplomacy in Action',
'<h2>Réponse à Ebola : diplomatie sanitaire en action</h2>

<h3>L''épidémie de 2014-2016 en Afrique de l''Ouest</h3>
<p>L''épidémie d''Ebola en Afrique de l''Ouest (2014-2016) reste la plus grande épidémie de maladie à virus Ebola (MVE) de l''histoire : <strong>28 616 cas et 11 310 décès</strong> en Guinée, Sierra Leone et Liberia. Elle a constitué un moment fondateur pour la diplomatie sanitaire africaine et mondiale.</p>

<h3>Chronologie diplomatique</h3>
<ul>
<li><strong>Décembre 2013</strong> : premier cas probable à Méliandou, Guinée (un enfant de 2 ans, probablement infecté par des chauves-souris)</li>
<li><strong>Mars 2014</strong> : notification officielle de la Guinée à l''OMS — délai de 3 mois</li>
<li><strong>Août 2014</strong> : l''OMS déclare une <strong>USPPI (Urgence de Santé Publique de Portée Internationale)</strong></li>
<li><strong>Septembre 2014</strong> : le Conseil de sécurité de l''ONU adopte la résolution 2177, qualifiant Ebola de <strong>menace à la paix et à la sécurité internationales</strong> — première fois pour une maladie</li>
<li><strong>Septembre 2014</strong> : création de l''<strong>UNMEER (Mission des Nations Unies pour la réponse d''urgence à Ebola)</strong> — première mission onusienne dédiée à une urgence sanitaire</li>
<li><strong>2015</strong> : le <strong>MPTF Ebola (Multi-Partner Trust Fund)</strong> mobilise 168 millions USD</li>
<li><strong>Janvier 2016</strong> : fin officielle de la transmission dans les trois pays</li>
</ul>

<h3>Les échecs de la réponse initiale</h3>
<ul>
<li><strong>Détection et notification tardives</strong> : 3 mois entre le premier cas et la notification à l''OMS</li>
<li><strong>Sous-estimation par l''OMS</strong> : le Bureau AFRO n''a pas déclenché l''alerte internationale assez tôt</li>
<li><strong>Systèmes de santé effondrés</strong> : les trois pays figuraient parmi les plus faibles au monde en capacités RSI</li>
<li><strong>Réactions de panique</strong> : fermetures de frontières, interdictions de vols, stigmatisation des ressortissants ouest-africains</li>
<li><strong>Absence de vaccin ou traitement</strong> : malgré la découverte du virus en 1976 (RDC), aucun investissement dans la R&D car la maladie ne touchait que l''Afrique</li>
</ul>

<h3>Leçons diplomatiques</h3>
<p>Ebola a profondément transformé la gouvernance sanitaire mondiale :</p>
<ul>
<li><strong>Création de l''Africa CDC</strong> (2017) : décision directe de l''UA en réponse à Ebola</li>
<li><strong>Réforme du Programme des urgences sanitaires de l''OMS (WHE)</strong> : restructuration complète du mécanisme de réponse</li>
<li><strong>Fonds de contingence OMS pour les situations d''urgence (CFE)</strong> : 100 millions USD de réserve</li>
<li><strong>Programme REDISSE</strong> de la Banque mondiale : 600 millions USD pour l''Afrique de l''Ouest</li>
<li><strong>Accélération de la R&D</strong> : le vaccin rVSV-ZEBOV (Ervebo) développé et approuvé en temps record</li>
</ul>

<h3>L''épidémie de RDC (2018-2020)</h3>
<p>L''épidémie d''Ebola en RDC (provinces du Nord-Kivu et Ituri, 2018-2020) a présenté des défis différents :</p>
<ul>
<li><strong>Zone de conflit actif</strong> : groupes armés, attaques contre les centres de traitement</li>
<li><strong>3 481 cas, 2 299 décès</strong></li>
<li>Premier déploiement du <strong>vaccin rVSV-ZEBOV</strong> à grande échelle (303 000 personnes vaccinées)</li>
<li><strong>Diplomatie sanitaire en zone de conflit</strong> : négociations avec les groupes armés pour l''accès humanitaire</li>
<li>Rôle crucial de l''<strong>INRB (Institut National de Recherche Biomédicale)</strong> de la RDC et du séquençage génomique pour le suivi épidémiologique</li>
</ul>',
'text', 25, 2, 'published', TRUE);

-- M5L3: Lutte contre la rage
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod5_id, 'Lutte contre la rage en Afrique : programme SARE', 'Rabies Control in Africa: SARE Program',
'<h2>Lutte contre la rage en Afrique : programme SARE</h2>

<h3>La rage en Afrique : un fléau négligé</h3>
<p>La rage tue environ <strong>21 000 personnes par an en Afrique</strong> (36 % des décès mondiaux), dont <strong>40 % sont des enfants de moins de 15 ans</strong>. C''est la zoonose la plus mortelle du continent, pourtant classée parmi les <strong>maladies tropicales négligées</strong>. Le chien domestique est responsable de 99 % des transmissions à l''homme. Le coût total est estimé à <strong>583 millions USD/an</strong> pour l''Afrique.</p>

<h3>Pourquoi la rage persiste en Afrique</h3>
<ul>
<li><strong>Couverture vaccinale canine</strong> : moins de 20 % dans la plupart des pays (seuil d''élimination : 70 %)</li>
<li><strong>Population canine</strong> : 78 millions de chiens en Afrique, dont 70 % sont des chiens errants ou semi-errants</li>
<li><strong>Accès à la prophylaxie post-exposition (PPE)</strong> : les vaccins antirabiques humains et les immunoglobulines sont coûteux (40-100 USD/traitement) et souvent indisponibles en zone rurale</li>
<li><strong>Sous-déclaration</strong> : seulement 1-3 % des cas sont confirmés en laboratoire ; la plupart des décès surviennent en milieu rural sans diagnostic</li>
<li><strong>Faible priorité politique</strong> : la rage affecte les communautés les plus pauvres et les plus marginalisées</li>
</ul>

<h3>Le programme SARE (Stepwise Approach to Rabies Elimination)</h3>
<p>Le <strong>SARE</strong>, développé par l''OMSA avec la FAO et l''OMS, est un cadre progressif en <strong>5 étapes</strong> guidant les pays vers l''élimination de la rage canine :</p>
<ul>
<li><strong>Étape 0</strong> : aucune donnée fiable, pas de programme de contrôle</li>
<li><strong>Étape 1</strong> : évaluation de la situation, données de base collectées</li>
<li><strong>Étape 2</strong> : programme de contrôle opérationnel, vaccination canine en cours</li>
<li><strong>Étape 3</strong> : diminution significative des cas humains et canins</li>
<li><strong>Étape 4</strong> : aucun cas humain transmis par le chien pendant 2+ ans</li>
<li><strong>Étape 5</strong> : statut « indemne de rage canine » reconnu par l''OMSA</li>
</ul>

<p>En 2023, la plupart des pays africains sont aux étapes 0-2, avec quelques exceptions notables.</p>

<h3>Histoires de succès en Afrique</h3>
<p><strong>Tanzanie (projet Serengeti) :</strong> Depuis 2003, un programme de vaccination de masse des chiens dans le district de Serengeti a démontré que la vaccination de <strong>70 % de la population canine</strong> réduit l''incidence de la rage humaine de <strong>95 %</strong> en 5 ans. Coût : seulement <strong>1,50 USD par chien vacciné</strong>.</p>

<p><strong>Tchad (N''Djamena) :</strong> Le programme de vaccination canine de masse à N''Djamena (2012-2018), soutenu par le Swiss TPH, a atteint une couverture de <strong>70 %</strong> et réduit les cas humains de <strong>90 %</strong>. Ce modèle démontre la faisabilité de l''élimination dans un contexte sahélien.</p>

<p><strong>Afrique du Sud (KwaZulu-Natal) :</strong> La province du KwaZulu-Natal a éliminé la rage canine grâce à des campagnes systématiques de vaccination et de surveillance, passant de 200+ cas/an à zéro.</p>

<h3>« Zero by 30 » : objectif mondial</h3>
<p>Le plan stratégique <strong>« Zero by 30 »</strong> du Quadripartite (OMS, FAO, OMSA, GARC) vise <strong>zéro décès humain de rage d''origine canine d''ici 2030</strong>. Pour l''Afrique, cela nécessite :</p>
<ul>
<li>La vaccination de <strong>70 % des 78 millions de chiens</strong> sur le continent</li>
<li>L''accès universel à la PPE dans les centres de santé</li>
<li>Des systèmes de surveillance intégrés One Health (cas humains + animaux)</li>
<li>Un investissement estimé à <strong>6 milliards USD sur 15 ans</strong> à l''échelle mondiale</li>
</ul>

<p>La rage est un cas d''école pour la diplomatie One Health : son élimination est <strong>techniquement faisable, économiquement rentable, mais politiquement négligée</strong>. Le plaidoyer doit convaincre les décideurs d''investir dans la vaccination canine (secteur vétérinaire) pour sauver des vies humaines (secteur santé) — l''essence même de One Health.</p>',
'text', 20, 3, 'published', TRUE);

-- M5L4: PPR
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod5_id, 'Peste des petits ruminants : vers l''éradication mondiale', 'PPR: Towards Global Eradication',
'<h2>Peste des petits ruminants : vers l''éradication mondiale</h2>

<h3>La PPR : deuxième maladie animale à éradiquer</h3>
<p>Après l''éradication réussie de la <strong>peste bovine</strong> en 2011 (seule maladie animale jamais éradiquée), la communauté internationale s''est fixé un nouvel objectif ambitieux : l''<strong>éradication mondiale de la peste des petits ruminants (PPR) d''ici 2030</strong>. La PPR est causée par un <em>Morbillivirus</em> étroitement apparenté au virus de la peste bovine, infectant les chèvres et les moutons avec une mortalité pouvant atteindre <strong>90 % chez les animaux naïfs</strong>.</p>

<h3>Impact en Afrique</h3>
<ul>
<li>Présente dans <strong>48 des 54 pays africains</strong></li>
<li>Pertes annuelles estimées à <strong>2,1 milliards USD</strong> en Afrique</li>
<li>Affecte de manière disproportionnée les <strong>femmes</strong> et les communautés pastorales</li>
<li>Les petits ruminants sont le bétail des pauvres : 300 millions de personnes en Afrique dépendent directement des chèvres et moutons</li>
<li>Impact sur la <strong>sécurité alimentaire</strong> et la <strong>nutrition</strong> : lait, viande, revenus de vente</li>
</ul>

<h3>La Stratégie mondiale d''éradication (PPR-GCES)</h3>
<p>Le <strong>PPR Global Control and Eradication Strategy (PPR-GCES)</strong>, lancé conjointement par la <strong>FAO et l''OMSA</strong> en 2015 à Abidjan, est structuré en 4 étapes :</p>
<ul>
<li><strong>Étape 1 (Évaluation)</strong> : caractérisation épidémiologique, analyse des systèmes de production</li>
<li><strong>Étape 2 (Contrôle)</strong> : campagnes de vaccination de masse, surveillance renforcée</li>
<li><strong>Étape 3 (Éradication)</strong> : vaccination ciblée, élimination des derniers foyers</li>
<li><strong>Étape 4 (Post-éradication)</strong> : maintien du statut indemne, surveillance continue</li>
</ul>

<p>Calendrier africain :</p>
<ul>
<li><strong>2017-2021</strong> : campagnes de vaccination dans les pays endémiques prioritaires</li>
<li><strong>2022-2027</strong> : intensification dans les zones restantes</li>
<li><strong>2028-2030</strong> : élimination des derniers foyers et dossiers de reconnaissance</li>
</ul>

<h3>Atouts pour l''éradication</h3>
<ul>
<li><strong>Vaccin excellent</strong> : le vaccin PPR (Nigeria 75/1 et Sungri 96) est thermostable, peu coûteux (<strong>0,10-0,30 USD/dose</strong>), et confère une <strong>immunité à vie</strong> en une seule injection</li>
<li><strong>Un seul sérotype</strong> : contrairement à la FA (7 sérotypes), la PPR n''a qu''un sérotype, facilitant la vaccination</li>
<li><strong>Pas de réservoir sauvage significatif</strong> : bien que la faune sauvage puisse être infectée, les petits ruminants domestiques sont le principal réservoir</li>
<li><strong>Précédent réussi</strong> : l''éradication de la peste bovine fournit un modèle éprouvé</li>
</ul>

<h3>Défis à surmonter</h3>
<ul>
<li><strong>Transhumance</strong> : les mouvements pastoraux transfrontaliers compliquent les campagnes de vaccination et la surveillance</li>
<li><strong>Couverture vaccinale</strong> : atteindre 80 % des petits ruminants dans des zones reculées et pastorales est un défi logistique</li>
<li><strong>Financement</strong> : le coût estimé de l''éradication en Afrique est de <strong>3,7 milliards USD sur 15 ans</strong></li>
<li><strong>Coordination entre pays</strong> : les campagnes doivent être synchronisées aux frontières</li>
<li><strong>Chaîne du froid</strong> : bien que le vaccin soit relativement thermostable, il nécessite un minimum de chaîne du froid</li>
</ul>

<h3>Diplomatie de l''éradication</h3>
<p>L''éradication de la PPR est un exercice diplomatique majeur nécessitant :</p>
<ul>
<li>Des <strong>accords bilatéraux de vaccination synchronisée</strong> entre pays voisins</li>
<li>La coordination des <strong>CER</strong> pour les campagnes régionales</li>
<li>Le plaidoyer auprès des <strong>ministres des Finances</strong> pour le financement national</li>
<li>La mobilisation des <strong>bailleurs internationaux</strong> (Banque mondiale, UE, USAID)</li>
<li>La résolution des enjeux de <strong>souveraineté</strong> liés à la surveillance transfrontalière</li>
</ul>',
'text', 22, 4, 'published', TRUE);

-- M5L5: COVID-19
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod5_id, 'COVID-19 : coopération sanitaire et leçons africaines', 'COVID-19: Health Cooperation and African Lessons',
'<h2>COVID-19 : coopération sanitaire et leçons africaines</h2>

<h3>La réponse africaine : plus résiliente que prévu</h3>
<p>Lorsque la pandémie de COVID-19 a atteint l''Afrique en février 2020, les prédictions étaient catastrophiques : certains modèles prévoyaient <strong>millions de décès</strong> sur le continent. La réalité a été différente : au 31 décembre 2023, l''Afrique avait enregistré officiellement <strong>9,5 millions de cas et 175 000 décès</strong> — des chiffres certes sous-estimés en raison du faible taux de dépistage, mais néanmoins bien inférieurs aux projections initiales.</p>

<h3>Facteurs explicatifs de la résilience africaine</h3>
<ul>
<li><strong>Démographie jeune</strong> : âge médian de 19 ans (vs 38 en Europe), réduisant la proportion de populations à risque</li>
<li><strong>Expérience des épidémies</strong> : les pays ayant affronté Ebola (2014-2016) avaient des systèmes de surveillance et des réflexes de réponse opérationnels</li>
<li><strong>Réponse précoce de l''Africa CDC</strong> : AFTCOR activée le 5 février 2020, avant le premier cas confirmé en Afrique (14 février, Égypte)</li>
<li><strong>Mesures non pharmaceutiques rapides</strong> : fermetures de frontières, confinements, couvre-feux — souvent plus stricts et plus précoces que dans les pays occidentaux</li>
<li><strong>Facteurs environnementaux</strong> : vie en extérieur, ventilation naturelle, exposition aux UV</li>
</ul>

<h3>AVAREF et l''harmonisation réglementaire</h3>
<p>L''<strong>African Vaccine Regulatory Forum (AVAREF)</strong>, initiative de l''OMS/AFRO, a joué un rôle crucial dans l''accélération des essais cliniques de vaccins en Afrique. AVAREF a facilité :</p>
<ul>
<li>L''<strong>évaluation conjointe</strong> des protocoles d''essais cliniques par les agences réglementaires africaines</li>
<li>La <strong>reconnaissance mutuelle</strong> des autorisations d''utilisation d''urgence entre pays africains</li>
<li>La coordination de plus de <strong>20 essais cliniques COVID-19</strong> sur le continent</li>
</ul>

<h3>COVAX et l''équité vaccinale</h3>
<p>Le mécanisme <strong>COVAX</strong> (co-piloté par Gavi, CEPI et l''OMS) visait à assurer un accès équitable aux vaccins COVID-19. Résultats mitigés pour l''Afrique :</p>
<ul>
<li>Objectif initial : 20 % de couverture vaccinale d''ici fin 2021 pour tous les pays</li>
<li>Réalité : en décembre 2021, <strong>seulement 8,5 %</strong> des Africains avaient reçu au moins une dose (vs 65 % en Europe)</li>
<li>Le <strong>« nationalisme vaccinal »</strong> des pays riches a sapé COVAX : accaparement des doses, restrictions d''exportation</li>
<li>L''Afrique a reçu des vaccins avec des <strong>dates de péremption courtes</strong>, rendant la logistique de distribution impossible</li>
</ul>

<h3>Vers la souveraineté vaccinale africaine</h3>
<p>Le COVID-19 a catalysé un mouvement vers la production locale de vaccins :</p>
<ul>
<li><strong>Afrigen Biologics</strong> (Cape Town) : hub de transfert de technologie ARNm de l''OMS, développant un vaccin ARNm COVID-19 africain</li>
<li><strong>Institut Pasteur de Dakar</strong> : construction d''une usine de production de vaccins (200 millions de doses/an)</li>
<li><strong>Aspen Pharmacare</strong> (Afrique du Sud) : a produit le vaccin Johnson & Johnson pour l''Afrique</li>
<li><strong>BioNTech</strong> : annonce d''usines de vaccins ARNm au Rwanda et au Sénégal (conteneurs modulaires BioNTainer)</li>
<li>Objectif de l''UA : <strong>60 % des vaccins consommés en Afrique produits localement d''ici 2040</strong></li>
</ul>

<h3>Surveillance génomique</h3>
<p>L''Afrique a développé des capacités de séquençage génomique remarquables :</p>
<ul>
<li>Le <strong>Network for Genomics Surveillance in South Africa (NGS-SA)</strong> a identifié les variants Beta et Omicron</li>
<li>L''<strong>Africa Pathogen Genomics Initiative (Africa PGI)</strong> de l''Africa CDC a renforcé les capacités dans 20+ pays</li>
<li>Le séquençage génomique est désormais un outil de diplomatie scientifique : le partage rapide des données génomiques par l''Afrique du Sud (Omicron, novembre 2021) a été « récompensé » par des interdictions de voyage punitives</li>
</ul>

<h3>Leçons One Health du COVID-19</h3>
<ul>
<li>Les <strong>origines zoonotiques probables</strong> du SARS-CoV-2 confirment la nécessité de la surveillance One Health</li>
<li>La <strong>dimension environnementale</strong> (interface homme-faune sauvage, marchés d''animaux vivants) est centrale</li>
<li>L''<strong>équité</strong> dans l''accès aux contre-mesures médicales est un enjeu diplomatique majeur</li>
<li>La <strong>souveraineté sanitaire</strong> est indissociable de la souveraineté politique</li>
</ul>',
'text', 25, 5, 'published', TRUE);

-- ============================================
-- MODULE 6 - LEÇONS
-- ============================================

-- M6L1: Profil et compétences du diplomate One Health
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod6_id, 'Profil et compétences clés du diplomate One Health', 'Key Competencies of the One Health Diplomat',
'<h2>Profil et compétences clés du diplomate One Health</h2>

<h3>Un profil hybride et rare</h3>
<p>Le <strong>diplomate One Health</strong> est un professionnel à l''intersection de la science, de la politique et de la communication. Ce profil hybride est rare car les systèmes de formation traditionnels cloisonnent les disciplines. Pourtant, les enjeux sanitaires contemporains — pandémies, RAM, changement climatique — exigent des professionnels capables de naviguer entre secteurs, cultures et institutions.</p>

<h3>Compétences techniques</h3>
<ul>
<li><strong>Épidémiologie</strong> : comprendre les dynamiques de transmission des maladies à l''interface homme-animal-environnement, interpréter les données de surveillance, évaluer les risques</li>
<li><strong>Santé publique vétérinaire</strong> : connaître les systèmes de santé animale, les zoonoses, la sécurité sanitaire des aliments, le commerce international des animaux</li>
<li><strong>Environnement et biodiversité</strong> : comprendre les liens entre dégradation environnementale, changement climatique et émergence de maladies</li>
<li><strong>Systèmes de santé</strong> : connaître les architectures des systèmes de santé humaine et animale en Afrique, les mécanismes de financement, les indicateurs de performance</li>
<li><strong>Droit international de la santé</strong> : maîtriser le RSI, les normes OMSA, le Codex, l''Accord SPS de l''OMC</li>
</ul>

<h3>Compétences politiques et diplomatiques</h3>
<ul>
<li><strong>Analyse politique</strong> : décoder les dynamiques de pouvoir, identifier les intérêts en jeu, anticiper les obstacles</li>
<li><strong>Négociation</strong> : maîtriser les techniques de négociation multilatérale (voir leçon suivante)</li>
<li><strong>Construction de coalitions</strong> : rassembler des acteurs aux intérêts divers autour d''objectifs communs</li>
<li><strong>Connaissance institutionnelle</strong> : comprendre le fonctionnement des organisations internationales, leurs cultures, leurs processus décisionnels</li>
<li><strong>Diplomatie bilatérale et multilatérale</strong> : naviguer entre les formats de négociation</li>
</ul>

<h3>Compétences en communication</h3>
<ul>
<li><strong>Communication de crise</strong> : gérer l''information en situation d''urgence sanitaire</li>
<li><strong>Rédaction diplomatique</strong> : rédiger des résolutions, communiqués, position papers (voir Module 6, Leçon 3)</li>
<li><strong>Présentation orale</strong> : intervenir en plénière, en commission, en conférence de presse</li>
<li><strong>Multilinguisme</strong> : les langues de travail (français, anglais, arabe, portugais) sont essentielles pour la diplomatie africaine</li>
<li><strong>Communication interculturelle</strong> : adapter les messages aux contextes culturels diversifiés du continent</li>
</ul>

<h3>Compétences culturelles et interpersonnelles</h3>
<ul>
<li><strong>Intelligence culturelle</strong> : comprendre et respecter les systèmes de connaissance locaux et autochtones</li>
<li><strong>Empathie et écoute active</strong> : indispensables pour la médiation entre parties prenantes</li>
<li><strong>Résilience et gestion du stress</strong> : les négociations sanitaires sont souvent tendues et prolongées</li>
<li><strong>Éthique</strong> : intégrité, transparence, engagement pour l''équité (voir Module 6, Leçon 5)</li>
</ul>

<h3>Parcours de formation</h3>
<p>Plusieurs formations développent ces compétences en Afrique :</p>
<ul>
<li><strong>AFROHUN (Africa One Health University Network)</strong> : 85 universités dans 20 pays, curricula One Health intégrés</li>
<li><strong>FELTP (Field Epidemiology and Laboratory Training Programs)</strong> : programmes de 2 ans dans 20+ pays africains, formant les épidémiologistes de terrain</li>
<li><strong>GISMA (Geneva International Studies and Management Academy)</strong> : diplomatie de la santé mondiale</li>
<li><strong>Masters en santé publique vétérinaire</strong> : Universités de Pretoria, Nairobi, Dakar</li>
</ul>',
'text', 20, 1, 'published', TRUE);

-- M6L2: Techniques de négociation
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod6_id, 'Techniques de négociation internationale en santé', 'International Health Negotiation Techniques',
'<h2>Techniques de négociation internationale en santé</h2>

<h3>La négociation basée sur les intérêts</h3>
<p>Le modèle de la <strong>négociation raisonnée</strong> (interest-based negotiation), développé par Fisher et Ury à Harvard (<em>Getting to Yes</em>, 1981), est le cadre de référence pour les négociations sanitaires multilatérales. Ses principes :</p>
<ul>
<li><strong>Séparer les personnes du problème</strong> : distinguer les relations interpersonnelles des enjeux substantiels</li>
<li><strong>Se concentrer sur les intérêts, pas les positions</strong> : comprendre le « pourquoi » derrière les demandes</li>
<li><strong>Inventer des options pour un bénéfice mutuel</strong> : créer de la valeur avant de la distribuer</li>
<li><strong>Insister sur des critères objectifs</strong> : baser les accords sur des données scientifiques, pas sur des rapports de force</li>
</ul>

<h3>BATNA : l''alternative à la négociation</h3>
<p>Le <strong>BATNA (Best Alternative to a Negotiated Agreement)</strong> est l''option de repli si la négociation échoue. En diplomatie sanitaire :</p>
<ul>
<li>Un pays qui peut traiter un problème sanitaire seul (même imparfaitement) a un meilleur BATNA</li>
<li>Les pays africains ont souvent un <strong>BATNA faible</strong> car ils dépendent de l''aide et de la coopération internationales</li>
<li><strong>Renforcer le BATNA</strong> : investir dans les capacités nationales, diversifier les partenariats, développer la production locale</li>
<li>La <strong>coalition africaine</strong> renforce le BATNA collectif : 54 pays unis pèsent plus que des négociations bilatérales fragmentées</li>
</ul>

<h3>Construction de coalitions</h3>
<p>Les coalitions sont essentielles dans les négociations multilatérales sanitaires :</p>

<p><strong>Coalitions formelles :</strong></p>
<ul>
<li><strong>Groupe Afrique à l''OMS</strong> : 47 pays AFRO, coordination présidée par rotation</li>
<li><strong>Groupe Afrique à l''OMSA</strong> : 54 pays, coordination par le bureau sous-régional</li>
<li><strong>G77+Chine</strong> : 134 pays en développement, positions communes sur l''équité et le financement</li>
<li><strong>Groupe des PMA</strong> : 46 pays les moins avancés, dont 33 africains</li>
</ul>

<p><strong>Coalitions thématiques :</strong></p>
<ul>
<li>Alliance pour la RAM : pays partageant des positions sur la lutte contre la résistance antimicrobienne</li>
<li>Coalition pour l''équité vaccinale : pays demandant un accès équitable aux vaccins</li>
<li>Alliance pour le Traité pandémique : pays soutenant un instrument juridiquement contraignant</li>
</ul>

<h3>Tactiques de négociation spécifiques</h3>
<ul>
<li><strong>Ancrage</strong> : faire la première proposition pour fixer le cadre de discussion</li>
<li><strong>Bracketing</strong> : mettre entre crochets les textes contestés pour y revenir plus tard</li>
<li><strong>Package deals</strong> : lier plusieurs enjeux pour faciliter les compromis</li>
<li><strong>Single undertaking</strong> : « rien n''est convenu tant que tout n''est pas convenu »</li>
<li><strong>Walk-out stratégique</strong> : quitter temporairement la table pour signaler une ligne rouge</li>
<li><strong>Friends of the Chair</strong> : participer aux groupes informels pour influencer les textes en amont</li>
</ul>

<h3>Erreurs fréquentes à éviter</h3>
<ul>
<li><strong>Négocier seul</strong> : arriver sans coordination préalable avec le Groupe Afrique</li>
<li><strong>Accepter le consensus prématurément</strong> : ne pas céder sous la pression du temps sans avoir défendu ses intérêts</li>
<li><strong>Ignorer le processus</strong> : les règles de procédure sont aussi importantes que le fond</li>
<li><strong>Sous-estimer la préparation</strong> : chaque session nécessite une analyse préalable des enjeux et des positions des autres parties</li>
</ul>',
'text', 20, 2, 'published', TRUE);

-- M6L3: Rédaction de documents de politique
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod6_id, 'Rédaction de documents de politique sanitaire', 'Writing Health Policy Documents',
'<h2>Rédaction de documents de politique sanitaire</h2>

<h3>Types de documents</h3>
<p>La diplomatie sanitaire produit une variété de documents formels, chacun avec ses conventions et ses objectifs spécifiques :</p>

<p><strong>1. Policy briefs (notes de politique) :</strong></p>
<ul>
<li>Document de <strong>2-4 pages</strong> synthétisant l''évidence scientifique et formulant des recommandations concrètes</li>
<li>Structure type : Contexte → Problème → Analyse de l''évidence → Options politiques → Recommandations</li>
<li>Public cible : décideurs politiques, ministres, directeurs généraux</li>
<li>Règle d''or : un message clé par page, graphiques lisibles, recommandations actionnables</li>
</ul>

<p><strong>2. Position papers (documents de position) :</strong></p>
<ul>
<li>Exposé de la <strong>position officielle d''un pays ou d''un groupe</strong> sur un sujet de négociation</li>
<li>Structure : Contexte → Position → Arguments de soutien → Propositions de texte</li>
<li>Doivent refléter la position coordonnée du Groupe Afrique, pas seulement celle d''un pays</li>
<li>Distribués avant les sessions de négociation pour influencer les discussions</li>
</ul>

<p><strong>3. Résolutions :</strong></p>
<ul>
<li>Instruments formels adoptés par les organes directeurs (AMS, Session générale OMSA, Assemblée UA)</li>
<li>Structure : <strong>Préambule</strong> (clauses « rappelant », « notant », « préoccupé par ») + <strong>Dispositif</strong> (clauses « décide », « invite », « prie »)</li>
<li>Chaque mot est négocié : « invite » vs « exhorte » vs « décide » ont des implications juridiques différentes</li>
<li>Les résolutions peuvent être « de procédure » (règles de fonctionnement) ou « de fond » (orientations politiques)</li>
</ul>

<p><strong>4. Communiqués :</strong></p>
<ul>
<li>Déclarations officielles à l''issue de réunions, sommets ou conférences</li>
<li>Négociés mot par mot dans les « contact groups »</li>
<li>Le <strong>« chapeau »</strong> (paragraphes introductifs) fixe le ton ; le dispositif contient les engagements</li>
</ul>

<h3>Principes de rédaction</h3>
<ul>
<li><strong>Clarté</strong> : éviter le jargon technique ; un document de politique doit être compris par un non-spécialiste</li>
<li><strong>Concision</strong> : respecter les limites de longueur (les décideurs ne lisent pas les documents longs)</li>
<li><strong>Évidence</strong> : chaque affirmation doit être soutenue par des données (citer les sources)</li>
<li><strong>Orientation action</strong> : chaque recommandation doit être spécifique, mesurable, atteignable et temporellement définie (SMART)</li>
<li><strong>Bilinguisme</strong> : dans le contexte africain, les documents doivent souvent exister en français et en anglais, avec cohérence terminologique</li>
</ul>

<h3>Le langage diplomatique en santé</h3>
<p>Le langage diplomatique utilise des formulations codifiées dont l''intensité varie :</p>
<ul>
<li><strong>« Note »</strong> → prise de connaissance neutre</li>
<li><strong>« Accueille favorablement »</strong> → approbation modérée</li>
<li><strong>« Invite »</strong> → suggestion non contraignante</li>
<li><strong>« Exhorte »</strong> → recommandation forte</li>
<li><strong>« Décide »</strong> → engagement contraignant</li>
<li><strong>« Exprime sa préoccupation »</strong> → critique diplomatique</li>
<li><strong>« Déplore »</strong> → critique forte</li>
<li><strong>« Condamne »</strong> → la plus forte critique (rarement utilisée en santé)</li>
</ul>

<h3>Exercice pratique : structure d''un policy brief One Health</h3>
<ol>
<li><strong>Titre accrocheur</strong> : « Investir dans One Health : protéger l''Afrique contre la prochaine pandémie »</li>
<li><strong>Messages clés</strong> : 3 bullet points résumant l''essentiel</li>
<li><strong>Contexte</strong> : situation actuelle, données chiffrées</li>
<li><strong>Analyse</strong> : causes du problème, facteurs de risque</li>
<li><strong>Options politiques</strong> : 2-3 scénarios avec coûts et bénéfices</li>
<li><strong>Recommandations</strong> : actions concrètes, timeline, responsables</li>
<li><strong>Références</strong> : sources crédibles (OMS, OMSA, FAO, publications scientifiques)</li>
</ol>',
'text', 20, 3, 'published', TRUE);

-- M6L4: Mobilisation des ressources
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod6_id, 'Mobilisation des ressources et partenariats', 'Resource Mobilization and Partnerships',
'<h2>Mobilisation des ressources et partenariats</h2>

<h3>Le paysage du financement One Health</h3>
<p>La mobilisation de ressources pour les programmes One Health exige une compréhension fine du paysage des bailleurs et des mécanismes de financement. Le diplomate One Health doit être capable de traduire les besoins sanitaires en propositions de financement convaincantes.</p>

<h3>Rédaction de propositions de financement</h3>
<p>Les propositions de financement One Health doivent démontrer :</p>
<ul>
<li><strong>Le problème</strong> : données épidémiologiques, impact économique, populations affectées</li>
<li><strong>La solution One Health</strong> : pourquoi une approche intégrée est plus efficace qu''une approche sectorielle</li>
<li><strong>Le cadre logique</strong> : objectifs → résultats → activités → indicateurs → moyens de vérification</li>
<li><strong>Le budget</strong> : détaillé, réaliste, avec co-financement national (les bailleurs exigent généralement 10-30 % de contrepartie nationale)</li>
<li><strong>La durabilité</strong> : plan de pérennisation au-delà du financement du projet</li>
<li><strong>La théorie du changement</strong> : comment les activités du projet conduiront aux impacts souhaités</li>
</ul>

<h3>Les principaux mécanismes de financement</h3>
<p><strong>Pandemic Fund (ancien FIF) :</strong></p>
<ul>
<li>Créé en 2022, hébergé par la Banque mondiale, doté de <strong>1,6 milliard USD</strong></li>
<li>Premier cycle de financement (2023) : <strong>338 millions USD</strong> pour 37 projets dans 75 pays</li>
<li>Priorités : surveillance, laboratoires, ressources humaines, préparation One Health</li>
<li>Les pays africains ont reçu la plus grande part des premiers financements</li>
</ul>

<p><strong>Fonds mondial :</strong></p>
<ul>
<li>7e reconstitution (2022) : <strong>15,7 milliards USD</strong> pour 2024-2026</li>
<li>Composante « systèmes de santé résilients et durables » : inclut des éléments One Health</li>
<li>Les propositions C19RM (COVID-19 Response Mechanism) ont financé des activités de surveillance One Health</li>
</ul>

<p><strong>Banque mondiale :</strong></p>
<ul>
<li>Programme <strong>HEAL (Health Emergency Preparedness and Response)</strong> : 500 millions USD pour l''Afrique</li>
<li>Crédit IDA et guichet concessional : conditions favorables pour les pays à faible revenu</li>
<li>Programme de prévention One Health : en développement</li>
</ul>

<h3>Partenariats public-privé (PPP)</h3>
<p>Les PPP offrent des opportunités croissantes en santé One Health :</p>
<ul>
<li><strong>Industrie pharmaceutique vétérinaire</strong> : MSD Animal Health, Boehringer Ingelheim, Zoetis — programmes de responsabilité sociale et dons de vaccins (ex. : programme de vaccination antirabique)</li>
<li><strong>Agrobusiness</strong> : intégration de la biosécurité dans les chaînes d''approvisionnement</li>
<li><strong>Technologies numériques</strong> : plateformes de surveillance mobile, e-learning, télémédecine vétérinaire</li>
<li><strong>Assurance</strong> : produits d''assurance bétail pour la résilience des éleveurs</li>
</ul>

<h3>Coopération Sud-Sud</h3>
<p>La coopération Sud-Sud est un mécanisme sous-exploité en diplomatie One Health :</p>
<ul>
<li><strong>Brésil-Afrique</strong> : transfert de technologies pour la surveillance de la FA et la production de vaccins via EMBRAPA et le Laboratoire de Lanagro</li>
<li><strong>Inde-Afrique</strong> : programme ITEC de formation en santé publique vétérinaire, fourniture de médicaments génériques</li>
<li><strong>Chine-Afrique</strong> : Forum FOCAC, construction d''infrastructures sanitaires, envoi d''équipes médicales</li>
<li><strong>Intra-africaine</strong> : partage d''expertise entre pays (le Sénégal assiste les pays voisins en virologie, le Kenya en surveillance One Health)</li>
</ul>

<h3>Conseils pratiques pour la mobilisation de ressources</h3>
<ol>
<li><strong>Cartographier les bailleurs</strong> : identifier ceux dont les priorités correspondent à vos besoins</li>
<li><strong>Construire des relations</strong> : le financement suit la confiance, cultivée sur le long terme</li>
<li><strong>Démontrer les résultats</strong> : les bailleurs financent les projets qui montrent des résultats mesurables</li>
<li><strong>Diversifier les sources</strong> : ne pas dépendre d''un seul bailleur</li>
<li><strong>Inclure le co-financement national</strong> : signe d''appropriation et de durabilité</li>
</ol>',
'text', 22, 4, 'published', TRUE);

-- M6L5: Éthique et inclusion
INSERT INTO lessons (module_id, title_fr, title_en, content_fr, content_type, duration_minutes, sort_order, status, is_active) VALUES
(@mod6_id, 'Éthique, équité et inclusion en diplomatie sanitaire', 'Ethics, Equity and Inclusion in Health Diplomacy',
'<h2>Éthique, équité et inclusion en diplomatie sanitaire</h2>

<h3>Équité en santé : un impératif éthique</h3>
<p>L''<strong>équité en santé</strong> signifie que chaque personne a la possibilité d''atteindre son plein potentiel de santé, sans être désavantagée par sa position sociale, son origine ethnique, son genre ou sa géographie. En contexte One Health africain, l''équité implique que :</p>
<ul>
<li>Les <strong>communautés pastorales</strong> reçoivent des services vétérinaires et de santé humaine comparables aux populations sédentaires urbaines</li>
<li>Les <strong>petits éleveurs</strong> ont accès aux vaccins et aux soins vétérinaires au même titre que les exploitations commerciales</li>
<li>Les <strong>populations rurales</strong> ne meurent pas de zoonoses évitables faute de diagnostic et de traitement</li>
<li>L''accès aux <strong>contre-mesures médicales</strong> (vaccins, traitements, diagnostics) ne dépend pas du PIB national</li>
</ul>

<h3>Genre et One Health</h3>
<p>Les inégalités de genre sont omniprésentes dans les systèmes sanitaires africains :</p>
<ul>
<li><strong>Femmes et élevage</strong> : les femmes possèdent et gèrent la majorité des petits ruminants et de la volaille en Afrique, mais ont moins accès aux services vétérinaires, au crédit et à la formation</li>
<li><strong>Maladies zoonotiques</strong> : les femmes sont plus exposées à la brucellose (traite du lait) et à la grippe aviaire (abattage de volaille)</li>
<li><strong>Participation aux décisions</strong> : les femmes sont sous-représentées dans les organes de décision sanitaire — seulement <strong>14 % des délégués</strong> aux sessions de l''OMSA sont des femmes</li>
<li><strong>COVID-19</strong> : les mesures de confinement ont aggravé les violences basées sur le genre et réduit l''accès aux services de santé reproductive</li>
</ul>

<h3>Savoirs autochtones et systèmes de connaissance locaux</h3>
<p>Les communautés africaines détiennent des <strong>savoirs traditionnels</strong> précieux pour la santé One Health :</p>
<ul>
<li><strong>Ethnovétérinaire</strong> : les pasteurs masaï, peuls, touaregs possèdent des connaissances centenaires sur les maladies animales et les plantes médicinales</li>
<li><strong>Surveillance communautaire</strong> : les éleveurs sont souvent les premiers à détecter les maladies émergentes dans leurs troupeaux</li>
<li><strong>Gestion des écosystèmes</strong> : les pratiques traditionnelles de transhumance contribuent à la conservation de la biodiversité et à la gestion durable des pâturages</li>
<li><strong>Intégration</strong> : les programmes One Health les plus efficaces combinent savoirs scientifiques et savoirs locaux dans une approche participative</li>
</ul>

<h3>Décoloniser la santé mondiale</h3>
<p>Le mouvement de <strong>décolonisation de la santé mondiale</strong> interpelle la diplomatie sanitaire :</p>
<ul>
<li><strong>Asymétries de pouvoir</strong> : les agendas de recherche et les priorités de financement sont souvent définis par les pays donateurs, pas par les pays bénéficiaires</li>
<li><strong>Extractivisme scientifique</strong> : collecte de données et d''échantillons biologiques en Afrique pour des publications et des brevets dans les pays du Nord, sans bénéfice pour les communautés sources</li>
<li><strong>Leadership africain</strong> : promouvoir les chercheurs et les leaders africains dans les positions de décision des organisations internationales</li>
<li><strong>Protocole de Nagoya</strong> (2010) : cadre juridique pour le partage juste et équitable des avantages découlant de l''utilisation des ressources génétiques — applicable aux pathogènes</li>
</ul>

<h3>Cadre éthique pour la diplomatie One Health</h3>
<p>Le diplomate One Health doit intégrer des principes éthiques fondamentaux :</p>
<ul>
<li><strong>Bienfaisance</strong> : agir pour le bien des populations et des animaux</li>
<li><strong>Non-malfaisance</strong> : ne pas causer de tort (ex. : les embargos commerciaux disproportionnés nuisent aux populations dépendantes de l''élevage)</li>
<li><strong>Justice</strong> : distribuer équitablement les ressources et les bénéfices sanitaires</li>
<li><strong>Autonomie</strong> : respecter le droit des pays et des communautés à déterminer leurs propres priorités sanitaires</li>
<li><strong>Solidarité</strong> : agir collectivement face aux menaces communes</li>
<li><strong>Transparence</strong> : partager les informations sanitaires de manière honnête et complète</li>
<li><strong>Responsabilité</strong> : rendre compte des engagements pris et des ressources utilisées</li>
</ul>

<h3>Vers une diplomatie sanitaire inclusive</h3>
<p>Une diplomatie One Health véritablement inclusive doit :</p>
<ul>
<li>Intégrer les <strong>communautés affectées</strong> dans la conception et la mise en œuvre des programmes</li>
<li>Garantir la <strong>représentation équitable</strong> des genres, des régions et des disciplines</li>
<li>Valoriser les <strong>savoirs locaux</strong> aux côtés des savoirs scientifiques</li>
<li>Promouvoir la <strong>souveraineté sanitaire</strong> des pays africains</li>
<li>Œuvrer pour un <strong>système multilatéral plus juste</strong> où la voix de l''Afrique porte son poids démographique et épidémiologique</li>
</ul>',
'text', 18, 5, 'published', TRUE);

-- ============================================
-- QUIZ MODULE 1: Fondements de l'approche One Health
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 1 : Fondements de l''approche One Health', 'Quiz Module 1: Foundations of the One Health Approach',
'Testez vos connaissances sur les origines, les piliers et le cadre institutionnel de l''approche One Health.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod1_id, 'published', TRUE, 1);
SET @quiz1_id = LAST_INSERT_ID();

-- Q1
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Qui est considéré comme le précurseur du concept One Health pour avoir forgé le terme « zoonose » en 1855 ?', 'mcq',
'Rudolf Virchow, médecin et pathologiste allemand, a forgé le terme « zoonose » en étudiant la trichinose et a déclaré qu''il n''y avait pas de frontière entre médecine humaine et animale.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"Louis Pasteur","is_correct":false},{"text":"Rudolf Virchow","is_correct":true},{"text":"Robert Koch","is_correct":false},{"text":"Calvin Schwabe","is_correct":false}]',
'"Rudolf Virchow"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 1);

-- Q2
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('En quelle année les Principes de Manhattan ont-ils été adoptés ?', 'mcq',
'Les 12 Principes de Manhattan ont été adoptés en septembre 2004 lors d''un symposium organisé par la Wildlife Conservation Society à la Rockefeller University de New York.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"2000","is_correct":false},{"text":"2004","is_correct":true},{"text":"2010","is_correct":false},{"text":"2019","is_correct":false}]',
'"2004"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 2);

-- Q3
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Quelle organisation a rejoint l''alliance tripartite en 2022 pour former la Quadripartite ?', 'mcq',
'Le Programme des Nations Unies pour l''environnement (PNUE), dont le siège est à Nairobi, a rejoint l''OMS, la FAO et l''OMSA en mars 2022.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"La Banque mondiale","is_correct":false},{"text":"Le PNUE","is_correct":true},{"text":"L''UNICEF","is_correct":false},{"text":"L''Union Africaine","is_correct":false}]',
'"Le PNUE"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 3);

-- Q4
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Quel pourcentage des maladies infectieuses émergentes chez l''homme est d''origine zoonotique ?', 'mcq',
'Selon l''OMS et l''OMSA, 75 % des maladies infectieuses émergentes chez l''homme sont d''origine zoonotique.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"50 %","is_correct":false},{"text":"60 %","is_correct":false},{"text":"75 %","is_correct":true},{"text":"90 %","is_correct":false}]',
'"75 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 4);

-- Q5
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Combien de décès humains la rage cause-t-elle en Afrique chaque année ?', 'mcq',
'L''Afrique enregistre environ 21 000 décès humains par an dus à la rage, soit 36 % des décès mondiaux.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"5 000","is_correct":false},{"text":"11 000","is_correct":false},{"text":"21 000","is_correct":true},{"text":"50 000","is_correct":false}]',
'"21 000"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 5);

-- Q6
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Le One Health Joint Plan of Action (2022-2026) est articulé autour de combien de pistes d''action ?', 'mcq',
'Le OH JPA comprend 6 pistes d''action : capacités OH, zoonoses, RAM, sécurité alimentaire, menaces environnementales, intégration dans les politiques de développement.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"4","is_correct":false},{"text":"5","is_correct":false},{"text":"6","is_correct":true},{"text":"8","is_correct":false}]',
'"6"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 6);

-- Q7
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Quel ODD est le plus directement lié à l''approche One Health ?', 'mcq',
'L''ODD 3 (Bonne santé et bien-être) est le plus directement lié, avec la cible 3.3 sur les maladies tropicales négligées (dont les zoonoses) et la cible 3.d sur le renforcement des capacités d''alerte sanitaire.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"ODD 1 : Pas de pauvreté","is_correct":false},{"text":"ODD 2 : Faim zéro","is_correct":false},{"text":"ODD 3 : Bonne santé et bien-être","is_correct":true},{"text":"ODD 13 : Lutte contre le changement climatique","is_correct":false}]',
'"ODD 3 : Bonne santé et bien-être"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 7);

-- Q8
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Quel est le rôle principal de l''OMSA (anciennement OIE) dans le cadre One Health ?', 'mcq',
'L''OMSA est l''organisation intergouvernementale responsable de l''établissement des normes de référence pour la santé animale et le commerce international des animaux et produits d''origine animale.',
'hard', 1, @course_id, TRUE, 1,
'[{"text":"Financer les programmes de vaccination animale en Afrique","is_correct":false},{"text":"Établir les normes de référence pour la santé animale et le commerce international","is_correct":true},{"text":"Coordonner la réponse aux urgences sanitaires humaines","is_correct":false},{"text":"Produire les vaccins vétérinaires pour le continent africain","is_correct":false}]',
'"Établir les normes de référence pour la santé animale et le commerce international"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 8);

-- Q9
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('La Fièvre de la Vallée du Rift illustre parfaitement le nexus One Health car elle implique :', 'mcq',
'La FVR est transmise par les moustiques (environnement/climat), amplifie chez les ruminants (santé animale) et infecte l''homme par contact (santé humaine), illustrant les trois piliers One Health.',
'hard', 1, @course_id, TRUE, 1,
'[{"text":"Uniquement la santé humaine et les laboratoires de diagnostic","is_correct":false},{"text":"L''environnement (pluies/moustiques), les ruminants (santé animale) et l''homme (santé humaine)","is_correct":true},{"text":"Uniquement le commerce international et les normes SPS","is_correct":false},{"text":"Les antibiotiques et la résistance antimicrobienne","is_correct":false}]',
'"L''environnement (pluies/moustiques), les ruminants (santé animale) et l''homme (santé humaine)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 9);

-- Q10
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by,
  options, correct_answer)
VALUES ('Quel panel d''experts a adopté la première définition opérationnelle consensuelle de One Health en 2021 ?', 'mcq',
'Le One Health High-Level Expert Panel (OHHLEP), créé conjointement par l''OMS, la FAO, l''OMSA et le PNUE, a adopté cette définition en décembre 2021.',
'hard', 1, @course_id, TRUE, 1,
'[{"text":"Le G20 Health Working Group","is_correct":false},{"text":"Le One Health High-Level Expert Panel (OHHLEP)","is_correct":true},{"text":"Le Conseil de sécurité des Nations Unies","is_correct":false},{"text":"La Commission de l''Union Africaine","is_correct":false}]',
'"Le One Health High-Level Expert Panel (OHHLEP)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz1_id, @q_id, 10);

-- Update module 1 quiz reference
UPDATE course_modules SET quiz_id = @quiz1_id WHERE id = @mod1_id;

-- ============================================
-- QUIZ MODULE 2: Le paysage sanitaire africain
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 2 : Le paysage sanitaire africain', 'Quiz Module 2: The African Health Landscape',
'Testez vos connaissances sur les systèmes de santé animale, les TADs, la RAM et le changement climatique en Afrique.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod2_id, 'published', TRUE, 1);
SET @quiz2_id = LAST_INSERT_ID();

-- Q1
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel facteur historique a entraîné le démantèlement massif des services vétérinaires publics en Afrique dans les années 1980-1990 ?', 'mcq',
'Les programmes d''ajustement structurel imposés par le FMI et la Banque mondiale ont conduit à une réduction de 40-60 % des effectifs vétérinaires publics.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"Les guerres d''indépendance","is_correct":false},{"text":"Les programmes d''ajustement structurel du FMI et de la Banque mondiale","is_correct":true},{"text":"L''épidémie de peste bovine","is_correct":false},{"text":"La création de l''Union Africaine","is_correct":false}]',
'"Les programmes d''ajustement structurel du FMI et de la Banque mondiale"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 1);

-- Q2
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien de sérotypes du virus de la fièvre aphteuse circulent en Afrique ?', 'mcq',
'Six des sept sérotypes du virus de la FA circulent en Afrique (O, A, C, SAT1, SAT2, SAT3), ce qui complique considérablement la lutte vaccinale.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"3","is_correct":false},{"text":"4","is_correct":false},{"text":"6","is_correct":true},{"text":"7","is_correct":false}]',
'"6"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 2);

-- Q3
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Selon l''étude GRAM publiée dans The Lancet en 2022, combien de décès dans le monde ont été directement attribués à la résistance antimicrobienne en 2019 ?', 'mcq',
'L''étude GRAM a estimé 1,27 million de décès directement attribuables à la RAM et 4,95 millions associés en 2019.',
'hard', 1, @course_id, TRUE, 1,
'[{"text":"500 000","is_correct":false},{"text":"1,27 million","is_correct":true},{"text":"3,5 millions","is_correct":false},{"text":"10 millions","is_correct":false}]',
'"1,27 million"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 3);

-- Q4
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel pourcentage des produits alimentaires d''origine animale est commercialisé via des circuits informels en Afrique ?', 'mcq',
'80-90 % des produits alimentaires d''origine animale en Afrique passent par des circuits informels, avec peu ou pas de contrôle sanitaire.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"30-40 %","is_correct":false},{"text":"50-60 %","is_correct":false},{"text":"80-90 %","is_correct":true},{"text":"95-100 %","is_correct":false}]',
'"80-90 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 4);

-- Q5
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle maladie animale transfrontalière est originaire d''Afrique et n''a ni vaccin ni traitement disponible ?', 'mcq',
'La peste porcine africaine (PPA) est originaire d''Afrique, avec un cycle sauvage impliquant les phacochères. Sa mortalité peut atteindre 100 % et il n''existe aucun vaccin ni traitement.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"La fièvre aphteuse","is_correct":false},{"text":"La peste des petits ruminants","is_correct":false},{"text":"La peste porcine africaine","is_correct":true},{"text":"La péripneumonie contagieuse bovine","is_correct":false}]',
'"La peste porcine africaine"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 5);

-- Q6
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien de pays africains ont développé un Plan d''Action National contre la RAM couvrant les secteurs humain, animal et environnemental (approche One Health) ?', 'mcq',
'En 2023, 42 pays africains ont un PAN-RAM, mais seulement 18 couvrent simultanément les trois secteurs One Health.',
'hard', 1, @course_id, TRUE, 1,
'[{"text":"8","is_correct":false},{"text":"18","is_correct":true},{"text":"35","is_correct":false},{"text":"42","is_correct":false}]',
'"18"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 6);

-- Q7
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le changement climatique agit comme un multiplicateur de menaces One Health en Afrique. Lequel de ces effets est directement lié ?', 'mcq',
'Le réchauffement climatique permet l''expansion des zones favorables aux moustiques vecteurs vers de nouvelles altitudes (hauts plateaux d''Afrique de l''Est), exposant des populations sans immunité.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"La diminution du nombre de vétérinaires","is_correct":false},{"text":"L''expansion des vecteurs de maladies vers de nouvelles altitudes et latitudes","is_correct":true},{"text":"L''augmentation des budgets de santé animale","is_correct":false},{"text":"La fermeture des marchés d''animaux vivants","is_correct":false}]',
'"L''expansion des vecteurs de maladies vers de nouvelles altitudes et latitudes"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 7);

-- Q8
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel accord de l''OMC régit les mesures de protection sanitaire dans le commerce international ?', 'mcq',
'L''Accord SPS (Sanitaire et Phytosanitaire) de l''OMC, entré en vigueur en 1995, régit les mesures de protection sanitaire et reconnaît les normes du Codex, de l''OMSA et de la CIPV.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"L''Accord TRIPS","is_correct":false},{"text":"L''Accord SPS","is_correct":true},{"text":"L''Accord TBT","is_correct":false},{"text":"L''Accord GATS","is_correct":false}]',
'"L''Accord SPS"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 8);

-- Q9
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel ratio vétérinaire/habitant l''Afrique présente-t-elle en moyenne ?', 'mcq',
'L''Afrique compte environ 75 000 vétérinaires pour 1,4 milliard d''habitants, soit un ratio de 1 pour 57 000, contre 1 pour 3 000 en Europe.',
'medium', 1, @course_id, TRUE, 1,
'[{"text":"1 pour 3 000","is_correct":false},{"text":"1 pour 10 000","is_correct":false},{"text":"1 pour 57 000","is_correct":true},{"text":"1 pour 100 000","is_correct":false}]',
'"1 pour 57 000"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 9);

-- Q10
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle zone de libre-échange, entrée en vigueur en 2021, nécessite une harmonisation des standards sanitaires entre les 54 pays africains ?', 'mcq',
'La ZLECAf (Zone de Libre-Échange Continentale Africaine) crée le plus grand marché unique au monde et nécessite une Annexe SPS harmonisée.',
'easy', 1, @course_id, TRUE, 1,
'[{"text":"AGOA","is_correct":false},{"text":"ZLECAf","is_correct":true},{"text":"CETA","is_correct":false},{"text":"APE UE-Afrique","is_correct":false}]',
'"ZLECAf"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz2_id, @q_id, 10);

UPDATE course_modules SET quiz_id = @quiz2_id WHERE id = @mod2_id;

-- ============================================
-- QUIZ MODULE 3: Diplomatie sanitaire et gouvernance
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 3 : Diplomatie sanitaire et gouvernance', 'Quiz Module 3: Health Diplomacy and Governance',
'Testez vos connaissances sur le RSI, les normes OMSA, les négociations multilatérales et le plaidoyer.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod3_id, 'published', TRUE, 1);
SET @quiz3_id = LAST_INSERT_ID();

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('En quelle année le Règlement Sanitaire International (RSI) actuellement en vigueur a-t-il été adopté ?', 'mcq',
'Le RSI a été adopté en mai 2005 par l''AMS et est entré en vigueur le 15 juin 2007.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"1969","is_correct":false},{"text":"2001","is_correct":false},{"text":"2005","is_correct":true},{"text":"2012","is_correct":false}]', '"2005"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 1);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien de pays africains ont complété au moins un cycle d''évaluation JEE ?', 'mcq',
'46 pays africains ont complété au moins un cycle JEE, plus que toute autre région OMS.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"25","is_correct":false},{"text":"36","is_correct":false},{"text":"46","is_correct":true},{"text":"54","is_correct":false}]', '"46"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 2);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel est le poids électoral de l''Afrique à la Session générale de l''OMSA ?', 'mcq',
'L''Afrique détient 54 voix sur 183 membres, soit environ 30 % du poids électoral total.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Environ 10 %","is_correct":false},{"text":"Environ 20 %","is_correct":false},{"text":"Environ 30 %","is_correct":true},{"text":"Environ 40 %","is_correct":false}]', '"Environ 30 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 3);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('La diplomatie sanitaire « dure » se distingue par :', 'mcq',
'La diplomatie sanitaire « dure » implique la négociation de traités contraignants, sanctions et différends commerciaux, contrairement à la diplomatie « douce » (coopération, aide, diplomatie scientifique).', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"L''envoi d''experts et la coopération technique","is_correct":false},{"text":"La négociation de traités contraignants et les sanctions commerciales","is_correct":true},{"text":"Les dons de vaccins et l''aide humanitaire","is_correct":false},{"text":"La collaboration en recherche et le partage de données","is_correct":false}]',
'"La négociation de traités contraignants et les sanctions commerciales"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 4);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Que signifie l''acronyme BATNA dans le contexte des négociations ?', 'mcq',
'BATNA = Best Alternative to a Negotiated Agreement (meilleure alternative à un accord négocié). C''est l''option de repli si la négociation échoue.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"Bureau Africain des Traités et Normes Alimentaires","is_correct":false},{"text":"Best Alternative to a Negotiated Agreement","is_correct":true},{"text":"Bilateral Agreement for Transboundary Notification in Africa","is_correct":false},{"text":"Base for Animal Trade Normalization in Africa","is_correct":false}]',
'"Best Alternative to a Negotiated Agreement"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 5);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Selon l''étude de la Banque mondiale, combien faudrait-il investir par an en prévention One Health pour éviter 30 milliards USD de pertes pandémiques annuelles ?', 'mcq',
'L''étude de 2012 de la Banque mondiale a démontré qu''un investissement mondial de 3,4 milliards USD/an en prévention One Health éviterait 30 milliards USD/an de pertes.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"500 millions USD","is_correct":false},{"text":"1,2 milliard USD","is_correct":false},{"text":"3,4 milliards USD","is_correct":true},{"text":"10 milliards USD","is_correct":false}]',
'"3,4 milliards USD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 6);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le Processus PVS de l''OMSA évalue les services vétérinaires selon combien de compétences critiques ?', 'mcq',
'Le Processus PVS évalue 47 compétences critiques regroupées en 4 piliers.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"12","is_correct":false},{"text":"25","is_correct":false},{"text":"47","is_correct":true},{"text":"100","is_correct":false}]', '"47"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 7);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel défi principal affecte les délégations africaines lors des négociations multilatérales ?', 'mcq',
'Les délégations africaines sont souvent composées de 1-3 personnes, contre 10-20 pour les pays développés, rendant difficile le suivi simultané de multiples commissions.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Le manque de positions communes","is_correct":false},{"text":"La taille réduite des délégations (1-3 personnes vs 10-20)","is_correct":true},{"text":"L''absence de droit de vote","is_correct":false},{"text":"L''interdiction de former des coalitions","is_correct":false}]',
'"La taille réduite des délégations (1-3 personnes vs 10-20)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 8);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le Codex Alimentarius est un programme conjoint de quelles organisations ?', 'mcq',
'Le Codex Alimentarius est un programme conjoint FAO/OMS créé en 1963 pour établir les normes alimentaires internationales.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"OMS et OMSA","is_correct":false},{"text":"FAO et OMS","is_correct":true},{"text":"FAO et Banque mondiale","is_correct":false},{"text":"OMC et PNUE","is_correct":false}]', '"FAO et OMS"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 9);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le cadre ADVO pour le plaidoyer comprend quatre étapes. Que représente le « A » ?', 'mcq',
'Dans le cadre ADVO : A = Analyse (cartographie des parties prenantes, paysage politique, fenêtres d''opportunité).', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"Action","is_correct":false},{"text":"Analyse","is_correct":true},{"text":"Advocacy","is_correct":false},{"text":"Alliance","is_correct":false}]', '"Analyse"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz3_id, @q_id, 10);

UPDATE course_modules SET quiz_id = @quiz3_id WHERE id = @mod3_id;

-- ============================================
-- QUIZ MODULE 4: Organisations et initiatives africaines
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 4 : Organisations et initiatives africaines', 'Quiz Module 4: African Organizations and Initiatives',
'Testez vos connaissances sur l''Africa CDC, l''AU-IBAR, les CER et les initiatives de financement.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod4_id, 'published', TRUE, 1);
SET @quiz4_id = LAST_INSERT_ID();

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('En quelle année l''Africa CDC a-t-il été créé par l''Union Africaine ?', 'mcq',
'L''Africa CDC a été créé en janvier 2017 par la 25e Assemblée de l''UA, suite aux leçons de l''épidémie d''Ebola 2014-2016.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"2014","is_correct":false},{"text":"2015","is_correct":false},{"text":"2017","is_correct":true},{"text":"2020","is_correct":false}]', '"2017"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 1);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Où est basé le Bureau Interafricain des Ressources Animales (AU-IBAR) ?', 'mcq',
'AU-IBAR est basé à Nairobi, Kenya. Fondé en 1951, c''est la plus ancienne institution technique panafricaine dédiée à l''élevage.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"Addis-Abeba, Éthiopie","is_correct":false},{"text":"Nairobi, Kenya","is_correct":true},{"text":"Dakar, Sénégal","is_correct":false},{"text":"Le Caire, Égypte","is_correct":false}]', '"Nairobi, Kenya"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 2);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel pourcentage des vaccins vétérinaires utilisés en Afrique échoue aux tests de contrôle de qualité selon l''AU-PANVAC ?', 'mcq',
'40 % des vaccins vétérinaires utilisés en Afrique échouent aux tests de qualité de l''AU-PANVAC, soulignant l''importance cruciale du contrôle qualité.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"10 %","is_correct":false},{"text":"25 %","is_correct":false},{"text":"40 %","is_correct":true},{"text":"60 %","is_correct":false}]', '"40 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 3);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel programme de la Banque mondiale a investi plus de 600 millions USD dans la surveillance en Afrique de l''Ouest ?', 'mcq',
'Le programme REDISSE (Regional Disease Surveillance Systems Enhancement) a mobilisé 600+ millions USD en 4 phases pour 15 pays ouest-africains.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"GHSA","is_correct":false},{"text":"PREDICT","is_correct":false},{"text":"REDISSE","is_correct":true},{"text":"EPT","is_correct":false}]', '"REDISSE"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 4);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien de pays africains ont atteint l''objectif de la Déclaration d''Abuja (15 % du budget à la santé) de manière soutenue ?', 'mcq',
'Seuls 5 pays ont atteint cet objectif de manière soutenue : Rwanda, Botswana, Malawi, Zambie et Eswatini.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"2","is_correct":false},{"text":"5","is_correct":true},{"text":"15","is_correct":false},{"text":"25","is_correct":false}]', '"5"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 5);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle CER dispose de l''Organisation Ouest-Africaine de la Santé (OOAS/WAHO) comme institution spécialisée ?', 'mcq',
'La CEDEAO (Communauté Économique des États de l''Afrique de l''Ouest) dispose de l''OOAS/WAHO, basée à Bobo-Dioulasso, Burkina Faso.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"CEEAC","is_correct":false},{"text":"CEDEAO","is_correct":true},{"text":"EAC","is_correct":false},{"text":"SADC","is_correct":false}]', '"CEDEAO"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 6);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le New Public Health Order (NPHO) de l''Africa CDC fixe comme objectif de produire localement quel pourcentage des vaccins consommés en Afrique d''ici 2040 ?', 'mcq',
'Le NPHO vise 60 % de production locale de vaccins d''ici 2040, contre seulement 1 % actuellement.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"20 %","is_correct":false},{"text":"40 %","is_correct":false},{"text":"60 %","is_correct":true},{"text":"80 %","is_correct":false}]', '"60 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 7);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('La LiDeSA (Livestock Development Strategy for Africa) couvre quelle période ?', 'mcq',
'La LiDeSA, adoptée par l''UA, est une stratégie à 20 ans couvrant la période 2015-2035.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"2010-2020","is_correct":false},{"text":"2015-2035","is_correct":true},{"text":"2020-2040","is_correct":false},{"text":"2025-2050","is_correct":false}]', '"2015-2035"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 8);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle initiative internationale, lancée en 2021, vise à prévenir l''émergence de nouvelles zoonoses aux interfaces homme-animal-environnement ?', 'mcq',
'PREZODE (Preventing Zoonotic Disease Emergence) a été lancée en 2021 lors du One Planet Summit, avec une forte composante africaine.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"PREDICT","is_correct":false},{"text":"PREZODE","is_correct":true},{"text":"REDISSE","is_correct":false},{"text":"RESOLAB","is_correct":false}]', '"PREZODE"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 9);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien d''universités compte le réseau AFROHUN (Africa One Health University Network) ?', 'mcq',
'AFROHUN regroupe 85 universités dans 20 pays africains, intégrant One Health dans les curricula de formation.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"25","is_correct":false},{"text":"50","is_correct":false},{"text":"85","is_correct":true},{"text":"120","is_correct":false}]', '"85"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz4_id, @q_id, 10);

UPDATE course_modules SET quiz_id = @quiz4_id WHERE id = @mod4_id;

-- ============================================
-- QUIZ MODULE 5: Études de cas et réponses africaines
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 5 : Études de cas et réponses africaines', 'Quiz Module 5: Case Studies and African Responses',
'Testez vos connaissances sur les réponses africaines à H5N1, Ebola, la rage, la PPR et le COVID-19.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod5_id, 'published', TRUE, 1);
SET @quiz5_id = LAST_INSERT_ID();

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('En quelle année le virus H5N1 a-t-il été détecté pour la première fois en Afrique ?', 'mcq',
'Le H5N1 a été détecté en février 2006 au Nigeria, probablement introduit par des oiseaux migrateurs.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"2003","is_correct":false},{"text":"2006","is_correct":true},{"text":"2009","is_correct":false},{"text":"2013","is_correct":false}]', '"2006"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 1);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien de cas et de décès l''épidémie d''Ebola 2014-2016 en Afrique de l''Ouest a-t-elle causé ?', 'mcq',
'28 616 cas et 11 310 décès en Guinée, Sierra Leone et Liberia — la plus grande épidémie d''Ebola de l''histoire.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"5 000 cas et 2 000 décès","is_correct":false},{"text":"28 616 cas et 11 310 décès","is_correct":true},{"text":"100 000 cas et 50 000 décès","is_correct":false},{"text":"15 000 cas et 7 000 décès","is_correct":false}]', '"28 616 cas et 11 310 décès"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 2);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel est le seuil de couverture vaccinale canine nécessaire pour interrompre la transmission de la rage ?', 'mcq',
'Une couverture vaccinale de 70 % de la population canine est nécessaire pour interrompre le cycle de transmission de la rage.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"30 %","is_correct":false},{"text":"50 %","is_correct":false},{"text":"70 %","is_correct":true},{"text":"90 %","is_correct":false}]', '"70 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 3);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('La stratégie mondiale d''éradication de la PPR (PPR-GCES) vise l''éradication d''ici quelle année ?', 'mcq',
'Lancée en 2015 par la FAO et l''OMSA, la PPR-GCES vise l''éradication mondiale de la PPR d''ici 2030.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"2025","is_correct":false},{"text":"2030","is_correct":true},{"text":"2035","is_correct":false},{"text":"2050","is_correct":false}]', '"2030"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 4);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle résolution historique du Conseil de sécurité de l''ONU a qualifié Ebola de menace à la paix et à la sécurité internationales ?', 'mcq',
'La résolution 2177 de septembre 2014 a qualifié Ebola de menace à la paix et à la sécurité internationales — une première pour une maladie.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"Résolution 1540","is_correct":false},{"text":"Résolution 2177","is_correct":true},{"text":"Résolution 2286","is_correct":false},{"text":"Résolution 2532","is_correct":false}]', '"Résolution 2177"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 5);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel programme de l''Africa CDC a permis de passer de 2 à 750 laboratoires de diagnostic COVID-19 en Afrique en un an ?', 'mcq',
'Le programme PACT (Partnership to Accelerate COVID-19 Testing) a réalisé cette transformation remarquable.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"AFTCOR","is_correct":false},{"text":"PACT","is_correct":true},{"text":"AVAT","is_correct":false},{"text":"AIRA","is_correct":false}]', '"PACT"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 6);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('En décembre 2021, quel pourcentage des Africains avait reçu au moins une dose de vaccin COVID-19 ?', 'mcq',
'Seulement 8,5 % des Africains avaient reçu au moins une dose fin 2021, contre 65 % en Europe, illustrant les inégalités d''accès.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"2 %","is_correct":false},{"text":"8,5 %","is_correct":true},{"text":"25 %","is_correct":false},{"text":"40 %","is_correct":false}]', '"8,5 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 7);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel réseau a été créé en Afrique de l''Ouest en réponse directe à la crise du H5N1 pour renforcer les capacités de laboratoire ?', 'mcq',
'Le réseau RESOLAB (réseau de laboratoires pour la grippe aviaire) a été créé en réponse directe à la crise H5N1 de 2006.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"AFROHUN","is_correct":false},{"text":"RESOLAB","is_correct":true},{"text":"EARLN","is_correct":false},{"text":"GLASS","is_correct":false}]', '"RESOLAB"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 8);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien coûte la vaccination d''un chien contre la rage selon l''exemple du projet Serengeti en Tanzanie ?', 'mcq',
'Le projet Serengeti a démontré qu''il est possible de vacciner un chien pour seulement 1,50 USD, rendant l''élimination de la rage économiquement viable.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"0,10 USD","is_correct":false},{"text":"1,50 USD","is_correct":true},{"text":"10 USD","is_correct":false},{"text":"25 USD","is_correct":false}]', '"1,50 USD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 9);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('L''objectif de l''Union Africaine en matière de souveraineté vaccinale post-COVID est de produire localement 60 % des vaccins d''ici quelle année ?', 'mcq',
'L''objectif fixé par le NPHO de l''Africa CDC est de 60 % de production locale de vaccins d''ici 2040.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"2030","is_correct":false},{"text":"2035","is_correct":false},{"text":"2040","is_correct":true},{"text":"2050","is_correct":false}]', '"2040"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz5_id, @q_id, 10);

UPDATE course_modules SET quiz_id = @quiz5_id WHERE id = @mod5_id;

-- ============================================
-- QUIZ MODULE 6: Leadership et compétences
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Quiz Module 6 : Leadership et compétences du diplomate One Health', 'Quiz Module 6: Leadership and One Health Diplomat Skills',
'Testez vos compétences en négociation, rédaction de politiques, mobilisation de ressources et éthique.', 'graded', 70, 20, 3, TRUE, TRUE, TRUE, @course_id, @mod6_id, 'published', TRUE, 1);
SET @quiz6_id = LAST_INSERT_ID();

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel ouvrage de référence a formalisé le modèle de négociation raisonnée (interest-based negotiation) ?', 'mcq',
'« Getting to Yes » (1981) de Fisher et Ury à Harvard est l''ouvrage fondateur de la négociation raisonnée.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"The Art of War (Sun Tzu)","is_correct":false},{"text":"Getting to Yes (Fisher & Ury)","is_correct":true},{"text":"The Prince (Machiavel)","is_correct":false},{"text":"Diplomacy (Kissinger)","is_correct":false}]', '"Getting to Yes (Fisher & Ury)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 1);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle est la structure type d''un policy brief ?', 'mcq',
'Un policy brief suit la structure : Contexte → Problème → Analyse de l''évidence → Options politiques → Recommandations.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Introduction → Méthodologie → Résultats → Discussion → Conclusion","is_correct":false},{"text":"Contexte → Problème → Analyse → Options politiques → Recommandations","is_correct":true},{"text":"Préambule → Dispositif → Annexes","is_correct":false},{"text":"Résumé → Corps → Bibliographie","is_correct":false}]',
'"Contexte → Problème → Analyse → Options politiques → Recommandations"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 2);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Dans le langage diplomatique, lequel de ces termes exprime l''engagement le plus contraignant ?', 'mcq',
'« Décide » est le terme le plus contraignant dans les résolutions. « Note » est neutre, « invite » est non contraignant, « exhorte » est une recommandation forte.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Note","is_correct":false},{"text":"Invite","is_correct":false},{"text":"Exhorte","is_correct":false},{"text":"Décide","is_correct":true}]', '"Décide"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 3);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le Pandemic Fund, créé en 2022, est doté de combien ?', 'mcq',
'Le Pandemic Fund, hébergé par la Banque mondiale, est doté de 1,6 milliard USD pour la préparation aux pandémies.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"500 millions USD","is_correct":false},{"text":"1,6 milliard USD","is_correct":true},{"text":"5 milliards USD","is_correct":false},{"text":"10 milliards USD","is_correct":false}]', '"1,6 milliard USD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 4);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel pourcentage des délégués aux sessions de l''OMSA sont des femmes ?', 'mcq',
'Seulement 14 % des délégués aux sessions de l''OMSA sont des femmes, illustrant les inégalités de genre en diplomatie sanitaire.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"5 %","is_correct":false},{"text":"14 %","is_correct":true},{"text":"30 %","is_correct":false},{"text":"45 %","is_correct":false}]', '"14 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 5);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel protocole international de 2010 établit le cadre juridique pour le partage équitable des avantages découlant de l''utilisation des ressources génétiques ?', 'mcq',
'Le Protocole de Nagoya (2010) établit le cadre juridique pour le partage juste et équitable des avantages — applicable aux pathogènes.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"Le Protocole de Kyoto","is_correct":false},{"text":"Le Protocole de Montréal","is_correct":false},{"text":"Le Protocole de Nagoya","is_correct":true},{"text":"Le Protocole de Cartagena","is_correct":false}]', '"Le Protocole de Nagoya"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 6);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel réseau de formation forme les épidémiologistes de terrain en Afrique via des programmes de 2 ans ?', 'mcq',
'Les FELTP (Field Epidemiology and Laboratory Training Programs) forment les épidémiologistes de terrain dans 20+ pays africains.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"AFROHUN","is_correct":false},{"text":"FELTP","is_correct":true},{"text":"OHCEA","is_correct":false},{"text":"GISMA","is_correct":false}]', '"FELTP"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 7);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Selon les principes de la négociation raisonnée, le négociateur doit se concentrer sur :', 'mcq',
'Le modèle de Fisher et Ury insiste sur la concentration sur les intérêts (le « pourquoi ») plutôt que sur les positions (le « quoi »).', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"Les positions officielles des parties","is_correct":false},{"text":"Les intérêts sous-jacents des parties","is_correct":true},{"text":"Les rapports de force entre parties","is_correct":false},{"text":"Les précédents juridiques","is_correct":false}]', '"Les intérêts sous-jacents des parties"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 8);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel principe éthique implique de ne pas causer de tort, par exemple en évitant des embargos commerciaux disproportionnés ?', 'mcq',
'Le principe de non-malfaisance (« ne pas nuire ») s''applique quand des mesures sanitaires disproportionnées nuisent aux populations dépendantes de l''élevage.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Bienfaisance","is_correct":false},{"text":"Non-malfaisance","is_correct":true},{"text":"Justice","is_correct":false},{"text":"Autonomie","is_correct":false}]', '"Non-malfaisance"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 9);

INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('La coopération Sud-Sud en santé One Health inclut le partenariat entre le Brésil et l''Afrique. Quelle institution brésilienne est impliquée dans le transfert de technologies ?', 'mcq',
'EMBRAPA (Empresa Brasileira de Pesquisa Agropecuária) transfère des technologies de surveillance de la FA et de production de vaccins vers l''Afrique.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"FIOCRUZ","is_correct":false},{"text":"EMBRAPA","is_correct":true},{"text":"ANVISA","is_correct":false},{"text":"CAPES","is_correct":false}]', '"EMBRAPA"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@quiz6_id, @q_id, 10);

UPDATE course_modules SET quiz_id = @quiz6_id WHERE id = @mod6_id;

-- ============================================
-- EXAMEN FINAL: 20 questions couvrant tous les modules
-- ============================================
INSERT INTO quizzes (title_fr, title_en, description_fr, quiz_type, passing_score, time_limit_minutes, max_attempts, shuffle_questions, show_correct_answers, show_explanation, course_id, module_id, status, is_active, created_by)
VALUES ('Examen final : Diplomatie One Health en contexte africain', 'Final Exam: One Health Diplomacy in African Context',
'Examen récapitulatif couvrant l''ensemble des 6 modules du cours. 20 questions, 70 % requis pour réussir.', 'final_exam', 70, 45, 2, TRUE, TRUE, TRUE, @course_id, NULL, 'published', TRUE, 1);
SET @final_quiz_id = LAST_INSERT_ID();

-- FQ1 (Module 1)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Calvin Schwabe a formalisé le concept de « One Medicine » dans quel ouvrage ?', 'mcq',
'Calvin Schwabe a publié « Veterinary Medicine and Human Health » (3e édition, 1984) qui formalise le concept de One Medicine.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"The Origin of Species","is_correct":false},{"text":"Veterinary Medicine and Human Health","is_correct":true},{"text":"One Health: The Human-Animal-Environment Interfaces","is_correct":false},{"text":"Principles of Epidemiology","is_correct":false}]',
'"Veterinary Medicine and Human Health"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 1);

-- FQ2 (Module 1)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel est le coût estimé du One Health Joint Plan of Action (2022-2026) ?', 'mcq',
'Le OH JPA représente un investissement estimé à 861 millions USD sur cinq ans.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"100 millions USD","is_correct":false},{"text":"500 millions USD","is_correct":false},{"text":"861 millions USD","is_correct":true},{"text":"2 milliards USD","is_correct":false}]', '"861 millions USD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 2);

-- FQ3 (Module 1)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('L''Afrique supporte 25 % de la charge mondiale de morbidité avec quel pourcentage des professionnels de santé mondiaux ?', 'mcq',
'L''Afrique porte 25 % de la charge mondiale avec seulement 3 % des professionnels de santé et moins de 1 % des dépenses mondiales de santé.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"1 %","is_correct":false},{"text":"3 %","is_correct":true},{"text":"10 %","is_correct":false},{"text":"15 %","is_correct":false}]', '"3 %"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 3);

-- FQ4 (Module 2)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle maladie animale a été éradiquée à l''échelle mondiale en 2011, fournissant un précédent pour l''éradication de la PPR ?', 'mcq',
'La peste bovine a été déclarée éradiquée en 2011, seule maladie animale jamais éradiquée. Elle sert de modèle pour l''éradication de la PPR.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"La variole bovine","is_correct":false},{"text":"La peste bovine","is_correct":true},{"text":"La fièvre aphteuse","is_correct":false},{"text":"La rage canine","is_correct":false}]', '"La peste bovine"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 4);

-- FQ5 (Module 2)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Les pertes économiques dues à la trypanosomiase animale en Afrique sont estimées à :', 'mcq',
'La trypanosomiase animale (nagana) cause des pertes de 4,5 milliards USD/an et rend 10 millions de km² impropres à l''élevage bovin.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"500 millions USD/an","is_correct":false},{"text":"2,1 milliards USD/an","is_correct":false},{"text":"4,5 milliards USD/an","is_correct":true},{"text":"10 milliards USD/an","is_correct":false}]', '"4,5 milliards USD/an"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 5);

-- FQ6 (Module 2)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel système d''alerte précoce utilise l''imagerie satellite pour prédire les zones à risque de Fièvre de la Vallée du Rift ?', 'mcq',
'Le système d''alerte précoce FAO/NASA utilise les indices de végétation satellite (NDVI) pour prédire les zones à risque de FVR 2-4 mois à l''avance.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"WAHIS de l''OMSA","is_correct":false},{"text":"Le système FAO/NASA basé sur les indices NDVI","is_correct":true},{"text":"ARIS de l''AU-IBAR","is_correct":false},{"text":"DHIS2 de l''OMS","is_correct":false}]', '"Le système FAO/NASA basé sur les indices NDVI"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 6);

-- FQ7 (Module 3)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Combien d''États Parties sont liés par le Règlement Sanitaire International ?', 'mcq',
'Le RSI lie 196 États Parties, dont les 54 pays africains. C''est le seul instrument juridique international contraignant en matière de sécurité sanitaire.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"154","is_correct":false},{"text":"183","is_correct":false},{"text":"194","is_correct":false},{"text":"196","is_correct":true}]', '"196"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 7);

-- FQ8 (Module 3)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quels sont les seuls pays africains ayant des zones reconnues indemnes de fièvre aphteuse sans vaccination, permettant l''export vers l''UE ?', 'mcq',
'Seuls le Botswana, la Namibie et l''Eswatini ont des zones reconnues indemnes de FA sans vaccination.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"Afrique du Sud, Kenya, Éthiopie","is_correct":false},{"text":"Botswana, Namibie, Eswatini","is_correct":true},{"text":"Maroc, Tunisie, Égypte","is_correct":false},{"text":"Sénégal, Ghana, Nigeria","is_correct":false}]', '"Botswana, Namibie, Eswatini"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 8);

-- FQ9 (Module 3)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le score moyen des pays africains au Joint External Evaluation (JEE) est de :', 'mcq',
'Le score moyen africain au JEE est de 2,1/5, indiquant des capacités « limitées » en matière de RSI.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"1,0/5","is_correct":false},{"text":"2,1/5","is_correct":true},{"text":"3,5/5","is_correct":false},{"text":"4,2/5","is_correct":false}]', '"2,1/5"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 9);

-- FQ10 (Module 4)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel événement a directement conduit à la création de l''Africa CDC ?', 'mcq',
'L''épidémie d''Ebola en Afrique de l''Ouest (2014-2016) a exposé les lacunes de la coordination sanitaire continentale et directement conduit à la création de l''Africa CDC en 2017.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"La pandémie de grippe H1N1 (2009)","is_correct":false},{"text":"L''épidémie d''Ebola en Afrique de l''Ouest (2014-2016)","is_correct":true},{"text":"La pandémie de COVID-19 (2020)","is_correct":false},{"text":"L''éradication de la peste bovine (2011)","is_correct":false}]',
'"L''épidémie d''Ebola en Afrique de l''Ouest (2014-2016)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 10);

-- FQ11 (Module 4)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel est le siège du PNUE, unique agence onusienne basée en Afrique ?', 'mcq',
'Le PNUE est la seule agence onusienne dont le siège est en Afrique, à Nairobi, Kenya.', 'easy', 1, @course_id, TRUE, 1,
'[{"text":"Addis-Abeba, Éthiopie","is_correct":false},{"text":"Le Caire, Égypte","is_correct":false},{"text":"Nairobi, Kenya","is_correct":true},{"text":"Dakar, Sénégal","is_correct":false}]', '"Nairobi, Kenya"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 11);

-- FQ12 (Module 4)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('L''IGAD dispose d''un centre spécialisé en résilience pastorale. Comment s''appelle-t-il ?', 'mcq',
'L''ICPALD (IGAD Centre for Pastoral Areas and Livestock Development), basé à Nairobi, est spécialisé dans la résilience pastorale.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"OCEAC","is_correct":false},{"text":"OOAS","is_correct":false},{"text":"ICPALD","is_correct":true},{"text":"EAHRC","is_correct":false}]', '"ICPALD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 12);

-- FQ13 (Module 5)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quelle mission onusienne, première du genre, a été créée en réponse à l''épidémie d''Ebola en 2014 ?', 'mcq',
'L''UNMEER (Mission des Nations Unies pour la réponse d''urgence à Ebola) a été la première mission onusienne dédiée à une urgence sanitaire.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"MONUSCO","is_correct":false},{"text":"UNMEER","is_correct":true},{"text":"MINUSMA","is_correct":false},{"text":"UNOCI","is_correct":false}]', '"UNMEER"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 13);

-- FQ14 (Module 5)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel vaccin contre Ebola, développé en temps record, a été déployé pour la première fois à grande échelle lors de l''épidémie de RDC 2018-2020 ?', 'mcq',
'Le vaccin rVSV-ZEBOV (Ervebo) a été le premier vaccin Ebola déployé à grande échelle, avec 303 000 personnes vaccinées en RDC.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"AstraZeneca-Ebola","is_correct":false},{"text":"rVSV-ZEBOV (Ervebo)","is_correct":true},{"text":"Pfizer-BioNTech-Ebola","is_correct":false},{"text":"Johnson & Johnson-Ebola","is_correct":false}]', '"rVSV-ZEBOV (Ervebo)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 14);

-- FQ15 (Module 5)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Le vaccin PPR est particulièrement adapté à l''Afrique car :', 'mcq',
'Le vaccin PPR est thermostable, coûte 0,10-0,30 USD/dose et confère une immunité à vie en une seule injection — idéal pour les contextes africains.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Il nécessite 3 injections annuelles","is_correct":false},{"text":"Il est thermostable, peu coûteux et confère une immunité à vie en une seule dose","is_correct":true},{"text":"Il est produit exclusivement en Afrique","is_correct":false},{"text":"Il protège simultanément contre 5 maladies","is_correct":false}]',
'"Il est thermostable, peu coûteux et confère une immunité à vie en une seule dose"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 15);

-- FQ16 (Module 5)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel laboratoire sud-africain a identifié les variants Beta et Omicron du SARS-CoV-2 ?', 'mcq',
'Le Network for Genomics Surveillance in South Africa (NGS-SA) a identifié les variants Beta et Omicron grâce à ses capacités de séquençage génomique.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"NICD Johannesburg","is_correct":false},{"text":"NGS-SA (Network for Genomics Surveillance in South Africa)","is_correct":true},{"text":"Institut Pasteur de Dakar","is_correct":false},{"text":"INRB Kinshasa","is_correct":false}]', '"NGS-SA (Network for Genomics Surveillance in South Africa)"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 16);

-- FQ17 (Module 6)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('L''extractivisme scientifique en Afrique fait référence à :', 'mcq',
'L''extractivisme scientifique désigne la collecte de données et d''échantillons biologiques en Afrique pour des publications et des brevets dans les pays du Nord, sans bénéfice pour les communautés sources.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"L''exploitation minière dans les réserves naturelles","is_correct":false},{"text":"La collecte de données et d''échantillons en Afrique pour des bénéfices dans les pays du Nord sans retour","is_correct":true},{"text":"L''extraction de ressources pétrolières dans les zones protégées","is_correct":false},{"text":"Le recrutement de scientifiques africains par les universités occidentales","is_correct":false}]',
'"La collecte de données et d''échantillons en Afrique pour des bénéfices dans les pays du Nord sans retour"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 17);

-- FQ18 (Module 6)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('Quel hub africain de transfert de technologie ARNm développe un vaccin COVID-19 africain sous l''égide de l''OMS ?', 'mcq',
'Afrigen Biologics à Cape Town est le hub de transfert de technologie ARNm de l''OMS, développant un vaccin ARNm COVID-19 africain.', 'hard', 1, @course_id, TRUE, 1,
'[{"text":"Aspen Pharmacare","is_correct":false},{"text":"Afrigen Biologics","is_correct":true},{"text":"Institut Pasteur de Dakar","is_correct":false},{"text":"Biovac Institute","is_correct":false}]', '"Afrigen Biologics"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 18);

-- FQ19 (Module 6)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('En négociation multilatérale, la technique du « single undertaking » signifie :', 'mcq',
'Le single undertaking signifie que rien n''est convenu tant que tout n''est pas convenu — tous les éléments du paquet sont liés.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"Chaque pays négocie seul sans coalition","is_correct":false},{"text":"Un seul sujet est discuté par session","is_correct":false},{"text":"Rien n''est convenu tant que tout n''est pas convenu","is_correct":true},{"text":"Seul le président peut proposer des textes","is_correct":false}]',
'"Rien n''est convenu tant que tout n''est pas convenu"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 19);

-- FQ20 (Module 6)
INSERT INTO questions (question_text_fr, question_type, explanation_fr, difficulty, points, course_id, is_active, created_by, options, correct_answer)
VALUES ('La dépense totale de santé per capita en Afrique subsaharienne est d''environ 98 USD. Quel est le chiffre équivalent dans les pays de l''OCDE ?', 'mcq',
'La dépense de santé per capita est de 98 USD en ASS contre 4 921 USD dans les pays de l''OCDE, soit un ratio de 1:50.', 'medium', 1, @course_id, TRUE, 1,
'[{"text":"500 USD","is_correct":false},{"text":"1 500 USD","is_correct":false},{"text":"4 921 USD","is_correct":true},{"text":"8 000 USD","is_correct":false}]', '"4 921 USD"');
SET @q_id = LAST_INSERT_ID();
INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES (@final_quiz_id, @q_id, 20);

-- Link final exam to course
UPDATE courses SET final_quiz_id = @final_quiz_id WHERE id = @course_id;

-- ============================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Migration 050_seed_diplomatie_onehealth_course completed successfully' AS status;
SELECT CONCAT('Course ID: ', @course_id) AS course_info;
SELECT CONCAT('Modules: 6, Lessons: 30, Quizzes: 7 (6 module + 1 final), Questions: 80') AS content_info;
