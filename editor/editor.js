// Simple autosave indicator function
function showAutosaveIndicator() {
  const indicator = document.getElementById('autosave-indicator');
  if (indicator) {
    indicator.style.display = 'inline-block';
    indicator.textContent = hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 2000);
  }
}
// import { supabase } from '../backend/supabase.js'; // Removed for browser compatibility
// Autosave logic
let autosaveTimer = null;
let hasUnsavedChanges = false;
const AUTOSAVE_INTERVAL = 15000; // 15 seconds
const autosaveIndicator = document.getElementById('autosave-indicator');

// Mark content as having unsaved changes
function markUnsaved() {
  hasUnsavedChanges = true;
  const saveBtn = document.getElementById('save-btn');
  if (saveBtn) {
    saveBtn.textContent = 'Save*';
    saveBtn.style.background = '#f59e42';
  }
  if (typeof showAutosaveIndicator === 'function') {
    showAutosaveIndicator();
  }
}

function markSaved() {
  hasUnsavedChanges = false;
  showAutosaveIndicator();
}

function startAutosave() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(() => {
    if (hasUnsavedChanges) {
      saveSiteData();
    }
  }, AUTOSAVE_INTERVAL);
}

// Call this after any change to content or styles
function onEditorChange() {
  markUnsaved();
}

// Patch into all section/content/style change handlers:
// Example: after any user edit, call onEditorChange();

// Patch saveSiteData to call markSaved on success
const originalSaveSiteData = typeof saveSiteData === 'function' ? saveSiteData : null;
async function saveSiteData() {
  if (originalSaveSiteData) {
    await originalSaveSiteData();
    markSaved();
  }
}

// Start autosave on load
document.addEventListener('DOMContentLoaded', async () => {
  startAutosave();
  const params = new URLSearchParams(window.location.search);
  const siteId = params.get('siteId');
  const templateId = params.get('template');
  const canvasContent = document.getElementById('canvas-content');
  if (siteId) {
    // TODO: Load site data from backend/database using siteId
    // For now, show a message (implement actual loading as needed)
    if (canvasContent) {
      canvasContent.innerHTML = `<div style="padding:32px;text-align:center;color:#2563eb;font-size:1.2em;">Loaded site: <b>${siteId}</b></div>`;
    } else {
      console.warn('canvas-content element not found.');
    }
  } else if (templateId) {
    await window.loadTemplate(templateId);
  } else {
    if (canvasContent) {
      canvasContent.innerHTML = `<div style="padding:32px;text-align:center;color:#b91c1c;font-size:1.2em;">No site or template selected.<br>Please open a site from the dashboard or choose a template.</div>`;
    } else {
      console.warn('canvas-content element not found.');
    }
  }
});
// Preview mode logic
document.addEventListener('DOMContentLoaded', () => {
  const previewBtn = document.getElementById('preview-btn');
  let isPreview = false;
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      isPreview = !isPreview;
      document.body.classList.toggle('preview-mode', isPreview);
      previewBtn.textContent = isPreview ? 'Exit Preview' : 'Preview';
      // Hide/show editor controls
      const sidebar = document.querySelector('.editor-sidebar');
      const toolbar = document.querySelector('.canvas-toolbar');
      if (sidebar) sidebar.style.display = isPreview ? 'none' : '';
      if (toolbar) toolbar.style.display = isPreview ? 'none' : '';
      // Optionally, add a border or overlay to indicate preview mode
    });
  }

});

const DEFAULT_STYLES = {
  primaryColor: '#4A90E2',
  accentColor: '#2563eb',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  backgroundColor: '#ffffff',
  textColor: '#0b1224',
  borderRadius: '8',
  sectionSpacing: '16'
};

const THEMES = {
  minimal: {
    primaryColor: '#000000',
    accentColor: '#333333',
    backgroundColor: '#ffffff',
    textColor: '#0b1224',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '4',
    sectionSpacing: '16'
  },
  modern: {
    primaryColor: '#4A90E2',
    accentColor: '#2563eb',
    backgroundColor: '#f6f7fb',
    textColor: '#1e293b',
    headingFont: 'Poppins',
    bodyFont: 'Poppins',
    borderRadius: '12',
    sectionSpacing: '24'
  },
  bold: {
    primaryColor: '#ff3b3b',
    accentColor: '#dc2626',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    headingFont: 'Montserrat',
    bodyFont: 'Montserrat',
    borderRadius: '8',
    sectionSpacing: '20'
  },
  elegant: {
    primaryColor: '#6c5ce7',
    accentColor: '#8b7fd8',
    backgroundColor: '#fdfaf5',
    textColor: '#2d3748',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    borderRadius: '16',
    sectionSpacing: '32'
  },
  dark: {
    primaryColor: '#ffffff',
    accentColor: '#e5e7eb',
    backgroundColor: '#000000',
    textColor: '#f3f4f6',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    borderRadius: '8',
    sectionSpacing: '16'
  }
};

// Global state
// Template loading logic
document.addEventListener('DOMContentLoaded', () => {
  const templateBtns = document.querySelectorAll('.template-btn');
  if (templateBtns.length) {
    templateBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const templateName = btn.getAttribute('data-template');
        if (!templateName) return;
        // Confirm if there is existing content
        if (currentContent && currentContent.length > 0) {
          const ok = confirm('This will replace your current sections with the template. Continue?');
          if (!ok) return;
        }
        try {
          const res = await fetch(`/templates/${templateName}.json`);
          if (!res.ok) throw new Error('Failed to load template');
          const template = await res.json();
          if (template.sections && Array.isArray(template.sections)) {
            // Replace current sections with template
            currentContent.length = 0;
            template.sections.forEach(section => currentContent.push(section));
            // Optionally trigger a re-render if needed
            if (typeof renderSections === 'function') renderSections();
            alert('Template loaded!');
          } else {
            alert('Template format invalid.');
          }
        } catch (err) {
          alert('Could not load template: ' + err.message);
        }
      });
    });
  }
});
let currentSiteId = null;
let currentSiteData = null;
let currentPage = 'home'; // Track the currently active page
let pages = {}; // All pages: { home: [...], about: [...], etc }
let currentContent = []; // Current page's sections (reference to pages[currentPage])
let styles = { ...DEFAULT_STYLES };
let isSaving = false;
const FALLBACK_PUBLISH_BASE = 'http://localhost:4003';
const REQUEST_TIMEOUT_MS = 15000;

/**
 * Create a timeout promise for network requests
 */
function createTimeoutPromise(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout - please check your connection')), ms)
  );
}

/**
 * Race a promise against a timeout
 */
function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  return Promise.race([promise, createTimeoutPromise(ms)]);
}

/**
 * Sanitize HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function normalizeImageUrl(url = '', fallback = '') {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  // If it looks like a placeholder size (e.g., 1200x600?text=...), prefix via.placeholder.com
  return `https://via.placeholder.com/${trimmed.replace(/^\//, '')}`;
}

function slugifyPageName(name = '') {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatPageTitle(name = '') {
  const cleaned = name.replace(/[-_]/g, ' ').trim();
  if (!cleaned) return 'Page';
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPageFilename(pageKey) {
  if (pageKey === 'home') return 'index.html';
  const slug = slugifyPageName(pageKey) || 'page';
  return `${slug}.html`;
}

function formatFontForCss(font = 'Inter') {
  return String(font || 'Inter').trim().replace(/\s+/g, '+');
}

function triggerDownload(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/**
 * Image size requirements for each section type
 */
const IMAGE_REQUIREMENTS = {
  hero: {
    recommended: '1200x600',
    aspectRatio: '2:1',
    maxWidth: 1200,
    maxHeight: 600,
    minWidth: 800,
    minHeight: 400
  },
  imageBlock: {
    recommended: '800x400',
    aspectRatio: '2:1',
    maxWidth: 800,
    maxHeight: 400,
    minWidth: 400,
    minHeight: 300
  },
  featureIcon: {
    recommended: '200x200',
    aspectRatio: '1:1',
    maxWidth: 200,
    maxHeight: 200,
    minWidth: 100,
    minHeight: 100
  },
  pricingImage: {
    recommended: '300x200',
    aspectRatio: '3:2',
    maxWidth: 300,
    maxHeight: 200,
    minWidth: 150,
    minHeight: 100
  }
};

/**
 * Upload an image to Supabase Storage
 */
