import mongoose, { Schema } from 'mongoose';

export interface TemplateDocument
  extends mongoose.Document {
  title: string;
  occasionType: string;
  thumbnailUrl: string;
  previewUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const templateSchema =
  new Schema<TemplateDocument>(
    {
      title: {
        type: String,
        required: true,
        trim: true
      },

      occasionType: {
        type: String,
        required: true,
        trim: true,
        index: true
      },

      thumbnailUrl: {
        type: String,
        required: true
      },

      previewUrl: {
        type: String,
        required: true
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true
      }
    },
    {
      timestamps: true
    }
  );

export const Template =
  mongoose.model<TemplateDocument>(
    'Template',
    templateSchema
  );