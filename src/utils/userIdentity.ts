/**
 * userIdentity.ts
 * 
 * Manages permanent player identity using:
 * - Firebase RTDB for globally unique username enforcement (atomic transactions)
 * - 4-digit PIN (SHA-256 hashed) for cross-device identity recovery
 * - localStorage for local caching of the current identity
 */

import { db } from './firebase';
import { ref, get, set, runTransaction } from 'firebase/database';
import type { UserIdentity } from '../types/game';

const IDENTITY_KEY = 'bible_arcade_user_identity';
const USERNAMES_PATH = 'usernames';   // /usernames/{username} → { uid, createdAt }
const USERS_PATH = 'users';           // /users/{uid} → full UserIdentity record

// ── Crypto helpers ──────────────────────────────────────────────────────────

/**
 * SHA-256 hash of a string, returned as lowercase hex.
 * Used to hash the 4-digit PIN before storing in Firebase.
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a UUID v4 for the user's uid.
 */
function generateUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Local Cache ──────────────────────────────────────────────────────────────

/** Read the locally cached identity (or null if none). */
export function getLocalIdentity(): UserIdentity | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(IDENTITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserIdentity;
  } catch {
    return null;
  }
}

/** Save an identity to localStorage. */
export function saveLocalIdentity(identity: UserIdentity): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

/** Remove the locally cached identity (sign-out / reset). */
export function clearLocalIdentity(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(IDENTITY_KEY);
}

// ── Firebase Operations ──────────────────────────────────────────────────────

/** 
 * Check if a username is already taken (case-insensitive).
 * Returns true if available, false if taken.
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  if (!clean) return false;
  try {
    const snapshot = await get(ref(db, `${USERNAMES_PATH}/${clean}`));
    return !snapshot.exists();
  } catch (err) {
    console.error('[UserIdentity] checkUsernameAvailable error:', err);
    // Fail open so the user can try to claim (transaction will catch duplicates)
    return true;
  }
}

/**
 * Claim a new username atomically via Firebase transaction.
 * Returns the created UserIdentity on success, or an error string on failure.
 */
export async function claimUsername(
  username: string,
  displayName: string,
  pin: string
): Promise<{ identity: UserIdentity } | { error: string }> {
  const cleanUsername = username.trim().toLowerCase();
  const cleanDisplayName = displayName.trim();

  if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { error: 'Username must be 3–20 characters.' };
  }
  if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
    return { error: 'Username can only contain letters, numbers, and underscores.' };
  }
  if (!cleanDisplayName) {
    return { error: 'Display name is required.' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { error: 'PIN must be exactly 4 digits.' };
  }

  const uid = generateUID();
  const pinHash = await sha256(pin);
  const createdAt = Date.now();

  const usernameRef = ref(db, `${USERNAMES_PATH}/${cleanUsername}`);

  try {
    // Atomic transaction: only write if the username node doesn't exist yet
    const result = await runTransaction(usernameRef, (currentData) => {
      if (currentData !== null) {
        // Username is already taken — abort
        return undefined;
      }
      return { uid, createdAt };
    });

    if (!result.committed) {
      return { error: 'That username is already taken. Please choose another.' };
    }

    // Username claimed — now write the full user record
    const identity: UserIdentity = {
      uid,
      username: cleanUsername,
      displayName: cleanDisplayName,
      pinHash,
      createdAt
    };

    await set(ref(db, `${USERS_PATH}/${uid}`), identity);

    saveLocalIdentity(identity);
    return { identity };
  } catch (err) {
    console.error('[UserIdentity] claimUsername error:', err);
    return { error: 'Could not connect to the server. Please try again.' };
  }
}

/**
 * Recover an existing identity on a new device.
 * Looks up username in Firebase, verifies PIN hash.
 */
export async function recoverIdentity(
  username: string,
  pin: string
): Promise<{ identity: UserIdentity } | { error: string }> {
  const cleanUsername = username.trim().toLowerCase();

  if (!cleanUsername) return { error: 'Please enter your username.' };
  if (!/^\d{4}$/.test(pin)) return { error: 'PIN must be exactly 4 digits.' };

  try {
    // Step 1: look up the username → uid mapping
    const usernameSnap = await get(ref(db, `${USERNAMES_PATH}/${cleanUsername}`));
    if (!usernameSnap.exists()) {
      return { error: 'Username not found.' };
    }
    const { uid } = usernameSnap.val() as { uid: string; createdAt: number };

    // Step 2: load the full user record
    const userSnap = await get(ref(db, `${USERS_PATH}/${uid}`));
    if (!userSnap.exists()) {
      return { error: 'User record not found. Please contact support.' };
    }
    const storedIdentity = userSnap.val() as UserIdentity;

    // Step 3: verify PIN
    const inputPinHash = await sha256(pin);
    if (inputPinHash !== storedIdentity.pinHash) {
      return { error: 'Incorrect PIN. Please try again.' };
    }

    // Cache locally and return
    saveLocalIdentity(storedIdentity);
    return { identity: storedIdentity };
  } catch (err) {
    console.error('[UserIdentity] recoverIdentity error:', err);
    return { error: 'Could not connect to the server. Please try again.' };
  }
}
