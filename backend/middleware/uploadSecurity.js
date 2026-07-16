/**
 * Upload Security Middleware
 * Validates uploaded files beyond multer's basic checks:
 * - Double extension prevention
 * - Dangerous extension blocking
 * - File size logging
 */

const path = require('path');

// Extensions that must NEVER be uploaded regardless of MIME type
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
  '.ps1', '.psm1', '.psd1', '.ps1xml', '.cpl', '.hta',
  '.inf', '.ins', '.isp', '.lnk', '.reg', '.rgs', '.sct',
  '.sh', '.bash', '.php', '.asp', '.aspx', '.jsp', '.cgi', '.py', '.pl', '.rb',
  '.dll', '.sys', '.drv', '.ocx'
];

// Allowed extensions whitelist per category
const ALLOWED_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  video: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
  audio: ['.mp3', '.wav', '.ogg'],
};

/**
 * Middleware factory to validate file after multer upload
 * @param {string} category - 'image', 'document', 'video', or 'audio'
 */
function validateUpload(category) {
  return (req, res, next) => {
    if (!req.file && !req.files) return next();

    const files = req.files || (req.file ? [req.file] : []);

    for (const file of files) {
      const originalName = file.originalname || '';
      const ext = path.extname(originalName).toLowerCase();

      // Check for double extensions (e.g., file.php.jpg)
      const nameParts = originalName.split('.');
      if (nameParts.length > 2) {
        const secondExt = '.' + nameParts[nameParts.length - 2].toLowerCase();
        if (DANGEROUS_EXTENSIONS.includes(secondExt)) {
          // Delete the uploaded file
          const fs = require('fs');
          if (file.path) fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: 'Fichier rejeté : extension dangereuse détectée'
          });
        }
      }

      // Block dangerous extensions
      if (DANGEROUS_EXTENSIONS.includes(ext)) {
        const fs = require('fs');
        if (file.path) fs.unlinkSync(file.path);
        return res.status(400).json({
          success: false,
          message: `Extension "${ext}" non autorisée`
        });
      }

      // Whitelist check if category specified
      if (category && ALLOWED_EXTENSIONS[category]) {
        if (!ALLOWED_EXTENSIONS[category].includes(ext)) {
          const fs = require('fs');
          if (file.path) fs.unlinkSync(file.path);
          return res.status(400).json({
            success: false,
            message: `Extension "${ext}" non autorisée pour ce type de fichier`
          });
        }
      }
    }

    next();
  };
}

module.exports = { validateUpload, DANGEROUS_EXTENSIONS, ALLOWED_EXTENSIONS };