async function uploadImage(file, siteId, sectionId, imageType = 'imageBlock') {
  if (!file || !siteId || !sectionId) {
    console.error('Missing required parameters for image upload');
    return null;
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
    return null;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    alert('Image file is too large. Maximum size is 5MB.');
    return null;
  }

  // Get image dimensions to validate aspect ratio
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const requirements = IMAGE_REQUIREMENTS[imageType] || IMAGE_REQUIREMENTS.imageBlock;
        
        // Check minimum dimensions
        if (img.width < requirements.minWidth || img.height < requirements.minHeight) {
          alert(`Image too small. Minimum: ${requirements.minWidth}x${requirements.minHeight}px`);
          resolve(null);
          return;
        }

        // Check maximum dimensions (warn but allow)
        if (img.width > requirements.maxWidth || img.height > requirements.maxHeight) {
          const confirmed = confirm(
            `Image is larger than recommended (${img.width}x${img.height}px). ` +
            `Recommended: ${requirements.recommended}px (${requirements.aspectRatio}). ` +
            `It will be resized to fit. Continue?`
          );
          if (!confirmed) {
            resolve(null);
            return;
          }
        }

        // Proceed with upload
        performUpload(file, siteId, sectionId, resolve);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Perform the actual image upload to Supabase
 */
async function performUpload(file, siteId, sectionId, callback) {
  try {
    // Create structured path: siteId/sectionId/timestamp_filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${siteId}/${sectionId}/${timestamp}_${sanitizedFileName}`;

    console.log('Uploading image to:', filePath);

    // Upload to Supabase Storage
    const { data, error } = await withTimeout(
      supabase.storage
        .from('site-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
    );

    if (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload image: ${error.message}`);
      callback(null);
      return;
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('site-images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL');
      callback(null);
      return;
    }

    console.log('Public URL:', urlData.publicUrl);
    callback(urlData.publicUrl);
  } catch (error) {
    console.error('Image upload error:', error);
    alert('Failed to upload image. Please try again.');
    callback(null);
  }
}

/**
 * Handle image click to trigger upload
 */
async function handleImageUpload(sectionId, fieldPath, imgElement, imageType = 'imageBlock') {
  // Get image requirements for display
  const requirements = IMAGE_REQUIREMENTS[imageType] || IMAGE_REQUIREMENTS.imageBlock;
  
  // Create a hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
  fileInput.style.display = 'none';

  // Handle file selection
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading state
    const originalSrc = imgElement.src;
    imgElement.style.opacity = '0.5';
    imgElement.style.cursor = 'wait';

    // Upload image with size validation
    const publicUrl = await uploadImage(file, currentSiteId, sectionId, imageType);

    if (publicUrl) {
      // Update the content array
      updateSectionField(sectionId, fieldPath, publicUrl);
      
      // Update the image immediately
      imgElement.src = publicUrl;
      imgElement.style.opacity = '1';
      imgElement.style.cursor = 'pointer';
      
      console.log('Image updated successfully');
    } else {
      // Restore original state on failure
      imgElement.src = originalSrc;
      imgElement.style.opacity = '1';
      imgElement.style.cursor = 'pointer';
    }

    // Clean up
    fileInput.remove();
  });

  // Show info about required image size before selecting
  alert(
    `Image Requirements for ${imageType}:\n\n` +
    `Recommended: ${requirements.recommended}px\n` +
    `Aspect Ratio: ${requirements.aspectRatio}\n` +
    `Minimum: ${requirements.minWidth}x${requirements.minHeight}px\n` +
    `Maximum File Size: 5MB\n\n` +
    `Select an image to upload.`
  );

  // Trigger file picker
  document.body.appendChild(fileInput);
  fileInput.click();
}

/**
 * Extract siteId from URL query parameters
 */
function getSiteIdFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('siteId');
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

/**
 * Fetch site data from Supabase
 */
async function fetchSite(siteId) {
  if (!siteId) {
    throw new Error('No site ID provided');
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single()
    );

    if (error) throw error;
    if (!data) throw new Error('Site not found');
    
    return data;
  } catch (error) {
    console.error('Error fetching site:', error);
    alert('Could not load site. Redirecting to dashboard.');
    window.location.href = '/app/dashboard.html';
    throw error;
  }
}

/**
 * Generate a unique ID for a section
 */
function generateSectionId() {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create default data for a section type
 */
function getDefaultSectionData(type) {
  const defaults = {
    hero: {
      title: 'Welcome to Your Site',
      subtitle: 'This is a hero section. Edit this text to match your brand.',
      imageUrl: 'https://via.placeholder.com/1200x600?text=Click+to+upload+hero+image'
    },
    text: {
      content: 'This is a text block. Add your content here.'
    },
    image: {
      url: 'https://via.placeholder.com/800x400?text=Click+to+upload+image',
      alt: 'Image'
    },
    features: {
      features: [
        { icon: '✓', title: 'Feature 1', description: 'Description', imageUrl: null },
        { icon: '✓', title: 'Feature 2', description: 'Description', imageUrl: null },
        { icon: '✓', title: 'Feature 3', description: 'Description', imageUrl: null }
      ]
    },
    pricing: {
      plans: [
        { name: 'Starter', price: '$9/mo', features: ['Feature 1', 'Feature 2'], imageUrl: null },
        { name: 'Pro', price: '$29/mo', features: ['All Starter features', 'Feature 3', 'Feature 4'], imageUrl: null },
        { name: 'Enterprise', price: 'Custom', features: ['All Pro features', 'Dedicated support'], imageUrl: null }
      ]
    },
    contact: {
      title: 'Get in Touch',
      email: 'contact@example.com'
    }
  };
  
  return JSON.parse(JSON.stringify(defaults[type] || {}));
}

/**
 * Styles helpers
 */
function normalizeStyles(rawStyles) {
  let parsed = rawStyles;
  if (typeof rawStyles === 'string') {
    try {
      parsed = JSON.parse(rawStyles);
    } catch (error) {
      console.warn('Could not parse styles JSON, using defaults', error);
      parsed = {};
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    parsed = {};
  }

  return { ...DEFAULT_STYLES, ...parsed };
}

function applyStyles(styleObj = styles) {
  styles = { ...DEFAULT_STYLES, ...styleObj };
  const editorRoot = document.querySelector('.editor-container');
  if (!editorRoot) return;
  editorRoot.style.setProperty('--primary-color', styles.primaryColor);
  editorRoot.style.setProperty('--accent-color', styles.accentColor);
  editorRoot.style.setProperty('--background-color', styles.backgroundColor);
  editorRoot.style.setProperty('--text-color', styles.textColor);
  editorRoot.style.setProperty('--heading-font', `${styles.headingFont}, sans-serif`);
  editorRoot.style.setProperty('--body-font', `${styles.bodyFont}, sans-serif`);
  editorRoot.style.setProperty('--accent', styles.accentColor);
  editorRoot.style.setProperty('--accent-strong', styles.accentColor);
  editorRoot.style.setProperty('--border-radius', `${styles.borderRadius}px`);
  editorRoot.style.setProperty('--section-spacing', `${styles.sectionSpacing}px`);
  editorRoot.style.setProperty('--text', styles.textColor);
}

function syncStyleControls() {
  const primaryInput = document.getElementById('primary-color-input');
  const accentInput = document.getElementById('accent-color-input');
  const backgroundInput = document.getElementById('background-color-input');
  const textInput = document.getElementById('text-color-input');
  const headingSelect = document.getElementById('heading-font-select');
  const bodySelect = document.getElementById('body-font-select');
  const borderRadiusInput = document.getElementById('border-radius-input');
  const sectionSpacingInput = document.getElementById('section-spacing-input');

  if (primaryInput) {
    primaryInput.value = styles.primaryColor || DEFAULT_STYLES.primaryColor;
    const hexDisplay = document.getElementById('primary-color-hex');
    if (hexDisplay) hexDisplay.textContent = primaryInput.value.toUpperCase();
  }
  if (accentInput) {
    accentInput.value = styles.accentColor || DEFAULT_STYLES.accentColor;
    const hexDisplay = document.getElementById('accent-color-hex');
    if (hexDisplay) hexDisplay.textContent = accentInput.value.toUpperCase();
  }
  if (backgroundInput) {
    backgroundInput.value = styles.backgroundColor || DEFAULT_STYLES.backgroundColor;
    const hexDisplay = document.getElementById('background-color-hex');
    if (hexDisplay) hexDisplay.textContent = backgroundInput.value.toUpperCase();
  }
  if (textInput) {
    textInput.value = styles.textColor || DEFAULT_STYLES.textColor;
    const hexDisplay = document.getElementById('text-color-hex');
    if (hexDisplay) hexDisplay.textContent = textInput.value.toUpperCase();
  }
  if (headingSelect) {
    headingSelect.value = styles.headingFont || DEFAULT_STYLES.headingFont;
    const preview = document.getElementById('heading-font-preview');
    if (preview) preview.style.fontFamily = `${headingSelect.value}, sans-serif`;
  }
  if (bodySelect) {
    bodySelect.value = styles.bodyFont || DEFAULT_STYLES.bodyFont;
    const preview = document.getElementById('body-font-preview');
    if (preview) preview.style.fontFamily = `${bodySelect.value}, sans-serif`;
  }
  if (borderRadiusInput) {
    borderRadiusInput.value = styles.borderRadius || DEFAULT_STYLES.borderRadius;
    const valueDisplay = document.getElementById('border-radius-value');
    if (valueDisplay) valueDisplay.textContent = `${borderRadiusInput.value}px`;
  }
  if (sectionSpacingInput) {
    sectionSpacingInput.value = styles.sectionSpacing || DEFAULT_STYLES.sectionSpacing;
    const valueDisplay = document.getElementById('section-spacing-value');
    if (valueDisplay) valueDisplay.textContent = `${sectionSpacingInput.value}px`;
  }
}

function updateStyles(partial, rerender = false) {
  styles = { ...styles, ...partial };
  applyStyles(styles);
  syncStyleControls();
  if (rerender) {
    renderCanvas();
  }
}

function applyTheme(themeKey) {
  const theme = THEMES[themeKey];
  if (!theme) return;
  updateStyles({ ...DEFAULT_STYLES, ...theme }, true);
  showSaveMessage(`Applied ${themeKey} theme`);
}

async function downloadZip() {
  if (!window.JSZip) {
    alert('JSZip failed to load. Please check your connection and try again.');
    return;
  }

  try {
    const zip = new window.JSZip();
    const files = generateStaticHTML(pages, styles);

    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(blob, 'website.zip');
    showSaveMessage('ZIP generated');
  } catch (error) {
    console.error('Error generating ZIP:', error);
    showSaveMessage('Failed to generate ZIP', 'error');
  }
}

function generateBaseCss(styleObj = styles) {
  const safeStyles = { ...DEFAULT_STYLES, ...styleObj };
  const headingFont = formatFontForCss(safeStyles.headingFont);
  const bodyFont = formatFontForCss(safeStyles.bodyFont);

  return `@import url('https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;600;700&family=${bodyFont}:wght@400;500;600&display=swap');

:root {
  --primary-color: ${safeStyles.primaryColor};
  --accent-color: ${safeStyles.accentColor};
  --background-color: ${safeStyles.backgroundColor};
  --text-color: ${safeStyles.textColor};
  --heading-font: ${safeStyles.headingFont}, sans-serif;
  --body-font: ${safeStyles.bodyFont}, sans-serif;
  --border-radius: ${safeStyles.borderRadius}px;
  --section-spacing: ${safeStyles.sectionSpacing}px;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--body-font);
  background: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
}
a { color: var(--primary-color); text-decoration: none; }
a:hover { text-decoration: underline; }

header.site-header {
  background: #0f172a;
  color: #e5e7eb;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.site-brand {
  font-weight: 700;
  letter-spacing: 0.3px;
}

.site-nav {
  display: flex;
  gap: 14px;
  align-items: center;
}

.site-nav a {
  padding: 8px 12px;
  border-radius: 8px;
  color: #e5e7eb;
  border: 1px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.site-nav a:hover { background: rgba(255, 255, 255, 0.08); }
.site-nav a.active { border-color: rgba(255, 255, 255, 0.22); }

main { padding: 32px 24px; max-width: 1100px; margin: 0 auto; }

section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius);
  padding: var(--section-spacing);
  margin-bottom: var(--section-spacing);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
  border: 1px solid #e5e7eb;
}

.hero-section {
  position: relative;
  overflow: hidden;
  padding: 0;
}

.hero-section img {
  width: 100%;
  display: block;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.hero-content {
  padding: 20px var(--section-spacing) var(--section-spacing);
}

.text-section p { margin: 0; font-size: 16px; }

.image-section img {
  width: 100%;
  border-radius: var(--border-radius);
  display: block;
}

.features-section h2,
.pricing-section h2,
.contact-section h2 {
  margin-top: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature-card {
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background: #f8fafc;
}

.feature-card .icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--primary-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-weight: 700;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.pricing-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  background: #f8fafc;
}

.pricing-card .price {
  font-size: 28px;
  font-weight: 700;
  margin: 6px 0 12px;
}

.pricing-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pricing-card li {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.check-icon { color: var(--primary-color); font-weight: 700; }

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-form input,
.contact-form textarea {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-family: var(--body-font);
}

.contact-form button {
  padding: 12px;
  border: none;
  border-radius: var(--border-radius);
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.footer { text-align: center; color: #6b7280; padding: 12px 0 0; font-size: 14px; }
`; 
}

function renderStaticSection(section) {
  if (!section || !section.type) return '';
  const data = section.data || {};

  switch (section.type) {
    case 'hero': {
      const heroImageUrl = normalizeImageUrl(
        data.imageUrl,
        'https://via.placeholder.com/1200x600?text=Hero+Image'
      );
      return `
        <section class="hero-section">
          <img src="${escapeHtml(heroImageUrl)}" alt="Hero background" />
          <div class="hero-content">
            <h1>${escapeHtml(data.title || 'Welcome')}</h1>
            <p>${escapeHtml(data.subtitle || '')}</p>
          </div>
        </section>
      `;
    }
    case 'text':
      return `
        <section class="text-section">
          <p>${escapeHtml(data.content || '')}</p>
        </section>
      `;
    case 'image': {
      const imageUrl = normalizeImageUrl(
        data.url,
        'https://via.placeholder.com/800x400?text=Image'
      );
      return `
        <section class="image-section">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.alt || 'Image')}" />
        </section>
      `;
    }
    case 'features': {
      const features = Array.isArray(data.features) ? data.features : [];
      return `
        <section class="features-section">
          <h2>${escapeHtml(data.title || 'Features')}</h2>
          <div class="features-grid">
            ${features.map((f) => `
              <div class="feature-card">
                <div class="icon">${escapeHtml(f?.icon || '✓')}</div>
                <h4>${escapeHtml(f?.title || 'Feature')}</h4>
                <p>${escapeHtml(f?.description || '')}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
    case 'pricing': {
      const plans = Array.isArray(data.plans) ? data.plans : [];
      return `
        <section class="pricing-section">
          <h2>${escapeHtml(data.title || 'Pricing')}</h2>
          <div class="pricing-grid">
            ${plans.map((p) => `
              <div class="pricing-card">
                <h3>${escapeHtml(p?.name || 'Plan')}</h3>
                <div class="price">${escapeHtml(p?.price || '')}</div>
                <ul>
                  ${(Array.isArray(p?.features) ? p.features : []).map((f) => `<li><span class="check-icon">✓</span><span>${escapeHtml(f || '')}</span></li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }
    case 'contact':
      return `
        <section class="contact-section">
          <h2>${escapeHtml(data.title || 'Get in Touch')}</h2>
          <div class="contact-form">
            <input type="email" placeholder="your@email.com" required>
            <input type="text" placeholder="Your name" required>
            <textarea rows="4" placeholder="Your message" required></textarea>
            <button type="button">Send Message</button>
          </div>
        </section>
      `;
    default:
      return '';
  }
}

function buildStaticPage(pageKey, sections = [], pageEntries = [], styleObj = styles) {
  const siteTitleInput = document.getElementById('site-title-input');
  const siteTitle = siteTitleInput?.value?.trim() || 'My Site';
  const pageTitle = pageKey === 'home' ? siteTitle : `${formatPageTitle(pageKey)} | ${siteTitle}`;
  const nav = `
    <header class="site-header">
      <div class="site-brand">${escapeHtml(siteTitle)}</div>
      <nav class="site-nav">
        ${pageEntries.map(([key]) => {
          const filename = getPageFilename(key);
          const label = key === 'home' ? 'Home' : formatPageTitle(key);
          const isActive = key === pageKey;
          return `<a href="${filename}" ${isActive ? 'class="active"' : ''}>${escapeHtml(label)}</a>`;
        }).join('')}
      </nav>
    </header>
  `;

  const renderedSections = Array.isArray(sections) && sections.length
    ? sections.map(renderStaticSection).join('\n')
    : '<section><p>This page has no content yet.</p></section>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  ${nav}
  <main>
    ${renderedSections}
    <div class="footer">Back to <a href="index.html">Home</a></div>
  </main>
</body>
</html>`;
}

function generateStaticHTML(pagesObj = pages, styleObj = styles) {
  const files = {};
  const baseCss = generateBaseCss(styleObj);
  files['styles.css'] = baseCss;

  const entries = Object.entries(pagesObj || {});
  if (!entries.length) {
    files['index.html'] = buildStaticPage('home', [], [['home', []]], styleObj);
    return files;
  }

  entries.forEach(([pageKey, content]) => {
    const fileName = getPageFilename(pageKey);
    files[fileName] = buildStaticPage(pageKey, Array.isArray(content) ? content : [], entries, styleObj);
  });

  return files;
}

/**
 * Add a new section of specified type
 */
function addSection(type) {
  if (!type || typeof type !== 'string') {
    console.error('Invalid section type:', type);
    return;
  }

  const section = {
    id: generateSectionId(),
    type: type.toLowerCase(),
    data: getDefaultSectionData(type)
  };
  
  currentContent.push(section);
  renderCanvas();
  markUnsaved();
}

/**
 * Delete a section by ID
 */
function deleteSection(sectionId) {
  if (!sectionId) return;
  currentContent = currentContent.filter(s => s?.id !== sectionId);
  renderCanvas();
  markUnsaved();
}

/**
 * Move a section up in the array
 */
function moveSectionUp(sectionId) {
  if (!sectionId) return;
  const index = currentContent.findIndex(s => s?.id === sectionId);
  if (index > 0) {
    [currentContent[index], currentContent[index - 1]] = [currentContent[index - 1], currentContent[index]];
    renderCanvas();
    markUnsaved();
  }
}

/**
 * Move a section down in the array
 */
function moveSectionDown(sectionId) {
  if (!sectionId) return;
  const index = currentContent.findIndex(s => s?.id === sectionId);
  if (index >= 0 && index < currentContent.length - 1) {
    [currentContent[index], currentContent[index + 1]] = [currentContent[index + 1], currentContent[index]];
    renderCanvas();
    markUnsaved();
  }
}

/**
 * Update section data when user edits inline text
 */
function updateSectionField(sectionId, fieldPath, value) {
  const section = currentContent.find(s => s?.id === sectionId);
  if (!section) {
    console.warn('Section not found:', sectionId);
    return;
  }

  if (!section.data) {
    section.data = {};
  }

  // Parse fieldPath like "title" or "features[0].title"
  // Check if path has array notation
  const arrayPattern = /^(\w+)\[(\d+)\]\.(\w+)$/;
  const nestedArrayPattern = /^(\w+)\[(\d+)\]\.(\w+)\[(\d+)\]$/;

  if (nestedArrayPattern.test(fieldPath)) {
    // Handle "plans[0].features[1]" pattern
    const match = fieldPath.match(nestedArrayPattern);
    const [, arrayKey, arrayIdx, nestedKey, nestedIdx] = match;
    
    if (!Array.isArray(section.data[arrayKey])) {
      section.data[arrayKey] = [];
    }
    if (!section.data[arrayKey][Number(arrayIdx)]) {
      section.data[arrayKey][Number(arrayIdx)] = {};
    }
    if (!Array.isArray(section.data[arrayKey][Number(arrayIdx)][nestedKey])) {
      section.data[arrayKey][Number(arrayIdx)][nestedKey] = [];
    }
    
    section.data[arrayKey][Number(arrayIdx)][nestedKey][Number(nestedIdx)] = value;
  } else if (arrayPattern.test(fieldPath)) {
    // Handle "features[0].title" pattern
    const match = fieldPath.match(arrayPattern);
    const [, arrayKey, arrayIdx, propKey] = match;
    
    if (!Array.isArray(section.data[arrayKey])) {
      section.data[arrayKey] = [];
    }
    if (!section.data[arrayKey][Number(arrayIdx)]) {
      section.data[arrayKey][Number(arrayIdx)] = {};
    }
    
    section.data[arrayKey][Number(arrayIdx)][propKey] = value;
  } else {
    // Handle simple property like "title" or "subtitle"
    section.data[fieldPath] = value;
  }
  
  console.log('Updated section:', sectionId, fieldPath, '=', value);
  markUnsaved();
}

/**
 * Mark content as having unsaved changes
 */

/**
 * Clear unsaved changes indicator
 */

/**
 * Render a single section based on its type
 */
window.renderSection = renderSection;
function renderSection(section, index) {
  if (!section || !section.id || !section.type) {
    return '';
  }

  const { id, type, data } = section;
  let content = '';

  try {
    switch (type) {
      case 'hero':
        const heroImageUrl = normalizeImageUrl(
          data?.imageUrl,
          'https://via.placeholder.com/1200x600?text=Click+to+upload+hero+image'
        );
        content = `
          <div class="hero-section" role="region" aria-label="Hero Section">
            <img class="editable-image hero-image" 
                 src="${escapeHtml(heroImageUrl)}" 
                 loading="lazy"
                 data-section-id="${escapeHtml(id)}" 
                 data-field="imageUrl"
                 data-image-type="hero"
                 alt="Hero background" />
            <div class="hero-content">
              <h1 contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="title" aria-label="Hero Title">${escapeHtml(data?.title || 'Welcome')}</h1>
              <p contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="subtitle" aria-label="Hero Subtitle">${escapeHtml(data?.subtitle || '')}</p>
            </div>
          </div>
        `;
        break;
      case 'text':
        content = `
          <div class="text-section" role="region" aria-label="Text Section">
            <p contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="content" aria-label="Text Block">${escapeHtml(data?.content || '')}</p>
          </div>
        `;
        break;
      case 'image':
        const imageUrl = normalizeImageUrl(
          data?.url,
          'https://via.placeholder.com/800x400?text=Click+to+upload+image'
        );
        content = `
          <div class="image-section" role="region" aria-label="Image Section">
            <img class="editable-image" 
                 src="${escapeHtml(imageUrl)}" 
                 loading="lazy"
                 data-section-id="${escapeHtml(id)}" 
                 data-field="url"
                 data-image-type="imageBlock"
                 alt="${escapeHtml(data?.alt || 'Image')}" />
          </div>
        `;
        break;
      case 'features':
        const features = Array.isArray(data?.features) ? data.features : [];
        content = `
          <div class="features-section">
            <h2>Features</h2>
            <div class="features-grid">
              ${features.map((f, idx) => `
                <div class="feature-card">
                  <div class="icon">${escapeHtml(f?.icon || '✓')}</div>
                  <h4 contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="features[${idx}].title">${escapeHtml(f?.title || 'Feature')}</h4>
                  <p contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="features[${idx}].description">${escapeHtml(f?.description || '')}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      case 'pricing':
        const plans = Array.isArray(data?.plans) ? data.plans : [];
        content = `
          <div class="pricing-section">
            <h2>Pricing</h2>
            <div class="pricing-grid">
              ${plans.map((p, idx) => `
                <div class="pricing-card">
                  <h3 contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="plans[${idx}].name">${escapeHtml(p?.name || 'Plan')}</h3>
                  <div class="price" contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="plans[${idx}].price">${escapeHtml(p?.price || '')}</div>
                  <ul>
                    ${(Array.isArray(p?.features) ? p.features : []).map((f, fIdx) => `<li><span class="check-icon">✓</span><span contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="plans[${idx}].features[${fIdx}]">${escapeHtml(f || '')}</span></li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;
      case 'contact':
        content = `
          <div class="contact-section">
            <h2 contenteditable="true" data-section-id="${escapeHtml(id)}" data-field="title">${escapeHtml(data?.title || 'Get in Touch')}</h2>
            <form class="contact-form">
              <input type="email" placeholder="your@email.com" required>
              <input type="text" placeholder="Your name" required>
              <textarea placeholder="Your message" rows="4" required></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        `;
        break;
      default:
        return '';
    }
  } catch (error) {
    console.error('Error rendering section:', error);
    return '';
  }

  const showControls = !section.isTemplate && !section.locked;
  return `
    <div class="canvas-section" data-section-id="${escapeHtml(id)}">
      ${showControls ? `<div class="section-toolbar">
        ${index > 0 ? `<button class="section-btn up" data-section-id="${escapeHtml(id)}" title="Move up">↑</button>` : ''}
        ${index < currentContent.length - 1 ? `<button class="section-btn down" data-section-id="${escapeHtml(id)}" title="Move down">↓</button>` : ''}
        <button class="section-btn delete" data-section-id="${escapeHtml(id)}" title="Delete">✕</button>
      </div>` : ''}
      <div class="section-content">
        ${content}
      </div>
    </div>
  `;
}

/**
 * Render empty state in canvas
 */
function renderEmptyCanvas() {
  const canvas = document.getElementById('canvas-content');
  if (!canvas) return;

  canvas.innerHTML = `
    <div class="empty-canvas">
      <h2>This page is empty</h2>
      <p>Add a section to get started by using the Sections tab on the left.</p>
    </div>
  `;
}

/**
 * Render all content sections in the canvas
 */
function renderCanvas() {
  const canvas = document.getElementById('canvas-content');
  if (!canvas) return;

  if (!Array.isArray(currentContent) || currentContent.length === 0) {
    renderEmptyCanvas();
    return;
  }

  // Render all sections

  // Render all sections as draggable items

  // Render all sections with handles and reorder buttons
  const rendered = currentContent.map((section, index) => {
    try {
      return `<div class="draggable-section" draggable="true" data-index="${index}">
        <div class="section-handle" title="Drag to reorder">☰</div>
        <button class="section-move-up" title="Move up" data-index="${index}">↑</button>
        <button class="section-move-down" title="Move down" data-index="${index}">↓</button>
        ${renderSection(section, index)}
      </div>`;
    } catch (error) {
      console.error('Error rendering section:', error);
      return '';
    }
  }).filter(html => html !== '').join('');
  // Wire up reorder buttons and keyboard navigation
  canvas.querySelectorAll('.section-move-up').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(btn.dataset.index);
      if (idx > 0) {
        const moved = currentContent.splice(idx, 1)[0];
        currentContent.splice(idx - 1, 0, moved);
        renderCanvas();
        markUnsaved();
      }
    });
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Move section up');
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });
  canvas.querySelectorAll('.section-move-down').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(btn.dataset.index);
      if (idx < currentContent.length - 1) {
        const moved = currentContent.splice(idx, 1)[0];
        currentContent.splice(idx + 1, 0, moved);
        renderCanvas();
        markUnsaved();
      }
    });
    btn.setAttribute('tabindex', '0');
    btn.setAttribute('aria-label', 'Move section down');
    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') btn.click();
    });
  });
// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSiteData();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    undo();
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
    e.preventDefault();
    redo();
  }
  if (e.key === 'p' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    document.getElementById('preview-btn')?.click();
  }
});
// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}
document.addEventListener('DOMContentLoaded', () => {
  let darkBtn = document.getElementById('dark-mode-toggle');
  if (!darkBtn) {
    darkBtn = document.createElement('button');
    darkBtn.id = 'dark-mode-toggle';
    darkBtn.textContent = '🌙 Dark Mode';
    darkBtn.className = 'btn btn-secondary';
    darkBtn.style.marginLeft = '12px';
    document.querySelector('.navbar-actions')?.appendChild(darkBtn);
  }
  darkBtn.addEventListener('click', toggleDarkMode);
});

  canvas.innerHTML = rendered;

  // Drag and drop logic
  const draggables = canvas.querySelectorAll('.draggable-section');
  let dragSrcIndex = null;
  draggables.forEach(item => {
    item.addEventListener('dragstart', e => {
      dragSrcIndex = Number(item.dataset.index);
      item.classList.add('dragging');
      // Highlight all drop targets
      draggables.forEach(d => d.classList.add('drag-target'));
    });
    item.addEventListener('dragend', e => {
      item.classList.remove('dragging');
      draggables.forEach(d => d.classList.remove('drag-target'));
    });
    item.addEventListener('dragover', e => {
      e.preventDefault();
      item.classList.add('drag-over');
      // Auto-scroll if near top/bottom
      const rect = item.getBoundingClientRect();
      if (rect.top < 120) window.scrollBy({ top: -20, behavior: 'smooth' });
      if (rect.bottom > window.innerHeight - 120) window.scrollBy({ top: 20, behavior: 'smooth' });
    });
    item.addEventListener('dragleave', e => {
      item.classList.remove('drag-over');
    });
    item.addEventListener('drop', e => {
      e.preventDefault();
      item.classList.remove('drag-over');
      draggables.forEach(d => d.classList.remove('drag-target'));
      const dropIndex = Number(item.dataset.index);
      if (dragSrcIndex !== null && dragSrcIndex !== dropIndex) {
        // Reorder sections
        const moved = currentContent.splice(dragSrcIndex, 1)[0];
        currentContent.splice(dropIndex, 0, moved);
        renderCanvas();
        markUnsaved();
        // Animate drop
        setTimeout(() => {
          const newDraggables = canvas.querySelectorAll('.draggable-section');
          if (newDraggables[dropIndex]) {
            newDraggables[dropIndex].classList.add('drop-animate');
            setTimeout(() => newDraggables[dropIndex].classList.remove('drop-animate'), 400);
          }
        }, 50);
      }
      dragSrcIndex = null;
    });
  });

  // Ensure delegated handlers stay wired even after rerenders
  ensureCanvasDelegates();
}

