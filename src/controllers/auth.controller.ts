// Manages HTTP requests related to authentication.
// Contains methods for handling routes like GET, POST, PUT, DELETE for users.
// Delegates business logic to the user service.

import { NextFunction, type Request, type Response } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await this.authService.login(email, password);
      const response = {
        message: 'Login successful',
        data: user,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.create(req.body);
      const response = {
        message: 'User registered successfully',
        data: user,
      };
      res.status(httpStatus.CREATED).send(response);
    } catch (error) {
      next(error);
    }
  };
}
