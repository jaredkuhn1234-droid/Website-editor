// dashboard-thumbnails.js
// Additive enhancement: Static thumbnails for site cards in dashboard
// Usage: Import this file in dashboard.html after dashboard.js

// Returns a promise that resolves to a thumbnail URL or renders a live preview
function getThumbnailForSite(site, container) {
  // Try to use static thumbnail if available
  if (site && site.template && typeof site.template === 'string') {
    const thumbPath = `/assets/template-thumbnails/${site.template}.png`;
    fetch(thumbPath, { method: 'HEAD' }).then(res => {
      if (res.ok) {
        container.innerHTML = `<img src="${thumbPath}" alt="Site thumbnail" />`;
      } else {
        renderLivePreview(site, container);
      }
    }).catch(() => renderLivePreview(site, container));
  } else {
    renderLivePreview(site, container);
  }
}

function renderLivePreview(site, container) {
  // Use editor's renderSection logic if available
  let html = '';
  if (Array.isArray(site.sections)) {
    site.sections.forEach((section, idx) => {
      html += window.renderSection ? window.renderSection(section, idx) : '';
    });
  }
  container.innerHTML = `<div class="dashboard-preview-mini">${html}</div>`;
  // Optionally, use html2canvas to generate and save thumbnail
  if (window.html2canvas) {
    window.html2canvas(container.querySelector('.dashboard-preview-mini')).then(canvas => {
      // Save thumbnail if needed
    });
  }
}

export { getThumbnailForSite };
