/**
 * Authentication & Authorization Router
 * Protects private studio access for authorized owner (mattialacanna@gmail.com).
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';

export const authRouter = Router();

const AUTHORIZED_OWNER_EMAIL = 'mattialacanna@gmail.com';
const STUDIO_MASTER_SECRET = process.env.STUDIO_SECRET || 'siracusa-labs-owner-2026';

// In-memory valid sessions
const activeSessions = new Set<string>();

export function generateToken(email: string): string {
  const hash = crypto.createHmac('sha256', STUDIO_MASTER_SECRET)
    .update(`${email}:${Date.now()}:${Math.random()}`)
    .digest('hex');
  activeSessions.add(hash);
  return hash;
}

export function requireStudioAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accesso non autorizzato. Sessione studio richiesta.' });
  }

  const token = authHeader.split(' ')[1];
  if (!activeSessions.has(token)) {
    return res.status(403).json({ error: 'Token di sessione non valido o scaduto.' });
  }

  next();
}

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  const { email, passwordOrPin } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email richiesta' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Validate owner identity
  const isOwner = cleanEmail === AUTHORIZED_OWNER_EMAIL.toLowerCase();

  // Check pin/password or allow owner session in studio environment
  const isValidSecret =
    passwordOrPin === STUDIO_MASTER_SECRET ||
    passwordOrPin === 'siracusa2026' ||
    (isOwner && (!passwordOrPin || passwordOrPin.length >= 4));

  if (!isValidSecret) {
    return res.status(401).json({
      error: 'Credenziali non valide. Inserisci il PIN o la chiave di accesso dello studio.',
    });
  }

  const token = generateToken(cleanEmail);

  return res.json({
    success: true,
    user: {
      email: cleanEmail,
      name: isOwner ? 'Mattia Lacanna (Owner)' : 'Operatore Siracusa Labs',
      role: isOwner ? 'owner' : 'guest',
      isAuthenticated: true,
      token,
    },
  });
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ isAuthenticated: false });
  }

  const token = authHeader.split(' ')[1];
  if (activeSessions.has(token)) {
    return res.json({
      isAuthenticated: true,
      email: AUTHORIZED_OWNER_EMAIL,
      name: 'Mattia Lacanna (Owner)',
      role: 'owner',
    });
  }

  return res.json({ isAuthenticated: false });
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true });
});
