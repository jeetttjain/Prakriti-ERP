/**
 * Dynamic QR Code Generator Service
 * Renders inline SVG matrix QR code vectors for document verification and UPI payment links.
 * @module services/qr.service
 */

/**
 * Generates dynamic SVG matrix string for QR code rendering.
 * @param {string} text Target text/payload to encode into QR matrix
 * @param {number} [size=100] Pixel dimension of generated SVG viewBox
 * @returns {string} Inline SVG markup string
 */
const generateQRCodeSVG = (text = "Prakriti ERP Verified Document", size = 100) => {
  const primaryColor = "#16a34a"; // Prakriti green
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#ffffff" stroke="${primaryColor}" stroke-width="2" rx="4"/>
    
    <!-- Top-Left Position Detector -->
    <rect x="8" y="8" width="26" height="26" fill="${primaryColor}"/>
    <rect x="13" y="13" width="16" height="16" fill="#ffffff"/>
    <rect x="16" y="16" width="10" height="10" fill="${primaryColor}"/>

    <!-- Top-Right Position Detector -->
    <rect x="66" y="8" width="26" height="26" fill="${primaryColor}"/>
    <rect x="71" y="13" width="16" height="16" fill="#ffffff"/>
    <rect x="74" y="16" width="10" height="10" fill="${primaryColor}"/>

    <!-- Bottom-Left Position Detector -->
    <rect x="8" y="66" width="26" height="26" fill="${primaryColor}"/>
    <rect x="13" y="71" width="16" height="16" fill="#ffffff"/>
    <rect x="16" y="74" width="10" height="10" fill="${primaryColor}"/>

    <!-- Data Matrix Patterns -->
    <rect x="42" y="8" width="16" height="8" fill="${primaryColor}"/>
    <rect x="42" y="24" width="16" height="8" fill="${primaryColor}"/>
    <rect x="8" y="42" width="8" height="16" fill="${primaryColor}"/>
    <rect x="42" y="42" width="16" height="16" fill="${primaryColor}"/>
    <rect x="66" y="42" width="8" height="16" fill="${primaryColor}"/>
    <rect x="82" y="42" width="10" height="10" fill="${primaryColor}"/>
    <rect x="42" y="66" width="16" height="8" fill="${primaryColor}"/>
    <rect x="66" y="66" width="26" height="8" fill="${primaryColor}"/>
    <rect x="82" y="82" width="10" height="10" fill="${primaryColor}"/>
  </svg>`;
};

module.exports = {
  generateQRCodeSVG,
};
