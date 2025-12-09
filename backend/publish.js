// Backend publishing module - fully synchronous publish flow
// No queues, no workers, no background tasks

import { createClient } from '@supabase/supabase-js';

/**
 * Configuration object - all environment variables in one place
 */
const config = {
  netlifyToken: process.env.NETLIFY_AUTH_TOKEN || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
};

/**
 * Validate configuration and return errors
 */
function validateConfig() {
  const errors = [];
  
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    errors.push('Error: Supabase environment variables missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }
  
  if (!config.netlifyToken) {
    errors.push('Error: NETLIFY_AUTH_TOKEN not set. Deployment will fail.');
  }
  
  return errors;
}

/**
 * Get Supabase client - only created when config is valid
 */
function getSupabaseClient() {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    return null;
  }
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const str = String(text || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert editor sections format to elements format for HTML generation
 * @param {Array} sections - Array of section objects with { id, type, data }
 * @returns {Array} Array of elements with { tag, content, styles }
 */
function convertEditorSectionsToElements(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const elements = [];
  for (const section of sections) {
    if (!section || !section.type) continue;

    const sectionType = section.type.toLowerCase();
    const data = section.data || {};

    switch (sectionType) {
      case 'hero':
        // Hero section - matches editor .hero-section styling
        const heroImg = data.imageUrl || 'https://via.placeholder.com/1200x600?text=Hero+Image';
        elements.push({
          tag: 'section',
          content: `<div style="position: relative; min-height: 400px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9)), url('${escapeHtml(heroImg)}'); background-size: cover; background-position: center; padding: 80px 20px;"><div style="position: relative; z-index: 2; text-align: center; max-width: 800px;"><h1 style="font-size: 48px; font-weight: 700; color: white; margin: 0 0 20px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${escapeHtml(data.title || 'Welcome')}</h1><p style="font-size: 20px; color: rgba(255,255,255,0.95); margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${escapeHtml(data.subtitle || '')}</p></div></div>`,
          styles: {}
        });
        break;

      case 'text':
        // Text section - matches editor .text-section styling
        elements.push({
          tag: 'section',
          content: `<div style="padding: 60px 20px; max-width: 800px; margin: 0 auto;"><p style="font-size: 18px; line-height: 1.8; margin: 0; color: #333;">${escapeHtml(data.content || '')}</p></div>`,
          styles: {}
        });
        break;

      case 'image':
        // Image section - matches editor .image-section styling
        const imageUrl = data.url || data.imageUrl || 'https://via.placeholder.com/800x400?text=Image';
        elements.push({
          tag: 'section',
          content: `<div style="padding: 40px 20px; text-align: center;"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(data.alt || 'Image')}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>`,
          styles: {}
        });
        break;

      case 'features':
        // Features section - matches editor .features-section styling
        const featuresList = Array.isArray(data.features) ? data.features : [];
        let featuresHtml = `<div style="padding: 60px 20px; max-width: 1200px; margin: 0 auto;"><h2 style="font-size: 36px; font-weight: 700; text-align: center; margin: 0 0 50px 0; color: #1a1a1a;">Features</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">`;
        for (const feature of featuresList) {
          featuresHtml += `<div style="padding: 30px; background: white; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s;"><div style="font-size: 32px; margin-bottom: 15px;">${escapeHtml(feature.icon || '✓')}</div><h4 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${escapeHtml(feature.title || '')}</h4><p style="margin: 0; font-size: 15px; line-height: 1.6; color: #6b7280;">${escapeHtml(feature.description || '')}</p></div>`;
        }
        featuresHtml += '</div></div>';
        elements.push({
          tag: 'section',
          content: featuresHtml,
          styles: {}
        });
        break;

      case 'pricing':
        // Pricing section - matches editor .pricing-section styling
        const plansList = Array.isArray(data.plans) ? data.plans : [];
        let pricingHtml = `<div style="padding: 60px 20px; max-width: 1200px; margin: 0 auto;"><h2 style="font-size: 36px; font-weight: 700; text-align: center; margin: 0 0 50px 0; color: #1a1a1a;">Pricing</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">`;
        for (const plan of plansList) {
          const features = Array.isArray(plan.features) ? plan.features : [];
          let featuresList = features.map(f => `<li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; list-style: none;"><span style="color: #10b981; margin-right: 8px;">✓</span><span style="color: #4b5563;">${escapeHtml(f || '')}</span></li>`).join('');
          pricingHtml += `<div style="padding: 40px 30px; background: white; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);"><h3 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">${escapeHtml(plan.name || '')}</h3><div style="font-size: 48px; font-weight: 700; color: #667eea; margin: 20px 0;">${escapeHtml(plan.price || '$0')}</div><ul style="padding: 0; margin: 30px 0; text-align: left;">${featuresList}</ul><button style="width: 100%; padding: 14px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Choose Plan</button></div>`;
        }
        pricingHtml += '</div></div>';
        elements.push({
          tag: 'section',
          content: pricingHtml,
          styles: {}
        });
        break;

      case 'contact':
        // Contact section - matches editor .contact-section styling
        elements.push({
          tag: 'section',
          content: `<div style="padding: 60px 20px; background: linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%);"><div style="max-width: 600px; margin: 0 auto;"><h2 style="font-size: 36px; font-weight: 700; text-align: center; margin: 0 0 40px 0; color: #1a1a1a;">${escapeHtml(data.title || 'Get in Touch')}</h2><form style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"><input type="text" placeholder="Your Name" style="width: 100%; padding: 14px 16px; margin-bottom: 16px; border: 2px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; font-size: 15px; transition: border-color 0.2s;"><input type="email" placeholder="Your Email" style="width: 100%; padding: 14px 16px; margin-bottom: 16px; border: 2px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; font-size: 15px; transition: border-color 0.2s;"><textarea placeholder="Your Message" style="width: 100%; padding: 14px 16px; margin-bottom: 20px; border: 2px solid #e5e7eb; border-radius: 8px; box-sizing: border-box; min-height: 140px; font-size: 15px; font-family: inherit; transition: border-color 0.2s; resize: vertical;"></textarea><button type="submit" style="width: 100%; padding: 14px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;">Send Message</button></form></div></div>`,
          styles: {}
        });
        break;

      default:
        // Unknown section type - just create a generic div
        elements.push({
          tag: 'section',
          content: `<div style="padding: 20px; background: #f0f0f0;"><p style="margin: 0; color: #666;">[Section type: ${escapeHtml(sectionType)}]</p></div>`,
          styles: {}
        });
    }
  }

  return elements;
}

/**
 * Generate HTML for a single page
 * @param {Object} page - Page data with elements
 * @param {Object} styles - Global styles
 * @param {string} siteName - Site name
 * @returns {string} Complete HTML document
 */
function generateHTMLPage(page, styles, siteName) {
  const elements = page.elements || [];
  
  // Generate body content from elements
  let bodyContent = '';
  for (const el of elements) {
    const tag = el.tag || 'div';
    const content = el.content || ''; // Don't escape - content is already HTML
    const inlineStyles = el.styles ? Object.entries(el.styles).map(([k, v]) => `${k}: ${v}`).join('; ') : '';
    const styleAttr = inlineStyles ? ` style="${inlineStyles}"` : '';
    bodyContent += `<${tag}${styleAttr}>${content}</${tag}>\n`;
  }

  // Additive: Gallery section renderer
  function renderGallerySection(section) {
    const images = (section.images || []).map(img => `<img src='${img}' alt='Gallery image' style='width:100%;border-radius:${section.style?.borderRadius||'8px'};margin-bottom:${section.style?.gap||'16px'};'>`).join('');
    return `<div class='gallery-section' style='display:grid;grid-template-columns:repeat(${section.columns||3},1fr);gap:${section.style?.gap||'16px'};'>${images}</div>`;
  }

  // Additive: Stats-strip section renderer
  function renderStatsStripSection(section) {
    const stats = (section.stats || []).map(stat => `<div class='stat-item' style='text-align:center;'><div style='font-size:2rem;'>${stat.number}</div><div style='font-size:1rem;'>${stat.label}</div></div>`).join('');
    return `<div class='stats-strip-section' style='background:${section.style?.background||'#f8fafc'};color:${section.style?.color||'#1e293b'};font-weight:${section.style?.fontWeight||'bold'};border-radius:${section.style?.borderRadius||'10px'};padding:${section.style?.padding||'32px 0'};display:flex;justify-content:space-around;align-items:center;'>${stats}</div>`;
  }

  // Generate CSS from styles object
  let cssContent = '';
  if (styles && typeof styles === 'object') {
    for (const [selector, rules] of Object.entries(styles)) {
      if (rules && typeof rules === 'object') {
        cssContent += `${selector} {\n`;
        for (const [prop, value] of Object.entries(rules)) {
          cssContent += `  ${prop}: ${value};\n`;
        }
        cssContent += `}\n`;
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title || siteName)}</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
    ${cssContent}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

/**
 * Deploy files to Netlify
 * @param {Object} files - Map of filename to content
 * @param {string} siteName - Site name for Netlify site
 * @returns {Promise<Object>} Deploy result with URL
 */
async function deployToNetlify(files, siteName) {
  if (!config.netlifyToken) {
    throw new Error('Error: NETLIFY_AUTH_TOKEN not set. Deployment will fail.');
  }

  // Generate unique site name
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const netlifyName = `${siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${randomSuffix}`;

  console.log(`[Deploy] Creating Netlify site: ${netlifyName}`);

  try {
    // Step 1: Create the site
    const createSiteResponse = await fetch('https://api.netlify.com/api/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.netlifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: netlifyName
      })
    });

    if (!createSiteResponse.ok) {
      const errorText = await createSiteResponse.text();
      throw new Error(`Failed to create Netlify site (${createSiteResponse.status}): ${errorText}`);
    }

    const siteData = await createSiteResponse.json();
    const siteId = siteData.id;
    
    console.log(`[Deploy] Site created with ID: ${siteId}`);

    // Step 2: Create a deploy with files as a zip
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip();

    for (const [filename, content] of Object.entries(files)) {
      zip.addFile(filename, Buffer.from(content));
    }

    const zipBuffer = zip.toBuffer();

    const deployResponse = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.netlifyToken}`,
        'Content-Type': 'application/zip'
      },
      body: zipBuffer
    });

    if (!deployResponse.ok) {
      const errorText = await deployResponse.text();
      throw new Error(`Netlify deployment failed (${deployResponse.status}): ${errorText}`);
    }

    const deployData = await deployResponse.json();
    
    const siteUrl = deployData.ssl_url || deployData.url || `https://${siteData.subdomain}.netlify.app`;
    
    console.log(`[Deploy] Success! Site URL: ${siteUrl}`);
    
    return {
      deployId: deployData.id,
      siteUrl: siteUrl,
      adminUrl: siteData.admin_url
    };
  } catch (error) {
    console.error('[Deploy] Netlify error:', error);
    throw new Error(`Netlify deployment failed: ${error.message}`);
  }
}