/**
 * Ensure all delegated canvas listeners are attached
 */
function ensureCanvasDelegates() {
  wireSectionControls();
  wireInlineEditing();
  wireImageUpload();
}

/**
 * Render the pages list in the sidebar
 */
function renderPagesList() {
  const pagesList = document.getElementById('pages-list');
  if (!pagesList) return;

  // Clear existing pages
  pagesList.innerHTML = '';

  // Create list items for each page
  Object.keys(pages).forEach(pageName => {
    const li = document.createElement('li');
    li.className = `page-list-item ${pageName === currentPage ? 'active' : ''}`;
    li.dataset.page = pageName;
    li.innerHTML = `
      <span class="page-name">${escapeHtml(pageName)}</span>
      <div class="page-actions">
        <button class="btn-rename" data-page="${escapeHtml(pageName)}" title="Rename page">✏️</button>
        <button class="btn-delete" data-page="${escapeHtml(pageName)}" title="Delete page" ${pageName === 'home' ? 'disabled' : ''}>🗑️</button>
      </div>
    `;

    pagesList.appendChild(li);
  });
}

/**
 * Switch to a different page
 */
async function switchPage(pageName) {
  if (!pageName || !pages[pageName]) {
    console.error('Invalid page name:', pageName);
    return;
  }

  // Only switch if different from current
  if (pageName === currentPage) return;

  try {
    // Save current page before switching
    pages[currentPage] = currentContent;

    // Switch to new page
    currentPage = pageName;
    currentContent = pages[currentPage];

    // Update UI
    renderPagesList();
    renderCanvas();

    console.log(`Switched to page: ${currentPage}`);
  } catch (error) {
    console.error('Error switching page:', error);
    alert('Error switching page. Please try again.');
  }
}

