import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * 生成 JWT Token
 */
export const generateToken = (userId: number): string => {
  const secret: string = String(config.jwt.secret);
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};