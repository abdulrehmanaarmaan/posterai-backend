import 'dotenv/config';

import mongoose from 'mongoose';

import { connectDatabase } from '../src/config/db.js';

import {
  Template
} from '../src/modules/template/template.model.js';

const templates = [
  {
    title: 'Clean Community Poster',
    occasionType: 'Community Event',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    previewUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    isActive: true
  },

  {
    title: 'Festival Greeting',
    occasionType: 'Festival',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    previewUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    isActive: true
  },

  {
    title: 'Public Meeting',
    occasionType: 'Public Meeting',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    previewUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    isActive: true
  },

  {
    title: 'National Occasion',
    occasionType: 'National Occasion',
    thumbnailUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    previewUrl:
      'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    isActive: true
  }
];

const seed = async () => {
  await connectDatabase();

  await Template.deleteMany({});

  await Template.insertMany(
    templates
  );

  console.log(
    'Templates seeded successfully.'
  );

  await mongoose.disconnect();
};

seed().catch(error => {
  console.error(
    'Template seeding failed:',
    error
  );

  process.exit(1);
});