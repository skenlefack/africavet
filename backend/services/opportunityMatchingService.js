const db = require('../config/db');
const { createNotification, getUserNotificationPrefs, sendOpportunityMatchEmail } = require('./notificationService');

/**
 * Opportunity Matching Service
 * Matches new/approved opportunities with user profiles and sends notifications
 */

/**
 * Calculate a match score between an opportunity and a user profile
 * @param {Object} opportunity - The opportunity record
 * @param {Object} user - The user record (with profession, specialization, skills, country, education_level)
 * @returns {number} Score from 0 to 100
 */
const calculateMatchScore = (opportunity, user) => {
  let score = 0;

  // --- Country match: +30 pts ---
  if (user.country && opportunity.country) {
    if (user.country.toLowerCase().trim() === opportunity.country.toLowerCase().trim()) {
      score += 30;
    }
  }

  // --- Skills match: +30 pts (proportional) ---
  let userSkills = [];
  if (user.skills) {
    try {
      userSkills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills;
    } catch (e) {
      userSkills = [];
    }
  }

  if (userSkills.length > 0) {
    // Build a searchable text from the opportunity
    const oppText = [
      opportunity.title_fr, opportunity.title_en,
      opportunity.description_fr, opportunity.description_en,
      opportunity.skills_required,
      opportunity.experience_required,
      opportunity.education_required,
      opportunity.eligibility_criteria
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    let matchedSkills = 0;
    for (const skill of userSkills) {
      if (skill && oppText.includes(skill.toLowerCase().trim())) {
        matchedSkills++;
      }
    }

    if (userSkills.length > 0) {
      score += Math.round((matchedSkills / userSkills.length) * 30);
    }
  }

  // --- Education match: +20 pts ---
  if (user.education_level && opportunity.education_required) {
    const educationHierarchy = {
      'secondary': 1,
      'certificate': 2,
      'diploma': 3,
      'bachelors': 4,
      'licence': 4,
      'masters': 5,
      'maitrise': 5,
      'doctorate': 6,
      'phd': 6,
      'doctorat': 6,
      'dvm': 5,
      'veterinaire': 5
    };

    const userLevel = educationHierarchy[user.education_level.toLowerCase().trim()] || 0;
    const oppRequirement = opportunity.education_required.toLowerCase().trim();

    // Check if user's education level meets or exceeds the requirement
    let requiredLevel = 0;
    for (const [key, value] of Object.entries(educationHierarchy)) {
      if (oppRequirement.includes(key)) {
        requiredLevel = Math.max(requiredLevel, value);
      }
    }

    if (requiredLevel > 0 && userLevel >= requiredLevel) {
      score += 20;
    } else if (requiredLevel === 0) {
      // If we can't parse the requirement, give partial credit for having education info
      score += 10;
    }
  }

  // --- Profession match: +20 pts ---
  if (user.profession) {
    const userProfession = user.profession.toLowerCase().trim();
    const userSpecialization = (user.specialization || '').toLowerCase().trim();

    // Build searchable text from opportunity type and content
    const oppTypeText = [
      opportunity.opportunity_type,
      opportunity.title_fr, opportunity.title_en,
      opportunity.description_fr, opportunity.description_en,
      opportunity.market_category,
      opportunity.job_type
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Direct profession mention in opportunity
    if (oppTypeText.includes(userProfession)) {
      score += 20;
    } else if (userSpecialization && oppTypeText.includes(userSpecialization)) {
      score += 15;
    } else {
      // Veterinary profession keywords matching
      const vetKeywords = ['veterinaire', 'veterinary', 'vet', 'animal', 'livestock', 'elevage', 'betail', 'sante animale', 'animal health'];
      const isVetUser = vetKeywords.some(kw => userProfession.includes(kw) || userSpecialization.includes(kw));
      const isVetOpp = vetKeywords.some(kw => oppTypeText.includes(kw));

      if (isVetUser && isVetOpp) {
        score += 15;
      }
    }
  }

  return Math.min(score, 100);
};

/**
 * Find users whose profiles match a given opportunity
 * @param {number} opportunityId - The opportunity ID
 * @param {number} threshold - Minimum match score to include (default: 30)
 * @returns {Array} Array of { user, score } objects sorted by score descending
 */
const findMatchingUsers = async (opportunityId, threshold = 30) => {
  // Get the opportunity
  const [opportunities] = await db.query('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);
  if (opportunities.length === 0) {
    throw new Error(`Opportunity ${opportunityId} not found`);
  }
  const opportunity = opportunities[0];

  // Get users with profiles filled in (at least country or profession set)
  const [users] = await db.query(`
    SELECT id, name, email, profession, specialization, skills, country, city,
           years_experience, education_level, preferred_language, status
    FROM users
    WHERE status = 'active'
      AND (profession IS NOT NULL OR country IS NOT NULL OR skills IS NOT NULL)
  `);

  const matchingUsers = [];

  for (const user of users) {
    const score = calculateMatchScore(opportunity, user);
    if (score >= threshold) {
      matchingUsers.push({ user, score });
    }
  }

  // Sort by score descending
  matchingUsers.sort((a, b) => b.score - a.score);

  return matchingUsers;
};

/**
 * Process opportunity matches: find matching users, send notifications and emails, log matches
 * @param {number} opportunityId - The opportunity ID to process
 * @returns {Object} { matchesFound, notificationsSent, emailsSent }
 */
const processOpportunityMatches = async (opportunityId) => {
  let matchesFound = 0;
  let notificationsSent = 0;
  let emailsSent = 0;

  // Get the opportunity
  const [opportunities] = await db.query('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);
  if (opportunities.length === 0) {
    console.error(`processOpportunityMatches: Opportunity ${opportunityId} not found`);
    return { matchesFound, notificationsSent, emailsSent };
  }
  const opportunity = opportunities[0];

  // Find matching users
  const matches = await findMatchingUsers(opportunityId);
  matchesFound = matches.length;

  for (const { user, score } of matches) {
    try {
      // Get user notification preferences
      const prefs = await getUserNotificationPrefs(user.id);

      // Send in-app notification if enabled
      if (prefs && prefs.inapp_opportunities !== false) {
        await createNotification({
          user_id: user.id,
          type: 'opportunity_match',
          title_fr: `Opportunité correspondante: ${opportunity.title_fr || 'Nouvelle opportunité'}`,
          title_en: `Matching opportunity: ${opportunity.title_en || opportunity.title_fr || 'New opportunity'}`,
          message_fr: `Une nouvelle opportunité correspond à votre profil (${score}% de correspondance). ${opportunity.organization_name ? 'Organisation: ' + opportunity.organization_name : ''}`,
          message_en: `A new opportunity matches your profile (${score}% match). ${opportunity.organization_name ? 'Organization: ' + opportunity.organization_name : ''}`,
          link: `/opportunites/${opportunity.id}`,
          metadata: {
            opportunity_id: opportunity.id,
            match_score: score,
            opportunity_type: opportunity.opportunity_type
          }
        });
        notificationsSent++;
      }

      // Send email notification if enabled
      if (prefs && prefs.email_opportunities !== false) {
        await sendOpportunityMatchEmail(user, opportunity, score);
        emailsSent++;
      }

      // Log match in opportunity_match_log
      await db.query(
        `INSERT INTO opportunity_match_log (opportunity_id, user_id, match_score, notification_sent, email_sent, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          opportunityId,
          user.id,
          score,
          prefs && prefs.inapp_opportunities !== false ? 1 : 0,
          prefs && prefs.email_opportunities !== false ? 1 : 0
        ]
      );
    } catch (err) {
      console.error(`Error processing match for user ${user.id} on opportunity ${opportunityId}:`, err);
    }
  }

  return { matchesFound, notificationsSent, emailsSent };
};

module.exports = {
  calculateMatchScore,
  findMatchingUsers,
  processOpportunityMatches
};