/**
 * Add a new page
 */
async function addPage() {
  try {
    const pageName = prompt('Enter page name:');
    
    if (!pageName) return; // User cancelled
    
    // Validate page name
    const cleanName = pageName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanName) {
      alert('Please enter a valid page name');
      return;
    }

    // Check for duplicates
    if (pages[cleanName]) {
      alert('A page with this name already exists');
      return;
    }

    // Create new page with empty content
    pages[cleanName] = [];

    // Switch to new page
    currentPage = cleanName;
    currentContent = pages[cleanName];

    // Update UI
    renderPagesList();
    renderCanvas();

    // Show confirmation
    showSaveMessage(`Page "${cleanName}" created!`);
    console.log(`Created new page: ${cleanName}`);
  } catch (error) {
    console.error('Error adding page:', error);
    alert('Error creating page. Please try again.');
  }
}

/**
 * Rename a page
 */
async function renamePage(oldName) {
  if (oldName === 'home') {
    alert('Cannot rename the home page');
    return;
  }

  try {
    const newName = prompt(`Rename page "${oldName}" to:`, oldName);
    
    if (!newName) return; // User cancelled
    
    // Validate new name
    const cleanName = newName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (!cleanName) {
      alert('Please enter a valid page name');
      return;
    }

    // Check for duplicates
    if (cleanName !== oldName && pages[cleanName]) {
      alert('A page with this name already exists');
      return;
    }

    // Rename page
    if (cleanName !== oldName) {
      pages[cleanName] = pages[oldName];
      delete pages[oldName];

      // Update current page reference if renaming current page
      if (currentPage === oldName) {
        currentPage = cleanName;
      }
    }

    // Update UI
    renderPagesList();
    renderCanvas();

    showSaveMessage(`Page renamed to "${cleanName}"`);
    console.log(`Renamed page: ${oldName} → ${cleanName}`);
  } catch (error) {
    console.error('Error renaming page:', error);
    alert('Error renaming page. Please try again.');
  }
}

