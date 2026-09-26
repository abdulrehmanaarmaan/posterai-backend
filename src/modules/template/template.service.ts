import { Template } from './template.model.js';
import { AppError } from '../../utils/app-error.js';

export const getTemplates = async (
  occasionType?: string
) => {
  const filter: Record<string, unknown> = {
    isActive: true
  };

  if (occasionType) {
    filter.occasionType = occasionType;
  }

  return Template.find(filter)
    .sort({ createdAt: -1 })
    .lean();
};

export const getTemplateById = async (
  id: string
) => {
  const template =
    await Template.findOne({
      _id: id,
      isActive: true
    }).lean();

  if (!template) {
    throw new AppError(
      404,
      'Template not found.',
      'TEMPLATE_NOT_FOUND'
    );
  }

  return template;
};