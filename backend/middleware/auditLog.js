/**
 * Audit Log Middleware
 * Logs user actions with IP, user agent, and change details.
 */

const db = require('../config/db');

/**
 * Log an action to activity_log
 * @param {object} params
 * @param {number} params.userId - Who performed the action
 * @param {string} params.action - create, update, delete, approve, reject, login, etc.
 * @param {string} params.entityType - post, opportunity, category, user, media, etc.
 * @param {number} params.entityId - ID of the affected entity
 * @param {object} [params.details] - Additional context
 * @param {object} [params.oldValues] - Previous values (for updates)
 * @param {object} [params.newValues] - New values (for updates)
 * @param {string} [params.ipAddress] - Client IP
 * @param {string} [params.userAgent] - Client user agent
 */
async function logAction({ userId, action, entityType, entityId, details, oldValues, newValues, ipAddress, userAgent }) {
  try {
    await db.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, details, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        action,
        entityType || null,
        entityId || null,
        details ? JSON.stringify(details) : null,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        ipAddress || null,
        userAgent || null,
      ]
    );
  } catch (error) {
    // Don't let audit logging failures break the main request
    console.error('Audit log error:', error.message);
  }
}

/**
 * Extract client IP from request (handles proxies)
 */
function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.ip
    || null;
}

/**
 * Helper to create audit log entry from request context
 */
function auditFromReq(req, action, entityType, entityId, extra = {}) {
  return logAction({
    userId: req.user?.id,
    action,
    entityType,
    entityId,
    details: extra.details || null,
    oldValues: extra.oldValues || null,
    newValues: extra.newValues || null,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent'] || null,
  });
}

module.exports = { logAction, auditFromReq, getClientIp };
