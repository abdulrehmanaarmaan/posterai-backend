import type { RequestHandler } from 'express';
import {
  loginUser,
  registerUser
} from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export const register: RequestHandler = async (
  req,
  res
) => {
  const result = await registerUser(req.body);

  sendSuccess(
    res,
    201,
    'Registration successful.',
    result
  );
};

export const login: RequestHandler = async (
  req,
  res
) => {
  const result = await loginUser(req.body);

  sendSuccess(
    res,
    200,
    'Login successful.',
    result
  );
};