/**
 * Delete a page
 */
async function deletePage(pageName) {
  if (pageName === 'home') {
    alert('Cannot delete the home page');
    return;
  }

  if (!confirm(`Delete page "${pageName}"? This cannot be undone.`)) {
    return;
  }

  try {
    // Delete the page
    delete pages[pageName];

    // If we deleted the current page, switch to home
    if (currentPage === pageName) {
      currentPage = 'home';
      currentContent = pages['home'];
    }

    // Update UI
    renderPagesList();
    renderCanvas();

    showSaveMessage(`Page "${pageName}" deleted`);
    console.log(`Deleted page: ${pageName}`);
  } catch (error) {
    console.error('Error deleting page:', error);
    alert('Error deleting page. Please try again.');
  }
}

/**
 * Wire up static page manager controls
 */
function wirePageButtons() {
  // Add page button (guard to avoid double-binding on rerenders)
  const addPageBtn = document.getElementById('add-page-btn');
  if (addPageBtn && !addPageBtn.dataset.wired) {
    addPageBtn.addEventListener('click', addPage);
    addPageBtn.dataset.wired = 'true';
  }

  // Delegate page list clicks (rename/delete/switch) to avoid losing handlers after re-render
  const pagesList = document.getElementById('pages-list');
  if (pagesList && !pagesList.dataset.wired) {
    pagesList.addEventListener('click', (e) => {
      const renameBtn = e.target.closest('.btn-rename');
      const deleteBtn = e.target.closest('.btn-delete');
      const pageItem = e.target.closest('.page-list-item');

      if (renameBtn) {
        e.stopPropagation();
        const pageName = renameBtn.getAttribute('data-page');
        return renamePage(pageName);
      }

      if (deleteBtn) {
        e.stopPropagation();
        const pageName = deleteBtn.getAttribute('data-page');
        return deletePage(pageName);
      }

      if (pageItem) {
        const pageName = pageItem.dataset.page;
        if (pageName) {
          switchPage(pageName);
        }
      }
    });

    pagesList.dataset.wired = 'true';
  }
}

/**
 * Wire up section toolbar buttons (up, down, delete)
 */
function wireSectionControls() {
  const canvas = document.getElementById('canvas-content');
  if (!canvas || canvas.dataset.sectionsWired) return;

  canvas.addEventListener('click', (e) => {
    const sectionBtn = e.target.closest('.section-btn');
    if (!sectionBtn) return;

    const sectionId = sectionBtn.getAttribute('data-section-id');
    if (!sectionId) return;

    if (sectionBtn.classList.contains('delete')) {
      deleteSection(sectionId);
      return;
    }
    if (sectionBtn.classList.contains('up')) {
      moveSectionUp(sectionId);
      return;
    }
    if (sectionBtn.classList.contains('down')) {
      moveSectionDown(sectionId);
      return;
    }
  });

  canvas.dataset.sectionsWired = 'true';
}

/**
 * Wire up inline editing via delegation to avoid re-binding on each render
 */
function wireInlineEditing() {
  const canvas = document.getElementById('canvas-content');
  if (!canvas || canvas.dataset.inlineWired) return;

  canvas.addEventListener('input', (e) => {
    const element = e.target.closest('[contenteditable="true"]');
    if (!element) return;

    const sectionId = element.getAttribute('data-section-id');
    const fieldPath = element.getAttribute('data-field');
    if (sectionId && fieldPath) {
      updateSectionField(sectionId, fieldPath, element.textContent);
    }
  });

  canvas.addEventListener('keydown', (e) => {
    const element = e.target.closest('[contenteditable="true"]');
    if (!element) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      element.blur();
    }
  });

  canvas.addEventListener('paste', (e) => {
    const element = e.target.closest('[contenteditable="true"]');
    if (!element) return;

    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  canvas.dataset.inlineWired = 'true';
}

/**
 * Wire up image upload via delegation
 */
function wireImageUpload() {
  const canvas = document.getElementById('canvas-content');
  if (!canvas || canvas.dataset.imagesWired) return;

  canvas.addEventListener('click', (e) => {
    const img = e.target.closest('.editable-image');
    if (!img) return;

    const sectionId = img.getAttribute('data-section-id');
    const fieldPath = img.getAttribute('data-field');
    const imageType = img.getAttribute('data-image-type') || 'imageBlock';

    if (sectionId && fieldPath) {
      handleImageUpload(sectionId, fieldPath, img, imageType);
    }
  });

  canvas.dataset.imagesWired = 'true';
}

/**
 * Display site name in navbar
 */
function displaySiteName(name) {
  const siteNameEl = document.getElementById('site-name');
  if (siteNameEl) {
    siteNameEl.textContent = escapeHtml(name || 'Untitled Site');
  }
}

/**
 * Save site content to Supabase
 */
async function saveSiteContent() {
  if (!currentSiteId) return;
  
  // Prevent simultaneous saves
  if (isSaving) return;
  isSaving = true;

  try {
    // Save current page before saving to DB
    pages[currentPage] = currentContent;

    // Get site name from settings input
    const siteTitleInput = document.getElementById('site-title-input');
    const siteName = siteTitleInput?.value?.trim() || currentSiteData.name || 'Untitled Site';

    // Serialize all pages to JSON
    const pagesJson = JSON.stringify(pages);
    const stylesPayload = styles;
    
    const { error } = await withTimeout(
      supabase
        .from('sites')
        .update({ 
          name: siteName,
          pages: pagesJson, 
          styles: stylesPayload 
        })
        .eq('id', currentSiteId)
    );

    if (error) throw error;

    // Update current site data and navbar
    currentSiteData.name = siteName;
    displaySiteName(siteName);

    console.log('Site saved:', { id: currentSiteId, name: siteName });
    markSaved();
    showSaveMessage('Saved successfully!');
  } catch (error) {
    console.error('Error saving site:', error);
    showSaveMessage(error?.message || 'Failed to save. Please try again.', 'error');
  } finally {
    isSaving = false;
  }
}

/**
 * Show save confirmation message
 */
function showSaveMessage(message, type = 'success') {
  const msgEl = document.getElementById('save-message');
  if (!msgEl) return;

  msgEl.textContent = message;
  msgEl.className = `save-message show ${type === 'error' ? 'error' : ''}`;

  setTimeout(() => {
    msgEl?.classList.remove('show');
  }, 2000);
}

/**
 * Wire up Save button
 */
function wireSaveButton() {
  const saveBtn = document.getElementById('save-btn');
  if (!saveBtn) return;

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    await saveSiteContent();
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  });
}

function wireDownloadButton() {
  const downloadBtn = document.getElementById('editor-download');
  if (!downloadBtn) return;

  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.textContent = 'Preparing...';
    await downloadZip();
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download ZIP';
  });
}

/**
 * Wire up Publish button
 */
function wirePublishButton() {
  const publishBtn = document.getElementById('editor-publish');
  if (!publishBtn) return;

  publishBtn.addEventListener('click', () => {
    publishSite();
  });
}

function updatePublishedLink(url) {
  const link = document.getElementById('published-url');
  if (!link) return;

  if (url) {
    link.href = url;
    link.style.display = 'inline-flex';
    link.textContent = 'View Live';
  } else {
    link.removeAttribute('href');
    link.style.display = 'none';
  }
}

