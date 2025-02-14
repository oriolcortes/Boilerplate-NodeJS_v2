// Utility functions for handling token-related operations.
// Includes functionalities like generating, verifying, and decoding JSON Web Tokens (JWT).
// Ensures secure and consistent token management throughout the application.

import jwt, { JwtPayload } from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config';
import { httpStatus } from '../config/httpStatusCodes';
import { AppError } from './application.error';

export class TokenHelper {
  static readonly generateToken = (payload: object): string => {
    const options: jwt.SignOptions = {
      expiresIn: '1h',
    };
    if (!SECRET_KEY) {
      throw new AppError('SECRET_KEY is not defined', httpStatus.INTERNAL_SERVER_ERROR);
    }
    const token = jwt.sign(payload, SECRET_KEY, options);
    return token;
  };

  static readonly verifyToken = (token: string): string | JwtPayload => {
    if (!SECRET_KEY) {
      throw new AppError('SECRET_KEY is not defined', httpStatus.INTERNAL_SERVER_ERROR);
    }
    return jwt.verify(token, SECRET_KEY);
  };
}
