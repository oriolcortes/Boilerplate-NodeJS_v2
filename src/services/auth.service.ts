// Implements business logic for authorization operations.
// Processes requests from the controller and interacts with the repository as needed.

import { httpStatus } from '../config/httpStatusCodes';
import { AppError } from '../utils/application.error';
import { UserRepository } from '../repositories/user.repository';
import { PasswordHelper } from '../utils/password.helper';
import { TokenHelper } from '../utils/token.helper';
import { IUser } from '../types/user.interface';

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly defaultProjection: Record<string, boolean>;

  constructor() {
    this.userRepository = new UserRepository();
    this.defaultProjection = {
      id: true,
      name: true,
      email: true,
      password: false,
      birthday: false,
      isBlocked: true,
      createdAt: false,
      updatedAt: false,
    };
  }

  login = async (email: string, password: string): Promise<Partial<IUser>> => {
    const projection = { ...this.defaultProjection, password: true };
    const user = await this.userRepository.getByEmail(email, projection);
    if (!user) {
      throw new AppError('User not found', httpStatus.NOT_FOUND);
    }
    if (user.isBlocked) {
      throw new AppError('User is blocked', httpStatus.FORBIDDEN);
    }
    const isPasswordValid = await PasswordHelper.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid password', httpStatus.UNAUTHORIZED);
    }
    const token = TokenHelper.generateToken({ id: user.id });
    return { ...user, token };
  };
}
