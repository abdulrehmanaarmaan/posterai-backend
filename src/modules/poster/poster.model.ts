import mongoose, { Schema } from 'mongoose';
import { PosterLayout } from '../../types/poster-layout.js';

export type PosterStatus =
  | 'generating'
  | 'completed'
  | 'failed';

export interface PosterPhoto {
  url: string;
  publicId?: string;
}

export interface PosterDocument
  extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  templateId: mongoose.Types.ObjectId;

  name: string;
  designation: string;
  party: string;

  union: string;
  thana: string;
  district: string;

  occasionType: string;
  headline: string;

  photos: PosterPhoto[];

  generatedImageUrl?: string;
  generatedImagePublicId?: string;

  status: PosterStatus;
  generationAttempts: number;
  maxGenerationAttempts: number;

  layoutConfig?: PosterLayout;

  errorMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const posterPhotoSchema =
  new Schema<PosterPhoto>(
    {
      url: {
        type: String,
        required: true
      },

      publicId: {
        type: String
      }
    },
    {
      _id: false
    }
  );

const posterSchema =
  new Schema<PosterDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },

      templateId: {
        type: Schema.Types.ObjectId,
        ref: 'Template',
        required: true
      },

      name: {
        type: String,
        required: true,
        trim: true
      },

      designation: {
        type: String,
        required: true,
        trim: true
      },

      party: {
        type: String,
        required: true,
        trim: true
      },

      union: {
        type: String,
        required: true,
        trim: true
      },

      thana: {
        type: String,
        required: true,
        trim: true
      },

      district: {
        type: String,
        required: true,
        trim: true
      },

      occasionType: {
        type: String,
        required: true,
        trim: true
      },

      headline: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
      },

      photos: {
        type: [posterPhotoSchema],
        required: true,
        validate: {
          validator: (
            value: PosterPhoto[]
          ) =>
            value.length >= 1 &&
            value.length <= 3,
          message:
            'Poster must contain between 1 and 3 photos.'
        }
      },

      generatedImageUrl: {
        type: String
      },

      generatedImagePublicId: {
        type: String
      },

      status: {
        type: String,
        enum: [
          'generating',
          'completed',
          'failed'
        ],
        default: 'generating',
        index: true
      },

      generationAttempts: {
        type: Number,
        default: 0
      },

      maxGenerationAttempts: {
        type: Number,
        default: 3
      },

      layoutConfig: {
        type: Schema.Types.Mixed
      },

      errorMessage: {
        type: String
      }
    },
    {
      timestamps: true
    }
  );

posterSchema.index({
  userId: 1,
  createdAt: -1
});

export const Poster =
  mongoose.model<PosterDocument>(
    'Poster',
    posterSchema
  );