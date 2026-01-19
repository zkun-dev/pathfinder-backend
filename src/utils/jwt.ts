import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config/index.js';

export const generateToken = (userId: number): string => {
  const secret: string = String(config.jwt.secret);
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as StringValue,
  };
  
  return jwt.sign({ userId }, secret, options);
};