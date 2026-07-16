/**
 * HTML Sanitization Middleware
 * Cleans WYSIWYG content to prevent XSS attacks while preserving safe formatting.
 */

const sanitizeHtml = require('sanitize-html');

// Configuration matching TinyMCE output: allow formatting, tables, links, images
const SANITIZE_CONFIG = {
  allowedTags: [
    // Structure
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'hr',
    // Formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'ins', 'sub', 'sup', 'mark',
    // Lists
    'ul', 'ol', 'li',
    // Links & media
    'a', 'img', 'figure', 'figcaption', 'iframe',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Block
    'blockquote', 'pre', 'code', 'address',
  ],
  allowedAttributes: {
    '*': ['class', 'style', 'id', 'data-*'],
    'a': ['href', 'target', 'rel', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
    'td': ['colspan', 'rowspan', 'headers'],
    'th': ['colspan', 'rowspan', 'scope'],
    'col': ['span'],
    'table': ['border', 'cellpadding', 'cellspacing'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
  allowProtocolRelative: false,
  // Strip all script, style, and event handler attributes
  disallowedTagsMode: 'discard',
};

/**
 * Sanitize HTML content in a string
 */
function cleanHtml(html) {
  if (!html || typeof html !== 'string') return html;
  return sanitizeHtml(html, SANITIZE_CONFIG);
}

/**
 * Middleware that sanitizes specified body fields
 * @param  {...string} fields - field names containing HTML content
 */
function sanitizeFields(...fields) {
  return (req, res, next) => {
    if (!req.body) return next();
    for (const field of fields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = cleanHtml(req.body[field]);
      }
    }
    next();
  };
}

module.exports = { sanitizeFields, cleanHtml };