async function publishSite() {
  if (!currentSiteId) {
    alert('No site ID found. Please reload and try again.');
    return;
  }

  // Show publishing status
  const statusDiv = document.getElementById('publishStatus');
  const messageEl = document.getElementById('publishMessage');
  const linkEl = document.getElementById('publishedLink');
  
  if (statusDiv) {
    statusDiv.style.display = 'block';
    messageEl.textContent = 'Publishing... Please wait.';
    messageEl.style.color = 'white';
    linkEl.style.display = 'none';
  }

  try {
    // Call the backend /publish endpoint
    const base = (window.PUBLISH_API_BASE || '').trim() ||
      (window.location.port === '8000' ? FALLBACK_PUBLISH_BASE : '');
    const publishUrl = `${base}/publish`;

    console.log(`[Publish] Calling: ${publishUrl} with siteId: ${currentSiteId}`);

    const response = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId: currentSiteId })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Publish failed (${response.status})`);
    }

    const publishedUrl = result.siteUrl;
    if (publishedUrl) {
      // Update the "View Live" link in navbar
      updatePublishedLink(publishedUrl);
      
      // Show success message with link
      if (statusDiv) {
        messageEl.textContent = '✅ Published successfully!';
        messageEl.style.color = 'white';
        linkEl.href = publishedUrl;
        linkEl.textContent = publishedUrl;
        linkEl.style.display = 'inline';
      }
      
      // Also show in save message
      showSaveMessage(`Published! ${publishedUrl}`);
      
      console.log(`[Publish] Success: ${publishedUrl}`);
    } else {
      throw new Error('No published URL returned');
    }
  } catch (error) {
    console.error('Publish error:', error);
    
    // Show error in status area
    if (statusDiv) {
      messageEl.textContent = `❌ Publish failed: ${error.message}`;
      messageEl.style.color = '#ffcccc';
      linkEl.style.display = 'none';
    }
    
    showSaveMessage(`Publish failed: ${error.message}`, 'error');
  }
}

/**
 * Wire up Back button
 */
function wireBackButton() {
  const backBtn = document.getElementById('back-btn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    window.location.href = '/app/dashboard.html';
  });
}

/**
 * Wire up section type buttons
 */
function wireSectionTypeButtons() {
  document.querySelectorAll('.section-type-btn').forEach(btn => {
    btn?.addEventListener('click', () => {
      const sectionType = btn.getAttribute('data-section-type');
      if (sectionType) {
        addSection(sectionType);
      }
    });
  });
}

/**
 * Wire up styles controls (colors, fonts, themes, spacing)
 */
function wireStylesControls() {
  const primaryInput = document.getElementById('primary-color-input');
  if (primaryInput && !primaryInput.dataset.wired) {
    primaryInput.addEventListener('input', (e) => {
      updateStyles({ primaryColor: e.target.value });
      const hexDisplay = document.getElementById('primary-color-hex');
      if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
    });
    primaryInput.dataset.wired = 'true';
  }

  const accentInput = document.getElementById('accent-color-input');
  if (accentInput && !accentInput.dataset.wired) {
    accentInput.addEventListener('input', (e) => {
      updateStyles({ accentColor: e.target.value });
      const hexDisplay = document.getElementById('accent-color-hex');
      if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
    });
    accentInput.dataset.wired = 'true';
  }

  const backgroundInput = document.getElementById('background-color-input');
  if (backgroundInput && !backgroundInput.dataset.wired) {
    backgroundInput.addEventListener('input', (e) => {
      updateStyles({ backgroundColor: e.target.value }, true);
      const hexDisplay = document.getElementById('background-color-hex');
      if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
    });
    backgroundInput.dataset.wired = 'true';
  }

  const textInput = document.getElementById('text-color-input');
  if (textInput && !textInput.dataset.wired) {
    textInput.addEventListener('input', (e) => {
      updateStyles({ textColor: e.target.value }, true);
      const hexDisplay = document.getElementById('text-color-hex');
      if (hexDisplay) hexDisplay.textContent = e.target.value.toUpperCase();
    });
    textInput.dataset.wired = 'true';
  }

  const headingSelect = document.getElementById('heading-font-select');
  if (headingSelect && !headingSelect.dataset.wired) {
    headingSelect.addEventListener('change', (e) => {
      updateStyles({ headingFont: e.target.value }, true);
      const preview = document.getElementById('heading-font-preview');
      if (preview) preview.style.fontFamily = `${e.target.value}, sans-serif`;
    });
    headingSelect.dataset.wired = 'true';
  }

  const bodySelect = document.getElementById('body-font-select');
  if (bodySelect && !bodySelect.dataset.wired) {
    bodySelect.addEventListener('change', (e) => {
      updateStyles({ bodyFont: e.target.value }, true);
      const preview = document.getElementById('body-font-preview');
      if (preview) preview.style.fontFamily = `${e.target.value}, sans-serif`;
    });
    bodySelect.dataset.wired = 'true';
  }

  const borderRadiusInput = document.getElementById('border-radius-input');
  if (borderRadiusInput && !borderRadiusInput.dataset.wired) {
    borderRadiusInput.addEventListener('input', (e) => {
      updateStyles({ borderRadius: e.target.value }, true);
      const valueDisplay = document.getElementById('border-radius-value');
      if (valueDisplay) valueDisplay.textContent = `${e.target.value}px`;
    });
    borderRadiusInput.dataset.wired = 'true';
  }

  const sectionSpacingInput = document.getElementById('section-spacing-input');
  if (sectionSpacingInput && !sectionSpacingInput.dataset.wired) {
    sectionSpacingInput.addEventListener('input', (e) => {
      updateStyles({ sectionSpacing: e.target.value }, true);
      const valueDisplay = document.getElementById('section-spacing-value');
      if (valueDisplay) valueDisplay.textContent = `${e.target.value}px`;
    });
    sectionSpacingInput.dataset.wired = 'true';
  }

  const themePresets = document.getElementById('theme-presets');
  if (themePresets && !themePresets.dataset.wired) {
    themePresets.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-card');
      if (!btn) return;
      const themeKey = btn.dataset.theme;
      applyTheme(themeKey);
    });
    themePresets.dataset.wired = 'true';
  }

  const resetBtn = document.getElementById('reset-styles-btn');
  if (resetBtn && !resetBtn.dataset.wired) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all styles to defaults? This cannot be undone.')) {
        updateStyles({ ...DEFAULT_STYLES }, true);
        showSaveMessage('Styles reset to defaults');
      }
    });
    resetBtn.dataset.wired = 'true';
  }

  // Ensure controls reflect current styles
  syncStyleControls();
}

/**
 * Wire up sidebar tab switching
 */
function wireSidebarTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      if (!tabName) return;

      // Remove active class from all tabs
      tabBtns.forEach(b => b?.classList.remove('active'));
      tabContents.forEach(c => c?.classList.remove('active'));

      // Add active class to clicked tab
      btn.classList.add('active');
      const tabContent = document.getElementById(`${tabName}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Initialize editor on page load
 */
async function initEditor() {
  try {
    // Get siteId from URL
    currentSiteId = getSiteIdFromUrl();
    if (!currentSiteId) {
      alert('No site ID provided. Redirecting to dashboard.');
      return window.location.href = '/app/dashboard.html';
    }

    // Fetch site data
    currentSiteData = await fetchSite(currentSiteId);
    if (!currentSiteData) return;

    // Display site name
    displaySiteName(currentSiteData.name);
    updatePublishedLink(currentSiteData.published_url);

    // Load pages structure (parse JSON if exists, else create default)
    try {
      pages = currentSiteData.pages
        ? JSON.parse(currentSiteData.pages)
        : { home: [] };
      
      // Validate pages is an object
      if (typeof pages !== 'object' || Array.isArray(pages)) {
        console.warn('Invalid pages format, resetting to default');
        pages = { home: [] };
      }

      // Ensure home page exists
      if (!pages.home) {
        pages.home = [];
      }

      // Set current page to home
      currentPage = 'home';
      currentContent = pages[currentPage];
    } catch (error) {
      console.error('Error parsing pages:', error);
      pages = { home: [] };
      currentPage = 'home';
      currentContent = pages[currentPage];
    }

    // Load styles and apply CSS variables
    styles = normalizeStyles(currentSiteData.styles);
    applyStyles(styles);
    syncStyleControls();

    // Load site settings into inputs
    const siteTitleInput = document.getElementById('site-title-input');
    if (siteTitleInput) {
      siteTitleInput.value = currentSiteData.name || '';
      // Update navbar on title input change
      siteTitleInput.addEventListener('input', (e) => {
        displaySiteName(e.target.value || 'Untitled Site');
      });
    }

    // Render pages list
    renderPagesList();

    // Render canvas with home page
    renderCanvas();

    // Wire delegated canvas handlers once (guards prevent rebinding)
    ensureCanvasDelegates();

    // Wire up all buttons and interactions
    wireSaveButton();
    wireDownloadButton();
    wirePublishButton();
    wireBackButton();
    wireSectionTypeButtons();
    wireStylesControls();
    wireSidebarTabs();
    wirePageButtons();
    wireNewFeatures();
  } catch (error) {
    console.error('Error initializing editor:', error);
  }
}

