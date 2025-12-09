import { supabase } from './supabase.js';

const PASSWORD_MIN_LENGTH = 6;
const REQUEST_TIMEOUT_MS = 15000; // 15 second timeout

/**
 * Validate email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password meets minimum requirements
 */
function validatePassword(password) {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` };
  }
  return { valid: true };
}

/**
 * Create a timeout promise for network requests
 */
function createTimeoutPromise(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout - please check your connection and try again')), ms)
  );
}

/**
 * Race a promise against a timeout
 */
function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  return Promise.race([promise, createTimeoutPromise(ms)]);
}

/**
 * Sign up a user with email and password
 */
export async function signup(email, password) {
  // Validate inputs
  const trimmedEmail = email?.trim();
  if (!trimmedEmail) {
    return { data: null, error: new Error('Email is required') };
  }
  if (!validateEmail(trimmedEmail)) {
    return { data: null, error: new Error('Please enter a valid email address') };
  }
  
  const validation = validatePassword(password);
  if (!validation.valid) {
    return { data: null, error: new Error(validation.message) };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({ email: trimmedEmail, password })
    );
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Signup error:', error);
    return { data: null, error };
  }
}

/**
 * Log in a user with email and password
 */
export async function login(email, password) {
  // Validate inputs
  const trimmedEmail = email?.trim();
  if (!trimmedEmail) {
    return { data: null, error: new Error('Email is required') };
  }
  if (!password) {
    return { data: null, error: new Error('Password is required') };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({ email: trimmedEmail, password })
    );
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Login error:', error);
    return { data: null, error };
  }
}

/**
 * Log out the current user
 */
export async function logout() {
  try {
    const { error } = await withTimeout(supabase.auth.signOut());
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Logout error:', error);
    return { error };
  }
}
