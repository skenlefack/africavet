/**
 * Seed Analytics Data
 * Inserts 90 days of realistic page visit data for testing the analytics dashboard.
 *
 * Usage: node backend/scripts/seed-analytics.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const db = require('../config/db');

// Weighted random pick
const weightedPick = (items) => {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
};

// Countries with realistic weights (African countries dominant for AfricaVet)
const countriesData = [
  // Africa - 65% of traffic
  { code: 'CM', name: 'Cameroun', continent: 'Afrique', weight: 18 },
  { code: 'SN', name: 'Senegal', continent: 'Afrique', weight: 12 },
  { code: 'CI', name: "Cote d'Ivoire", continent: 'Afrique', weight: 10 },
  { code: 'BF', name: 'Burkina Faso', continent: 'Afrique', weight: 6 },
  { code: 'ML', name: 'Mali', continent: 'Afrique', weight: 5 },
  { code: 'NE', name: 'Niger', continent: 'Afrique', weight: 4 },
  { code: 'TD', name: 'Tchad', continent: 'Afrique', weight: 3 },
  { code: 'GA', name: 'Gabon', continent: 'Afrique', weight: 3 },
  { code: 'CG', name: 'Congo', continent: 'Afrique', weight: 2 },
  { code: 'CD', name: 'RD Congo', continent: 'Afrique', weight: 4 },
  { code: 'MG', name: 'Madagascar', continent: 'Afrique', weight: 3 },
  { code: 'TN', name: 'Tunisie', continent: 'Afrique', weight: 3 },
  { code: 'MA', name: 'Maroc', continent: 'Afrique', weight: 4 },
  { code: 'DZ', name: 'Algerie', continent: 'Afrique', weight: 2 },
  { code: 'NG', name: 'Nigeria', continent: 'Afrique', weight: 3 },
  { code: 'GH', name: 'Ghana', continent: 'Afrique', weight: 2 },
  { code: 'TG', name: 'Togo', continent: 'Afrique', weight: 3 },
  { code: 'BJ', name: 'Benin', continent: 'Afrique', weight: 3 },
  { code: 'GN', name: 'Guinee', continent: 'Afrique', weight: 2 },
  { code: 'KE', name: 'Kenya', continent: 'Afrique', weight: 2 },
  { code: 'ET', name: 'Ethiopie', continent: 'Afrique', weight: 1 },
  { code: 'ZA', name: 'Afrique du Sud', continent: 'Afrique', weight: 1 },
  { code: 'RW', name: 'Rwanda', continent: 'Afrique', weight: 1 },
  // Europe - 20% of traffic
  { code: 'FR', name: 'France', continent: 'Europe', weight: 12 },
  { code: 'BE', name: 'Belgique', continent: 'Europe', weight: 4 },
  { code: 'CH', name: 'Suisse', continent: 'Europe', weight: 2 },
  { code: 'DE', name: 'Allemagne', continent: 'Europe', weight: 1 },
  { code: 'GB', name: 'Royaume-Uni', continent: 'Europe', weight: 1 },
  { code: 'ES', name: 'Espagne', continent: 'Europe', weight: 1 },
  // Americas - 8%
  { code: 'US', name: 'Etats-Unis', continent: 'Ameriques', weight: 4 },
  { code: 'CA', name: 'Canada', continent: 'Ameriques', weight: 3 },
  { code: 'BR', name: 'Bresil', continent: 'Ameriques', weight: 1 },
  // Asia - 5%
  { code: 'CN', name: 'Chine', continent: 'Asie', weight: 1 },
  { code: 'IN', name: 'Inde', continent: 'Asie', weight: 1 },
  { code: 'TR', name: 'Turquie', continent: 'Asie', weight: 1 },
  // Oceania - 2%
  { code: 'AU', name: 'Australie', continent: 'Oceanie', weight: 1 },
];

// Browsers
const browsersData = [
  { browser: 'Chrome', version: '120.0', weight: 45 },
  { browser: 'Firefox', version: '121.0', weight: 15 },
  { browser: 'Safari', version: '17.2', weight: 12 },
  { browser: 'Edge', version: '120.0', weight: 10 },
  { browser: 'Samsung Internet', version: '23.0', weight: 8 },
  { browser: 'Opera', version: '105.0', weight: 5 },
  { browser: 'UC Browser', version: '15.0', weight: 3 },
  { browser: 'Other', version: '', weight: 2 },
];

// Devices
const devicesData = [
  { type: 'mobile', weight: 55 },
  { type: 'desktop', weight: 38 },
  { type: 'tablet', weight: 7 },
];

// OS
const osData = [
  { os: 'Android', weight: 45 },
  { os: 'Windows 10+', weight: 25 },
  { os: 'iOS', weight: 12 },
  { os: 'macOS', weight: 8 },
  { os: 'Linux', weight: 5 },
  { os: 'Chrome OS', weight: 3 },
  { os: 'Other', weight: 2 },
];

// Pages
const pagesData = [
  { url: '/', title: 'Accueil - AfricaVet', type: 'home', weight: 20 },
  { url: '/articles/sante-animale-afrique', title: 'Sante animale en Afrique', type: 'article', weight: 8 },
  { url: '/articles/vaccination-bovine', title: 'Vaccination bovine - Guide complet', type: 'article', weight: 7 },
  { url: '/articles/maladies-aviaires', title: 'Maladies aviaires courantes', type: 'article', weight: 6 },
  { url: '/articles/elevage-durable', title: "L'elevage durable en Afrique de l'Ouest", type: 'article', weight: 5 },
  { url: '/articles/parasitologie-tropicale', title: 'Parasitologie tropicale veterinaire', type: 'article', weight: 5 },
  { url: '/articles/securite-alimentaire', title: 'Securite alimentaire et veterinaire', type: 'article', weight: 4 },
  { url: '/articles/zoonoses-emergentes', title: 'Zoonoses emergentes en Afrique', type: 'article', weight: 4 },
  { url: '/articles/aquaculture-afrique', title: 'Aquaculture en Afrique', type: 'article', weight: 3 },
  { url: '/elearning', title: 'E-Learning - Formation continue', type: 'elearning', weight: 8 },
  { url: '/elearning/cours/introduction-epidemiologie', title: 'Cours: Introduction a l\'epidemiologie', type: 'elearning', weight: 4 },
  { url: '/elearning/cours/gestion-troupeaux', title: 'Cours: Gestion des troupeaux', type: 'elearning', weight: 3 },
  { url: '/annuaire', title: 'Annuaire panafricain veterinaire', type: 'annuaire', weight: 6 },
  { url: '/annuaire/cliniques', title: 'Annuaire - Cliniques', type: 'annuaire', weight: 3 },
  { url: '/categories/sante-animale', title: 'Categorie: Sante animale', type: 'category', weight: 4 },
  { url: '/categories/elevage', title: 'Categorie: Elevage', type: 'category', weight: 3 },
  { url: '/a-propos', title: 'A propos d\'AfricaVet', type: 'page', weight: 3 },
  { url: '/contact', title: 'Contact', type: 'page', weight: 2 },
  { url: '/newsletter', title: 'Newsletter', type: 'page', weight: 2 },
];

// Referrers
const referrers = [
  { url: null, domain: null, weight: 35 },
  { url: 'https://www.google.com/search?q=veterinaire+afrique', domain: 'google.com', weight: 25 },
  { url: 'https://www.google.fr/search?q=sante+animale', domain: 'google.fr', weight: 10 },
  { url: 'https://www.facebook.com/', domain: 'facebook.com', weight: 10 },
  { url: 'https://t.co/abc123', domain: 't.co', weight: 5 },
  { url: 'https://www.linkedin.com/feed', domain: 'linkedin.com', weight: 5 },
  { url: 'https://wa.me/', domain: 'wa.me', weight: 5 },
  { url: 'https://www.bing.com/search?q=africavet', domain: 'bing.com', weight: 3 },
  { url: 'https://scholar.google.com/', domain: 'scholar.google.com', weight: 2 },
];

// Hourly traffic distribution (peaks at 10h, 14h, 20h)
const hourlyWeights = [
  1, 0.5, 0.3, 0.2, 0.2, 0.5, 1, 2, 4, 6, 8, 7,
  5, 4, 7, 6, 5, 4, 5, 7, 8, 6, 4, 2
];

const randomHash = () => {
  const chars = 'abcdef0123456789';
  let h = '';
  for (let i = 0; i < 16; i++) h += chars[Math.floor(Math.random() * chars.length)];
  return h;
};

async function seed() {
  console.log('Starting analytics data seed...');

  // Clear existing data
  await db.query('DELETE FROM page_visits');
  await db.query('DELETE FROM page_visits_daily');
  console.log('Cleared existing analytics data.');

  const now = new Date();
  const DAYS = 90;
  const BATCH_SIZE = 500;
  let totalInserted = 0;

  for (let dayOffset = DAYS; dayOffset >= 0; dayOffset--) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().slice(0, 10);

    // Daily visit count: 80-300 with weekend dip and growth trend
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const growthFactor = 1 + (DAYS - dayOffset) / DAYS * 0.5; // 50% growth over 90 days
    const baseVisits = Math.floor((isWeekend ? 60 : 120) + Math.random() * 180);
    const dayVisits = Math.floor(baseVisits * growthFactor);

    const rows = [];
    const visitorSet = new Set();
    let bounceCount = 0;
    let desktopCount = 0, mobileCount = 0, tabletCount = 0;

    for (let v = 0; v < dayVisits; v++) {
      const country = weightedPick(countriesData);
      const browser = weightedPick(browsersData);
      const device = weightedPick(devicesData);
      const os = weightedPick(osData);
      const page = weightedPick(pagesData);
      const referrer = weightedPick(referrers);

      // Pick hour based on weights
      const hourTotal = hourlyWeights.reduce((a, b) => a + b, 0);
      let hourR = Math.random() * hourTotal;
      let hour = 0;
      for (let h = 0; h < 24; h++) {
        hourR -= hourlyWeights[h];
        if (hourR <= 0) { hour = h; break; }
      }

      const minute = Math.floor(Math.random() * 60);
      const second = Math.floor(Math.random() * 60);
      const createdAt = `${dateStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

      const visitorId = randomHash();
      const sessionId = randomHash();
      const ipHash = randomHash();
      const isBounce = Math.random() < 0.45 ? 1 : 0;

      visitorSet.add(visitorId);
      if (isBounce) bounceCount++;
      if (device.type === 'desktop') desktopCount++;
      else if (device.type === 'mobile') mobileCount++;
      else tabletCount++;

      rows.push([
        visitorId, sessionId, ipHash,
        page.url, page.title, page.type,
        referrer.url, referrer.domain,
        `Mozilla/5.0 (${device.type === 'mobile' ? 'Linux; Android 13' : device.type === 'tablet' ? 'iPad; CPU OS 17_0' : 'Windows NT 10.0; Win64; x64'}) ${browser.browser}/${browser.version}`,
        device.type, browser.browser, browser.version, os.os,
        country.code, country.name, country.continent,
        isBounce, createdAt
      ]);
    }

    // Batch insert visits
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const placeholders = batch.map(() => '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
      const values = batch.flat();
      await db.query(
        `INSERT INTO page_visits
         (visitor_id, session_id, ip_hash, page_url, page_title, page_type, referrer_url, referrer_domain, user_agent, device_type, browser, browser_version, os, country_code, country_name, continent, is_bounce, created_at)
         VALUES ${placeholders}`,
        values
      );
    }

    // Insert daily aggregation
    await db.query(
      `INSERT INTO page_visits_daily (date, total_visits, unique_visitors, page_views, bounce_count, desktop_visits, mobile_visits, tablet_visits)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [dateStr, dayVisits, visitorSet.size, dayVisits, bounceCount, desktopCount, mobileCount, tabletCount]
    );

    totalInserted += dayVisits;
    if (dayOffset % 10 === 0) {
      console.log(`  Day ${dateStr}: ${dayVisits} visits (total so far: ${totalInserted})`);
    }
  }

  console.log(`\nSeed complete! Inserted ${totalInserted} visits over ${DAYS + 1} days.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