/**
 * Main publish function - fully synchronous
 * @param {string} siteId - UUID of the site to publish
 * @returns {Promise<Object>} Result with siteUrl and deployId
 */
export async function publishSite(siteId) {
  console.log(`[Publish] Starting publish for site: ${siteId}`);

  // Validate configuration
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    throw new Error(configErrors.join('\n'));
  }

  // Get Supabase client
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Error: Supabase environment variables missing.');
  }

  // 1. Fetch site from Supabase
  console.log('[Publish] Fetching site data from Supabase...');
  const { data: site, error: fetchError } = await supabase
    .from('sites')
    .select('name, pages, styles')
    .eq('id', siteId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch site from Supabase: ${fetchError.message}`);
  }

  if (!site) {
    throw new Error(`Site not found: ${siteId}`);
  }

  // Parse pages - editor stores as JSON string with format: { pageName: [sections] }
  let pagesData;
  try {
    if (typeof site.pages === 'string') {
      pagesData = JSON.parse(site.pages);
    } else {
      pagesData = site.pages || {};
    }
  } catch (parseError) {
    throw new Error(`Invalid pages format in Supabase: ${parseError.message}`);
  }

  if (!pagesData || typeof pagesData !== 'object' || Object.keys(pagesData).length === 0) {
    throw new Error('Site has no pages to publish');
  }

  console.log(`[Publish] Found site: ${site.name} with ${Object.keys(pagesData).length} page(s)`);

  // 2. Generate HTML files for each page
  const files = {};
  
  for (const [pageName, sections] of Object.entries(pagesData)) {
    let filename;
    
    if (pageName.toLowerCase() === 'home') {
      filename = 'index.html';
    } else {
      filename = `${pageName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
    }

    console.log(`[Publish] Generating ${filename} from ${Array.isArray(sections) ? sections.length : 0} section(s)...`);
    
    // Convert editor format (array of sections) to page format expected by generateHTMLPage
    const page = {
      title: pageName,
      name: pageName,
      elements: convertEditorSectionsToElements(sections)
    };
    
    files[filename] = generateHTMLPage(page, site.styles, site.name);
  }


  console.log(`[Publish] Generated ${Object.keys(files).length} HTML file(s)`);

  // 3. Deploy to Netlify
  console.log('[Publish] Deploying to Netlify...');
  const deployResult = await deployToNetlify(files, site.name);

  // 4. Update Supabase with published URL and timestamp
  console.log('[Publish] Updating Supabase with published URL...');
  const { error: updateError } = await supabase
    .from('sites')
    .update({
      published_url: deployResult.siteUrl,
      published_at: new Date().toISOString()
    })
    .eq('id', siteId);

  if (updateError) {
    console.error('[Publish] Warning: Failed to update Supabase:', updateError.message);
    // Don't throw - deployment succeeded, just logging failed
  }

  console.log(`[Publish] ✓ Complete! Published to: ${deployResult.siteUrl}`);

  // 5. Return result to caller
  return {
    siteUrl: deployResult.siteUrl,
    deployId: deployResult.deployId
  };
}
