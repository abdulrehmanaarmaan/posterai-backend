import type { RequestHandler } from 'express';

import {
  createPoster,
  deletePoster,
  getMyPosters,
  getPosterById,
  regeneratePoster
} from './poster.service.js';

import {
  sendSuccess
} from '../../utils/response.js';

import {
  getRouteParam
} from '../../utils/route-param.js';

export const create: RequestHandler =
  async (req, res) => {
    const poster =
      await createPoster(
        req.user!.userId,
        req.body
      );

    sendSuccess(
      res,
      201,
      'Poster generated successfully.',
      poster
    );
  };

export const getMine: RequestHandler =
  async (req, res) => {
    const posters =
      await getMyPosters(
        req.user!.userId
      );

    sendSuccess(
      res,
      200,
      'Poster history retrieved successfully.',
      posters
    );
  };

export const getOne: RequestHandler =
  async (req, res) => {
    const posterId =
      getRouteParam(
        req.params.id,
        'poster ID'
      );

    const poster =
      await getPosterById(
        req.user!.userId,
        posterId
      );

    sendSuccess(
      res,
      200,
      'Poster retrieved successfully.',
      poster
    );
  };

export const regenerate: RequestHandler =
  async (req, res) => {
    const posterId =
      getRouteParam(
        req.params.id,
        'poster ID'
      );

    const poster =
      await regeneratePoster(
        req.user!.userId,
        posterId
      );

    sendSuccess(
      res,
      200,
      'Poster regenerated successfully.',
      poster
    );
  };

export const remove: RequestHandler =
  async (req, res) => {
    const posterId =
      getRouteParam(
        req.params.id,
        'poster ID'
      );

    await deletePoster(
      req.user!.userId,
      posterId
    );

    sendSuccess(
      res,
      200,
      'Poster deleted successfully.',
      null
    );
  };