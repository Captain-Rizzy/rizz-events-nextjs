import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from './_core/env';

export interface AdminJWTPayload {
  adminId: number;
  username: string;
  iat: number;
  exp: number;
}

/**
 * Hash a password using bcrypt-like approach with crypto
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}$${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split('$');
  if (!salt || !storedHash) return false;

  const derivedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');

  return derivedHash === storedHash;
}

/**
 * Generate a JWT token for admin
 */
export function generateAdminToken(adminId: number, username: string): string {
  const payload: AdminJWTPayload = {
    adminId,
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  };

  return jwt.sign(payload, ENV.jwtSecret, { algorithm: 'HS256' });
}

/**
 * Verify and decode a JWT token
 */
export function verifyAdminToken(token: string): AdminJWTPayload | null {
  try {
    const decoded = jwt.verify(token, ENV.jwtSecret, {
      algorithms: ['HS256'],
    }) as AdminJWTPayload;
    return decoded;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a unique booking code
 */
export function generateBookingCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${timestamp}-${random}`;
}
