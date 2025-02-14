// Manages HTTP requests related to users.
// Contains methods for handling routes like GET, POST, PUT, DELETE for users.
// Delegates business logic to the user service.

import { NextFunction, type Request, type Response } from 'express';
import { httpStatus } from '../config/httpStatusCodes';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.getById(req.params.id);
      const response = {
        message: 'User fetched successfully',
        data: user,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skip = 0, limit = 0 } = req.query;

      const pagination = {
        skip: parseInt(skip as string, 10),
        limit: parseInt(limit as string, 10),
      };

      const users = await this.userService.getAll(pagination);
      const response = {
        message: 'Users fetched successfully',
        length: users.length,
        data: users,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.create(req.body);
      const response = {
        message: 'User created successfully',
        data: user,
      };
      res.status(httpStatus.CREATED).send(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.update(req.params.id, req.body);
      const response = {
        message: 'User updated successfully',
        data: user,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = await this.userService.delete(req.params.id);
      const response = {
        message: 'User deleted successfully',
        data: token,
      };
      res.send(response);
    } catch (error) {
      next(error);
    }
  };
}
