// src/lib/auth/utils.ts (Enhanced version)
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string
  username: string
  email?: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Enhanced password hashing using bcrypt
export const hashPassword = (password: string): string => {
  const saltRounds = 12; // Higher salt rounds for better security
  return bcrypt.hashSync(password, saltRounds);
}

// Enhanced password verification
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    return bcrypt.compareSync(password, hashedPassword);
  } catch (error) {
    console.error("Error during password verification:", error);
    return false;
  }
}

// Username validation - more comprehensive
export const validateUsername = (username: string): boolean => {
  if (!username || typeof username !== 'string') return false;
  
  // Remove whitespace and convert to lowercase for validation
  const cleanUsername = username.trim().toLowerCase();
  
  // Check length (3-20 characters)
  if (cleanUsername.length < 3 || cleanUsername.length > 20) return false;
  
  // Check format: only letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(cleanUsername)) return false;
  
  // Additional rules: cannot start with underscore or number
  if (cleanUsername.startsWith('_') || /^[0-9]/.test(cleanUsername)) return false;
  
  // Reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'root', 'system', 'user', 'guest', 
    'public', 'private', 'api', 'www', 'mail', 'email', 'support',
    'help', 'info', 'contact', 'service', 'master', 'owner'
  ];
  
  if (reservedUsernames.includes(cleanUsername)) return false;
  
  return true;
}

// Enhanced password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Maximum length check (prevent DOS attacks)
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters long');
  }
  
  // Character requirements
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Optional: Special character requirement (uncomment if needed)
  // if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
  //   errors.push('Password must contain at least one special character');
  // }
  
  // Check for common weak patterns
  const weakPatterns = [
    /^password/i, /^123456/, /^qwerty/i, /^admin/i, 
    /^letmein/i, /^welcome/i, /^monkey/i, /^dragon/i
  ];
  
  if (weakPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password is too common, please choose a stronger password');
  }
  
  // Check for sequential characters
  if (/123456|abcdef|qwerty/i.test(password)) {
    errors.push('Password should not contain sequential characters');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Email validation
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic format check
  if (!emailRegex.test(trimmedEmail)) return false;
  
  // Length checks
  if (trimmedEmail.length > 254) return false; // RFC 5321
  
  // Local part (before @) should be max 64 characters
  const [localPart] = trimmedEmail.split('@');
  if (localPart.length > 64) return false;
  
  return true;
}

// Generate secure session token
export const generateSessionToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create JWT-like session payload
export const createSessionPayload = (user: AdminUser): string => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.is_admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    version: '1.0' // For future compatibility
  }
 
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

// Verify session payload
export const verifySessionPayload = (token: string): AdminUser | null => {
  try {
    if (!token || typeof token !== 'string') return null;
    
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
   
    // Check required fields
    if (!payload.id || !payload.username || typeof payload.is_admin !== 'boolean') {
      return null;
    }
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
   
    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      is_admin: payload.is_admin,
      created_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : '',
      updated_at: payload.iat ? new Date(payload.iat * 1000).toISOString() : ''
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

// Rate limiting helper
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      const resetTime = now + windowMs;
      attempts.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }
    
    if (userAttempts.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: userAttempts.resetTime };
    }
    
    userAttempts.count++;
    return { 
      allowed: true, 
      remaining: maxRequests - userAttempts.count, 
      resetTime: userAttempts.resetTime 
    };
  };
}

// Password strength checker (for frontend)
export const checkPasswordStrength = (password: string): {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return { score: 0, feedback: ['Password is required'] };
  }
  
  // Length scoring
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  // Feedback messages
  if (password.length < 8) feedback.push('Use at least 8 characters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Add special characters (!@#$%^&* etc.)');
  }
  
  // Adjust score based on common patterns
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }
  
  if (score > 4) score = 4; // Cap at maximum
  
  return { score, feedback };
}

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .substring(0, 500); // Limit length
}