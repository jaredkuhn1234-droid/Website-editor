import { supabase } from '../backend/supabase.js';

import { logout } from '../backend/auth.js';
import { getThumbnailForSite } from './dashboard-thumbnails.js';

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
 * Check if user is logged in, redirect to login if not
 */
async function enforceAuth() {
  try {
    const { data, error } = await withTimeout(supabase.auth.getSession());
    if (error) throw error;
    
    const session = data?.session;
    if (!session) {
      return window.location.href = '/app/login.html';
    }
    return session;
  } catch (error) {
    console.error('Auth check failed:', error);
    return window.location.href = '/app/login.html';
  }
}

/**
 * Display user email in the navbar
 */
function displayUserEmail(email) {
  const userEmailEl = document.getElementById('user-email');
  if (userEmailEl && email) {
    userEmailEl.textContent = email || 'User';
  }
}

/**
 * Wire up the logout button
 */
function wireLogout() {
  const logoutBtn = document.querySelector('[data-logout]') || document.getElementById('logout-btn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    logoutBtn.disabled = true;
    const { error } = await logout();
    if (error) {
      console.error('Logout failed:', error);
      alert('Failed to log out. Please try again.');
      logoutBtn.disabled = false;
      return;
    }
    window.location.href = '/app/login.html';
  });
}

/**
 * Sanitize HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Delete a site with confirmation
 */
async function deleteSite(siteId, siteName, deleteBtn) {
  const confirmed = confirm(`Are you sure you want to delete "${siteName}"? This cannot be undone.`);
  if (!confirmed) return;

  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Deleting...';

  try {
    const { error } = await withTimeout(
      supabase.from('sites').delete().eq('id', siteId)
    );
    if (error) throw error;
    
    // Remove the card from DOM
    deleteBtn.closest('.site-card')?.remove();
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete site. Please try again.');
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Delete';
  }
}

/**
 * Load user's sites from Supabase database
 */
