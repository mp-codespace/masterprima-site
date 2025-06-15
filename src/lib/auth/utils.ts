// src/lib/auth/utils.ts

import { createHash, randomBytes, pbkdf2Sync } from 'crypto'

export interface AdminUser {
  id: string
  username: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

// Password hashing using PBKDF2
export const hashPassword = (password: string): string => {
  const salt = randomBytes(32).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

// More robust password verification
export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  try {
    // Ensure the stored password is in the expected "salt:hash" format.
    if (!hashedPassword || !hashedPassword.includes(':')) {
      console.error("Invalid hashed password format. Expected 'salt:hash'.");
      return false;
    }

    const [salt, hash] = hashedPassword.split(':');
    
    // Ensure both parts exist after splitting.
    if (!salt || !hash) {
      console.error("Invalid hashed password format. Salt or hash is missing.");
      return false;
    }

    const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    console.error("Error during password verification:", e);
    return false;
  }
}

// Session management
export const generateSessionToken = (): string => {
  return randomBytes(32).toString('hex')
}

export const hashSessionToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex')
}

// Validation functions
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const validatePassword = (password: string): boolean => {
  // Minimal 8 characters, at least 1 letter and 1 number
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// JWT-like token for session (simple implementation)
export const createSessionPayload = (user: AdminUser): string => {
  const payload = {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
 
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

export const verifySessionPayload = (token: string): AdminUser | null => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))
   
    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
   
    return {
      id: payload.id,
      username: payload.username,
      is_admin: payload.is_admin,
      created_at: '', // Payload doesn't need to carry this
      updated_at: ''  // Payload doesn't need to carry this
    }
  } catch {
    return null
  }
}
