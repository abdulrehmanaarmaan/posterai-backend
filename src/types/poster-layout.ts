import { z } from 'zod';

export const PosterLayoutSchema =
  z.object({
    theme: z.object({
      primaryColor:
        z.string(),

      secondaryColor:
        z.string(),

      backgroundStyle:
        z.enum([
          'solid',
          'soft-light',
          'dark',
        ]),
    }),

    headline: z.object({
      alignment:
        z.enum([
          'left',
          'center',
          'right',
        ]),

      position:
        z.enum([
          'top',
          'middle',
          'bottom',
        ]),

      fontSize:
        z.number()
          .int()
          .min(48)
          .max(120),
    }),

    photos: z.object({
      layout:
        z.enum([
          'single',
          'two-horizontal',
          'three-horizontal',
        ]),

      shape:
        z.enum([
          'circle',
          'rounded',
          'square',
        ]),
    }),

    decorations:
      z.array(
        z.enum([
          'border',
          'soft-light',
          'national-colors',
          'minimal',
        ]),
      ),
  });

export type PosterLayout =
  z.infer<
    typeof PosterLayoutSchema
  >;