async function loadUserSites(userId) {
  const sitesListEl = document.getElementById('sites-list');
  if (!sitesListEl) return;

  try {
    // Fetch sites for current user
    const { data: sites, error } = await withTimeout(
      supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    );

    if (error) throw error;

    // Render 'New Project' card first
    sitesListEl.innerHTML = '';
    const newCard = document.createElement('div');
    newCard.className = 'site-card new-site-card';
    newCard.innerHTML = `
      <div class="site-card-header">
        <h3 class="site-card-title">+ New Project</h3>
      </div>
      <div class="site-card-thumbnail new-site-thumb">
        <img src="../assets/images/site-thumb-default.png" alt="New site" />
      </div>
      <div class="site-card-actions">
        <button class="btn-small btn-open" id="new-site-btn">Create</button>
      </div>
    `;
    newCard.querySelector('#new-site-btn').addEventListener('click', showModal);
    sitesListEl.appendChild(newCard);

    // Show empty state if no sites
    if (!sites || sites.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `
        <h2>No sites yet</h2>
        <p>Create your first site to get started.</p>
      `;
      sitesListEl.appendChild(empty);
      return;
    }

    // Render site cards with thumbnails
    sites.forEach(site => {
      if (!site?.id || !site?.name) return; // Skip invalid sites

      const card = document.createElement('div');
      card.className = 'site-card';

      const createdDate = new Date(site.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const safeName = escapeHtml(site.name);
      card.innerHTML = `
        <div class="site-card-header">
          <h3 class="site-card-title">${safeName}</h3>
        </div>
        <div class="site-card-thumbnail" id="site-thumb-${site.id}"></div>
        <p class="site-card-date">Created ${createdDate}</p>
        <div class="site-card-actions">
          <button class="btn-small btn-open" data-site-id="${site.id}">Open</button>
          <button class="btn-small btn-delete" data-site-id="${site.id}">Delete</button>
        </div>
      `;
      // Render live preview or thumbnail
      setTimeout(() => {
        const thumbContainer = card.querySelector(`#site-thumb-${site.id}`);
        if (thumbContainer) {
          getThumbnailForSite(site, thumbContainer);
        }
      }, 0);

      // Wire up Open button
      const openBtn = card.querySelector('.btn-open');
      if (openBtn) {
        openBtn.addEventListener('click', () => {
          window.location.href = `/editor/editor.html?siteId=${site.id}`;
        });
      }

      // Wire up Delete button
      const deleteBtn = card.querySelector('.btn-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          deleteSite(site.id, site.name, deleteBtn);
        });
      }

      sitesListEl.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading sites:', error);
    sitesListEl.innerHTML = `
      <div class="empty-state">
        <h2>Error loading sites</h2>
        <p>${escapeHtml(error?.message || 'Please refresh the page and try again.')}</p>
      </div>
    `;
  }
}

/**
 * Show/hide modal
 */
function showModal() {
  const modal = document.getElementById('create-site-modal');
  if (modal) modal.classList.add('active');
}

function hideModal() {
  const modal = document.getElementById('create-site-modal');
  if (modal) {
    modal.classList.remove('active');
    const nameInput = document.getElementById('site-name');
    if (nameInput) nameInput.value = '';
    const messageEl = document.getElementById('modal-message');
    if (messageEl) messageEl.style.display = 'none';
  }
}

/**
 * Handle "Create New Site" button and modal
 */
function wireCreateSiteModal(userId) {
  const createBtn = document.getElementById('create-site-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const form = document.getElementById('create-site-form');
  const messageEl = document.getElementById('modal-message');
  let isCreating = false;

  // Open modal
  if (createBtn) {
    createBtn.addEventListener('click', showModal);
  }

  // Close modal
  if (closeBtn) closeBtn.addEventListener('click', hideModal);
  if (cancelBtn) cancelBtn.addEventListener('click', hideModal);

  // Close modal when clicking outside
  const modal = document.getElementById('create-site-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) hideModal();
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Prevent double submission
      if (isCreating) return;
      isCreating = true;

      if (messageEl) messageEl.style.display = 'none';

      const nameInput = document.getElementById('site-name');
      if (!nameInput) {
        isCreating = false;
        return;
      }

      const siteName = nameInput.value.trim();
      if (!siteName) {
        if (messageEl) {
          messageEl.textContent = 'Please enter a site name.';
          messageEl.className = 'modal-message error';
        }
        isCreating = false;
        return;
      }

      try {
        // Create new site in Supabase
        const { data, error } = await withTimeout(
          supabase
            .from('sites')
            .insert([{ user_id: userId, name: siteName }])
            .select()
            .single()
        );

        if (error) throw error;

        if (!data?.id) throw new Error('Site creation failed - no ID returned');

        // Success - redirect to editor
        if (messageEl) {
          messageEl.textContent = 'Site created! Redirecting...';
          messageEl.className = 'modal-message success';
        }
        
        setTimeout(() => {
          window.location.href = `/editor/editor.html?siteId=${data.id}`;
        }, 600);
      } catch (error) {
        console.error('Error creating site:', error);
        if (messageEl) {
          messageEl.textContent = error?.message || 'Failed to create site. Please try again.';
          messageEl.className = 'modal-message error';
        }
        isCreating = false;
      }
    });
  }
}

/**
 * Listen for auth state changes (continuous session validation)
 */
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session && window.location.pathname !== '/app/login.html' && window.location.pathname !== '/app/signup.html') {
    console.warn('Session expired, redirecting to login');
    window.location.href = '/app/login.html';
  }
});

/**
 * Initialize dashboard
 */
document.addEventListener('DOMContentLoaded', async () => {
  const session = await enforceAuth();
  if (!session?.user?.id) return;
  
  const userId = session.user.id;
  const userEmail = session.user.email;
  
  if (userEmail) {
    displayUserEmail(userEmail);
  }
  
  wireLogout();
  wireCreateSiteModal(userId);
  await loadUserSites(userId);

  // Refresh sites when page becomes visible (e.g., returning from editor)
  document.addEventListener('visibilitychange', async () => {
    if (!document.hidden) {
      const currentSession = await supabase.auth.getSession();
      if (currentSession?.data?.session?.user?.id) {
        await loadUserSites(currentSession.data.session.user.id);
      }
    }
  });

  // Also refresh on window focus as a backup
  window.addEventListener('focus', async () => {
    const currentSession = await supabase.auth.getSession();
    if (currentSession?.data?.session?.user?.id) {
      await loadUserSites(currentSession.data.session.user.id);
    }
  });
});
