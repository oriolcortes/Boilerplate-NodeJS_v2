// Implements business logic for user operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
import { PasswordHelper } from '../utils/password.helper';
import { IUser } from '../types/user.interface';

export class UserService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      email: true,
      password: false,
      birthday: true,
      isBlocked: true,
      createdAt: false,
      updatedAt: false,
    };
  }

  private readonly normalizeUserData = (data: IUser): IUser => {
    const normalizedData = { ...data };
    if (data.name && typeof data.name === 'string') {
      normalizedData.name = data.name.trim();
    }
    if (data.email && typeof data.email === 'string') {
      normalizedData.email = data.email.toLowerCase().trim();
    }
    if (data.password && typeof data.password === 'string') {
      normalizedData.password = data.password.trim();
    }
    if (data.birthday && typeof data.birthday === 'string') {
      normalizedData.birthday = new Date(data.birthday);
    }
    if (data.isBlocked && typeof data.isBlocked === 'string') {
      normalizedData.isBlocked = data.isBlocked === 'true';
    }
    return normalizedData;
  };

  private readonly getAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDiff = today.getMonth() - birthday.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  private readonly validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{5,30}$/;
    const isValid = passwordRegex.test(password);
    if (!isValid) {
      throw new AppError(
        'Password must be between 5 to 30 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        httpStatus.BAD_REQUEST,
      );
    }
    return true;
  };

  getById = async (id: string): Promise<IUser> => {
    const projection = { ...this.defaultProjection };
    const user = await this.userRepository.getById(id, projection);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }
    return user;
  };

  getAll = (pagination: { skip: number; limit: number }): Promise<(IUser | null)[]> => {
    const MAX_LIMIT = 100;
    if (pagination.limit === 0 || pagination.limit > MAX_LIMIT) {
      pagination.limit = MAX_LIMIT;
    }
    const filters = {};
    const projection = { ...this.defaultProjection };
    return this.userRepository.find(filters, projection, pagination);
  };

  create = async (data: IUser): Promise<IUser | null> => {
    const normalizedData = this.normalizeUserData(data);
    const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
    if (existingUser) {
      throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
    }
    if (this.getAge(normalizedData.birthday) < 18) {
      throw new AppError('User must be at least 18 years old', httpStatus.BAD_REQUEST);
    }
    this.validatePassword(normalizedData.password);
    normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);
    const projection = { ...this.defaultProjection, isBlocked: false };
    return this.userRepository.create(normalizedData, projection);
  };

  update = async (id: string, data: IUser): Promise<IUser> => {
    const userToUpdate = await this.userRepository.getById(id, this.defaultProjection);
    if (!userToUpdate) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (userToUpdate.isBlocked) {
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }

    const normalizedData = this.normalizeUserData(data);
    if (this.getAge(normalizedData.birthday) < 18) {
      throw new AppError('User must be at least 18 years old', httpStatus.BAD_REQUEST);
    }
    if (normalizedData.email) {
      const existingUser = await this.userRepository.getByEmail(normalizedData.email, this.defaultProjection);
      if (existingUser && existingUser.id && existingUser.id.toString() !== id) {
        throw new AppError('A user with this email already exists', httpStatus.CONFLICT);
      }
    }
    if (normalizedData.password) {
      this.validatePassword(normalizedData.password);
      normalizedData.password = await PasswordHelper.hashPassword(normalizedData.password);
    }
    const projection = { ...this.defaultProjection };
    const userUpdated = await this.userRepository.update(id, normalizedData, projection);
    if (!userUpdated) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    return userUpdated;
  };

  delete = async (id: string): Promise<IUser> => {
    const projection = { ...this.defaultProjection };
    const userDeleted = await this.userRepository.delete(id, projection);
    if (!userDeleted) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    return userDeleted;
  };
}
