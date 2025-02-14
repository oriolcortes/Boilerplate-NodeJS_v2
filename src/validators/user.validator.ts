// Defines Joi schemas for validating user-related requests.
// Ensures that incoming data adheres to the required structure and rules.

import Joi from 'joi';

export class UserValidator {
  private static id = Joi.string();
  private static email = Joi.string().email();
  private static name = Joi.string().alphanum().min(3).max(30);
  private static password = Joi.string();
  private static birthday = Joi.date().iso();
  private static isBlocked = Joi.boolean();
  private static skip = Joi.number().min(1);
  private static limit = Joi.number().min(1).max(100);

  static userIdSchema = Joi.object({ id: UserValidator.id.required() });

  static userPaginationSchema = Joi.object({
    skip: UserValidator.skip,
    limit: UserValidator.limit,
  }).with('skip', 'limit');

  static userCreateSchema = Joi.object({
    name: UserValidator.name.required(),
    email: UserValidator.email.required(),
    password: UserValidator.password.required(),
    birthday: UserValidator.birthday.required(),
  });

  static userUpdateSchema = Joi.object({
    name: UserValidator.name,
    email: UserValidator.email,
    password: UserValidator.password,
    birthday: UserValidator.birthday,
    isBlocked: UserValidator.isBlocked,
  });
}
