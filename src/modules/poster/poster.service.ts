import mongoose from 'mongoose';

import {
  Poster
} from './poster.model.js';

import {
  createPosterSchema
} from './poster.schema.js';

import {
  Template
} from '../template/template.model.js';

import {
  AppError
} from '../../utils/app-error.js';

import {
  generatePosterLayout
} from '../../services/gemini.service.js';

import {
  renderPoster
} from '../../services/poster-render.service.js';

import {
  uploadBufferToCloudinary,
  deleteCloudinaryAsset
} from '../../services/cloudinary.service.js';

export const createPoster =
  async (
    userId: string,
    input: unknown
  ) => {
    const data =
      createPosterSchema.parse(input);

    if (
      !mongoose.isValidObjectId(
        data.templateId
      )
    ) {
      throw new AppError(
        400,
        'Invalid template ID.',
        'INVALID_TEMPLATE_ID'
      );
    }

    const template =
      await Template.findOne({
        _id: data.templateId,
        isActive: true
      });

    if (!template) {
      throw new AppError(
        404,
        'Template not found.',
        'TEMPLATE_NOT_FOUND'
      );
    }

    const poster =
      await Poster.create({
        userId,
        templateId: data.templateId,

        name: data.name,
        designation: data.designation,
        party: data.party,

        union: data.union,
        thana: data.thana,
        district: data.district,

        occasionType: data.occasionType,
        headline: data.headline,

        photos: data.photos,

        status: 'generating',
        generationAttempts: 1,
        maxGenerationAttempts: 3
      });

    try {
      const layout =
        await generatePosterLayout({
          name: data.name,
          designation: data.designation,
          party: data.party,
          union: data.union,
          thana: data.thana,
          district: data.district,
          occasionType: data.occasionType,
          headline: data.headline,
          photoCount: data.photos.length
        });

      const imageBuffer =
        await renderPoster({
          name: data.name,
          designation: data.designation,
          party: data.party,
          union: data.union,
          thana: data.thana,
          district: data.district,
          occasionType: data.occasionType,
          headline: data.headline,
          photos: data.photos,
          layout
        });

      const upload =
        await uploadBufferToCloudinary(
          imageBuffer,
          'ai-political-poster-maker/generated-posters'
        );

      poster.status = 'completed';

      poster.generatedImageUrl =
        upload.secure_url;

      poster.generatedImagePublicId =
        upload.public_id;

      poster.layoutConfig = layout;

      poster.errorMessage = undefined;

      await poster.save();

      return poster.toObject();
    } catch (error) {
      poster.status = 'failed';

      poster.errorMessage =
        error instanceof Error
          ? error.message
          : 'Poster generation failed.';

      await poster.save();

      throw error;
    }
  };

export const getMyPosters =
  async (userId: string) => {
    return Poster.find({
      userId
    })
      .sort({
        createdAt: -1
      })
      .lean();
  };

export const getPosterById =
  async (
    userId: string,
    posterId: string
  ) => {
    if (
      !mongoose.isValidObjectId(
        posterId
      )
    ) {
      throw new AppError(
        400,
        'Invalid poster ID.',
        'INVALID_POSTER_ID'
      );
    }

    const poster =
      await Poster.findOne({
        _id: posterId,
        userId
      }).lean();

    if (!poster) {
      throw new AppError(
        404,
        'Poster not found.',
        'POSTER_NOT_FOUND'
      );
    }

    return poster;
  };

export const regeneratePoster =
  async (
    userId: string,
    posterId: string
  ) => {
    if (
      !mongoose.isValidObjectId(
        posterId
      )
    ) {
      throw new AppError(
        400,
        'Invalid poster ID.',
        'INVALID_POSTER_ID'
      );
    }

    const poster =
      await Poster.findOne({
        _id: posterId,
        userId
      });

    if (!poster) {
      throw new AppError(
        404,
        'Poster not found.',
        'POSTER_NOT_FOUND'
      );
    }

    if (
      poster.generationAttempts >=
      poster.maxGenerationAttempts
    ) {
      throw new AppError(
        429,
        'Regeneration limit reached.',
        'GENERATION_LIMIT_REACHED'
      );
    }

    const template =
      await Template.findById(
        poster.templateId
      );

    if (!template) {
      throw new AppError(
        404,
        'Template not found.',
        'TEMPLATE_NOT_FOUND'
      );
    }

    poster.status = 'generating';

    poster.generationAttempts += 1;

    poster.errorMessage = undefined;

    await poster.save();

    try {
      const layout =
        await generatePosterLayout({
          name: poster.name,
          designation: poster.designation,
          party: poster.party,
          union: poster.union,
          thana: poster.thana,
          district: poster.district,
          occasionType: poster.occasionType,
          headline: poster.headline,
          photoCount: poster.photos.length
        });

      const imageBuffer =
        await renderPoster({
          name: poster.name,
          designation: poster.designation,
          party: poster.party,
          union: poster.union,
          thana: poster.thana,
          district: poster.district,
          occasionType: poster.occasionType,
          headline: poster.headline,
          photos: poster.photos,
          layout
        });

      const upload =
        await uploadBufferToCloudinary(
          imageBuffer,
          'ai-political-poster-maker/generated-posters'
        );

      if (
        poster.generatedImagePublicId
      ) {
        await deleteCloudinaryAsset(
          poster.generatedImagePublicId
        );
      }

      poster.status = 'completed';

      poster.generatedImageUrl =
        upload.secure_url;

      poster.generatedImagePublicId =
        upload.public_id;

      poster.layoutConfig = layout;

      await poster.save();

      return poster.toObject();
    } catch (error) {
      poster.status = 'failed';

      poster.errorMessage =
        error instanceof Error
          ? error.message
          : 'Poster regeneration failed.';

      await poster.save();

      throw error;
    }
  };

export const deletePoster =
  async (
    userId: string,
    posterId: string
  ) => {
    if (
      !mongoose.isValidObjectId(
        posterId
      )
    ) {
      throw new AppError(
        400,
        'Invalid poster ID.',
        'INVALID_POSTER_ID'
      );
    }

    const poster =
      await Poster.findOne({
        _id: posterId,
        userId
      });

    if (!poster) {
      throw new AppError(
        404,
        'Poster not found.',
        'POSTER_NOT_FOUND'
      );
    }

    if (
      poster.generatedImagePublicId
    ) {
      await deleteCloudinaryAsset(
        poster.generatedImagePublicId
      );
    }

    await Poster.deleteOne({
      _id: poster._id
    });
  };