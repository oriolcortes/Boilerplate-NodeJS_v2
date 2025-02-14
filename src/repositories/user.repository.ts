// Handles direct data operations related to users.
// This layer interacts with the database or a data source to perform CRUD operations.

import { IUserModel, UserModel } from '../models/user.model';
import { IUser } from '../types/user.interface';
import { BaseRepository } from './base.repository';

export class UserRepository {
  private readonly baseRepository: BaseRepository<IUserModel>;

  constructor() {
    this.baseRepository = new BaseRepository(UserModel);
  }

  private transformId(user: IUserModel): IUser {
    const userObj = typeof user.toObject === 'function' ? user.toObject() : user;
    const { _id, ...rest } = userObj;
    return { ...rest, id: _id.toString() };
  }

  private mapProjection(projection: Record<string, boolean>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(projection)
        .filter(([, value]) => value === false)
        .map(([key]) => [key, 0]),
    );
  }

  getById = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const userFound = await this.baseRepository.getById(id, this.mapProjection(projection));
    if (!userFound) {
      return null;
    }
    return this.transformId(userFound);
  };

  find = async (
    filters: Record<string, unknown> = {},
    projection: Record<string, boolean> = {},
    pagination: { skip: number; limit: number } = { skip: 0, limit: 0 },
  ): Promise<IUser[]> => {
    const options = { ...pagination };
    const users = await this.baseRepository.find<IUserModel>(filters, this.mapProjection(projection), options);
    return users.map((user) => this.transformId(user));
  };

  create = async (data: IUser, projection: Record<string, boolean>): Promise<IUser | null> => {
    const createdUser = await this.baseRepository.create(data);
    if (!createdUser) {
      return null;
    }
    const transformedUser = this.transformId(createdUser);
    const filteredUser = Object.fromEntries(
      Object.entries(transformedUser).filter(([field]) => projection[field] !== false),
    );
    return filteredUser as IUser;
  };

  getByEmail = async (email: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const filters = { email };
    const userFound = await this.baseRepository.findOne(filters, this.mapProjection(projection));
    if (!userFound) {
      return null;
    }
    return this.transformId(userFound);
  };

  update = async (id: string, data: IUser, projection: Record<string, boolean>): Promise<IUser | null> => {
    data.updatedAt = new Date();
    const updatedUser = await this.baseRepository.update(id, data, this.mapProjection(projection));
    if (!updatedUser) {
      return null;
    }
    return this.transformId(updatedUser);
  };

  delete = async (id: string, projection: Record<string, boolean>): Promise<IUser | null> => {
    const userDeleted = await this.baseRepository.delete(id, this.mapProjection(projection));
    if (!userDeleted) {
      return null;
    }
    return this.transformId(userDeleted);
  };
}