// ========================================
// NEW FEATURES
// ========================================

// History tracking for undo/redo
let history = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

function saveHistory() {
  // Remove any "future" history if we're not at the end
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  
  // Add current state
  const state = {
    pages: JSON.parse(JSON.stringify(pages)),
    currentPage: currentPage,
    styles: JSON.parse(JSON.stringify(styles))
  };
  
  history.push(state);
  
  // Keep history within limit
  if (history.length > MAX_HISTORY) {
    history.shift();
  } else {
    historyIndex++;
  }
  
  updateHistoryButtons();
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    restoreHistory(history[historyIndex]);
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    restoreHistory(history[historyIndex]);
  }
}

function restoreHistory(state) {
  pages = JSON.parse(JSON.stringify(state.pages));
  currentPage = state.currentPage;
  styles = JSON.parse(JSON.stringify(state.styles));
  currentContent = pages[currentPage];
  
  applyStyles(styles);
  renderCanvas();
  renderPagesList();
  updateHistoryButtons();
  markUnsaved();
}

function updateHistoryButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  
  if (undoBtn) undoBtn.disabled = historyIndex <= 0;
  if (redoBtn) redoBtn.disabled = historyIndex >= history.length - 1;
}

// Template loading
const templates = {
  landing: [
    { type: 'hero', data: { title: 'Launch Your Product', subtitle: 'The best solution for your business needs' } },
    { type: 'features', data: { features: [
      { icon: '⚡', title: 'Fast', description: 'Lightning quick performance' },
      { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
      { icon: '📱', title: 'Responsive', description: 'Works on all devices' }
    ]}},
    { type: 'pricing', data: { plans: [
      { name: 'Basic', price: '$9/mo', features: ['10 Projects', 'Basic Support'] },
      { name: 'Pro', price: '$29/mo', features: ['Unlimited Projects', 'Priority Support', 'Advanced Features'] }
    ]}},
    { type: 'contact', data: { title: 'Get Started Today' } }
  ],
  portfolio: [
    { type: 'hero', data: { title: 'Creative Portfolio', subtitle: 'Showcasing my work' } },
    { type: 'image', data: { url: 'https://via.placeholder.com/1200x800?text=Project+1', alt: 'Project 1' } },
    { type: 'image', data: { url: 'https://via.placeholder.com/1200x800?text=Project+2', alt: 'Project 2' } },
    { type: 'contact', data: { title: 'Let\'s Work Together' } }
  ],
  business: [
    { type: 'hero', data: { title: 'Your Business Name', subtitle: 'Professional services you can trust' } },
    { type: 'features', data: { features: [
      { icon: '🎯', title: 'Strategy', description: 'Data-driven approach' },
      { icon: '💼', title: 'Consulting', description: 'Expert guidance' },
      { icon: '📈', title: 'Growth', description: 'Scalable solutions' }
    ]}},
    { type: 'contact', data: { title: 'Schedule a Consultation' } }
  ]
};

window.loadTemplate = loadTemplate;
async function loadTemplate(templateName) {
  let templateSections = null;
  if (templates[templateName]) {
    templateSections = templates[templateName];
  } else {
    // Try to fetch from /templates-data/<id>.json
    try {
      const res = await fetch(`/templates-data/${templateName}.json`);
      if (res.ok) {
        const json = await res.json();
        templateSections = json.sections;
      }
    } catch (e) {
      alert('Failed to load template: ' + e.message);
      return;
    }
  }
  if (!templateSections) {
    alert('Template not found.');
    return;
  }
  if (!confirm(`Load ${templateName} template? This will replace all sections on the current page.`)) {
    return;
  }
  saveHistory();
  currentContent = templateSections.map(template => ({
    id: generateSectionId(),
    type: template.type,
    data: JSON.parse(JSON.stringify(template.data))
  }));
  pages[currentPage] = currentContent;
  renderCanvas();
  markUnsaved();
}

// Viewport switching
function setViewport(viewport) {
  const canvas = document.getElementById('canvas-content');
  const viewportBtns = document.querySelectorAll('.viewport-btn');
  
  if (!canvas) return;
  
  canvas.dataset.viewport = viewport;
  
  // Update active button
  viewportBtns.forEach(btn => {
    if (btn.dataset.viewport === viewport) {
      btn.classList.add('active');
      btn.style.border = '2px solid #667eea';
      btn.style.background = '#667eea';
      btn.style.color = 'white';
    } else {
      btn.classList.remove('active');
      btn.style.border = '2px solid #e5e7eb';
      btn.style.background = 'white';
      btn.style.color = '#1f2937';
    }
  });
  
  // Apply viewport styles
  switch (viewport) {
    case 'mobile':
      canvas.style.maxWidth = '375px';
      canvas.style.margin = '0 auto';
      break;
    case 'tablet':
      canvas.style.maxWidth = '768px';
      canvas.style.margin = '0 auto';
      break;
    default:
      canvas.style.maxWidth = '100%';
      canvas.style.margin = '0';
  }
}

// SEO settings storage (per-page)
let seoSettings = {};

function saveSEOSettings() {
  const pageKey = currentPage;
  
  seoSettings[pageKey] = {
    title: document.getElementById('seo-title-input')?.value || '',
    description: document.getElementById('seo-description-input')?.value || '',
    keywords: document.getElementById('seo-keywords-input')?.value || '',
    favicon: document.getElementById('seo-favicon-input')?.value || '',
    analytics: document.getElementById('seo-analytics-input')?.value || ''
  };
  
  // Store in localStorage
  localStorage.setItem(`seo-${currentSiteId}`, JSON.stringify(seoSettings));
  
  showSaveMessage('SEO settings saved!');
}

function loadSEOSettings() {
  const stored = localStorage.getItem(`seo-${currentSiteId}`);
  if (stored) {
    seoSettings = JSON.parse(stored);
  }
  
  const pageKey = currentPage;
  const pageSEO = seoSettings[pageKey] || {};
  
  const titleInput = document.getElementById('seo-title-input');
  const descInput = document.getElementById('seo-description-input');
  const keywordsInput = document.getElementById('seo-keywords-input');
  const faviconInput = document.getElementById('seo-favicon-input');
  const analyticsInput = document.getElementById('seo-analytics-input');
  
  if (titleInput) titleInput.value = pageSEO.title || '';
  if (descInput) descInput.value = pageSEO.description || '';
  if (keywordsInput) keywordsInput.value = pageSEO.keywords || '';
  if (faviconInput) faviconInput.value = pageSEO.favicon || '';
  if (analyticsInput) analyticsInput.value = pageSEO.analytics || '';
}

// Wire up new feature handlers
function wireNewFeatures() {
  // Undo/Redo buttons
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', undo);
  }
  if (redoBtn) {
    redoBtn.addEventListener('click', redo);
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redo();
    }
  });
  
  // Viewport buttons
  const viewportBtns = document.querySelectorAll('.viewport-btn');
  viewportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setViewport(btn.dataset.viewport);
    });
  });
  
  // Template buttons
  const templateBtns = document.querySelectorAll('.template-btn');
  templateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      loadTemplate(btn.dataset.template);
    });
  });
  
  // SEO save button
  const saveSEOBtn = document.getElementById('save-seo-btn');
  if (saveSEOBtn) {
    saveSEOBtn.addEventListener('click', saveSEOSettings);
  }
  
  // Load SEO settings when switching pages
  loadSEOSettings();
  
  // Initialize history with current state
  saveHistory();
}

// Override existing functions to include history tracking
const originalAddSection = addSection;
addSection = function(type) {
  saveHistory();
  return originalAddSection(type);
};

const originalDeleteSection = deleteSection;
deleteSection = function(sectionId) {
  saveHistory();
  return originalDeleteSection(sectionId);
};

const originalMoveSectionUp = moveSectionUp;
moveSectionUp = function(sectionId) {
  saveHistory();
  return originalMoveSectionUp(sectionId);
};

const originalMoveSectionDown = moveSectionDown;
moveSectionDown = function(sectionId) {
  saveHistory();
  return originalMoveSectionDown(sectionId);
};

// Initialize on DOM ready

document.addEventListener('DOMContentLoaded', () => {
  initEditor();
});

