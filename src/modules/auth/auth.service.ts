import bcrypt from 'bcryptjs';
import { User } from './auth.model.js';
import {
  loginSchema,
  registerSchema
} from './auth.schema.js';
import { AppError } from '../../utils/app-error.js';
import { signToken } from '../../utils/jwt.js';

export const registerUser = async (
  input: unknown
) => {
  const data = registerSchema.parse(input);

  const existingUser = await User.findOne({
    email: data.email
  });

  if (existingUser) {
    throw new AppError(
      409,
      'An account with this email already exists.',
      'EMAIL_ALREADY_EXISTS'
    );
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    12
  );

  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash
  });

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

export const loginUser = async (
  input: unknown
) => {
  const data = loginSchema.parse(input);

  const user = await User.findOne({
    email: data.email
  }).select('+passwordHash');

  if (!user) {
    throw new AppError(
      401,
      'Invalid email or password.',
      'INVALID_CREDENTIALS'
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      data.password,
      user.passwordHash
    );

  if (!passwordMatches) {
    throw new AppError(
      401,
      'Invalid email or password.',
      'INVALID_CREDENTIALS'
    );
  }

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};