import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { UserAccount } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  // Support: "Bearer <token>" or "Bearer token_user_id_timestamp"
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
  if (!token) {
    return next();
  }

  const raw = db.getRaw();
  // Match tokens formatted as token_<userId>_<timestamp> or match by account ID
  const parts = token.split('_');
  const userId = parts.length >= 2 ? parts[1] : token;

  const found = raw.userAccounts.find(u => u.id === userId || `token_${u.id}` === token || token.includes(u.id));
  if (found) {
    req.user = found;
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Provide a valid Bearer token in Authorization header.'
    });
  }
  next();
}

export function requireRole(allowedRoles: Array<'admin' | 'manager' | 'employee' | 'user'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const userRole = req.user.role === 'user' ? 'employee' : req.user.role;
    const isAllowed = allowedRoles.some(r => (r === 'user' ? 'employee' : r) === userRole);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        error: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
}
