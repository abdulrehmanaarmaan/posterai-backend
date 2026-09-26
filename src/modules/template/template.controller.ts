import type { RequestHandler } from 'express';

import {
  getTemplateById,
  getTemplates
} from './template.service.js';

import { sendSuccess } from '../../utils/response.js';

import {
  getRouteParam
} from '../../utils/route-param.js';

export const listTemplates: RequestHandler =
  async (req, res) => {
    const occasionType =
      typeof req.query.occasionType === 'string'
        ? req.query.occasionType
        : undefined;

    const templates =
      await getTemplates(occasionType);

    sendSuccess(
      res,
      200,
      'Templates retrieved successfully.',
      templates
    );
  };

export const getTemplate: RequestHandler =
  async (req, res) => {
    const templateId =
      getRouteParam(
        req.params.id,
        'template ID'
      );

    const template =
      await getTemplateById(templateId);

    sendSuccess(
      res,
      200,
      'Template retrieved successfully.',
      template
    );
  };