// Utility for template thumbnail generation and saving

// Check if thumbnail exists (returns Promise<boolean>)
function checkIfThumbnailExists(templateId) {
  return fetch(`/assets/template-thumbnails/${templateId}.png`, { method: 'HEAD' })
    .then(res => res.ok);
}

// Generate a thumbnail from a DOM element using html2canvas
function generateThumbnail(templateId, element) {
  return html2canvas(element, { backgroundColor: null }).then(canvas => {
    const base64 = canvas.toDataURL('image/png');
    return saveThumbnailToServer(templateId, base64);
  });
}

// Save the base64 PNG to the backend
function saveThumbnailToServer(templateId, base64) {
  return fetch('/api/thumbnail-save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, base64 })
  }).then(res => res.ok);
}

// Export for use in templates.html
window.checkIfThumbnailExists = checkIfThumbnailExists;
window.generateThumbnail = generateThumbnail;
window.saveThumbnailToServer = saveThumbnailToServer;
