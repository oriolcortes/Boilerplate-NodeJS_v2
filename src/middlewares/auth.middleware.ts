// Middleware for handling authentication and authorization.
// Includes functionality for validating tokens, ensuring protected routes, and managing user roles and permissions to restrict access as needed.

import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import { TokenHelper } from '../utils/token.helper';
import { AppError } from '../utils/application.error';

export const checkToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    next(new AppError('You must be logged in to access this resource.', httpStatus.UNAUTHORIZED));
    return;
  }
  try {
    const decoded = TokenHelper.verifyToken(token);
    req.body.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid token.', httpStatus.UNAUTHORIZED));
  }
};
