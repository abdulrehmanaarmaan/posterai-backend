import { GoogleGenAI } from '@google/genai';

import { env } from '../config/env.js';

import {
  PosterLayoutSchema,
  type PosterLayout,
} from '../types/poster-layout.js';

interface GeneratePosterLayoutInput {
  name: string;
  designation: string;
  party: string;
  union: string;
  thana: string;
  district: string;
  occasionType: string;
  headline: string;
  photoCount: number;
}

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const sleep = (
  milliseconds: number,
): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const getGeminiErrorDetails = (
  error: unknown,
) => {
  if (
    !error ||
    typeof error !== 'object'
  ) {
    return {
      status: undefined,
      code: undefined,
      message: '',
    };
  }

  const errorObject =
    error as {
      status?: number | string;
      code?: number | string;
      message?: string;
    };

  return {
    status: Number(errorObject.status),
    code: Number(errorObject.code),
    message:
      typeof errorObject.message === 'string'
        ? errorObject.message
        : '',
  };
};

const isRetryableGeminiError = (
  error: unknown,
): boolean => {
  const {
    status,
    code,
    message,
  } = getGeminiErrorDetails(error);

  return (
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    code === 429 ||
    code === 500 ||
    code === 502 ||
    code === 503 ||
    code === 504 ||
    message.includes('429') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand') ||
    message.includes('temporarily overloaded')
  );
};

const getGeminiUserMessage = (
  error: unknown,
): string => {
  const {
    status,
    code,
    message,
  } = getGeminiErrorDetails(error);

  const unavailable =
    status === 503 ||
    code === 503 ||
    message.includes('UNAVAILABLE') ||
    message.includes('high demand');

  if (unavailable) {
    return (
      'Gemini is temporarily unavailable. ' +
      'Please try again in a moment.'
    );
  }

  const rateLimited =
    status === 429 ||
    code === 429 ||
    message.includes('429');

  if (rateLimited) {
    return (
      'Gemini is temporarily rate limited. ' +
      'Please try again shortly.'
    );
  }

  return (
    'Unable to generate the poster layout right now. ' +
    'Please try again.'
  );
};

const generateWithRetry =
  async (
    prompt: string,
  ) => {
    const maxAttempts = 3;

    const retryDelays = [
      2000,
      5000,
    ];

    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= maxAttempts;
      attempt++
    ) {
      try {
        return await ai.models.generateContent({
          model: env.GEMINI_MODEL,

          contents: prompt,

          config: {
            responseMimeType:
              'application/json',

            responseSchema: {
              type: 'object',

              properties: {
                theme: {
                  type: 'object',

                  properties: {
                    primaryColor: {
                      type: 'string',
                    },

                    secondaryColor: {
                      type: 'string',
                    },

                    backgroundStyle: {
                      type: 'string',

                      enum: [
                        'solid',
                        'soft-light',
                        'dark',
                      ],
                    },
                  },

                  required: [
                    'primaryColor',
                    'secondaryColor',
                    'backgroundStyle',
                  ],
                },

                headline: {
                  type: 'object',

                  properties: {
                    alignment: {
                      type: 'string',

                      enum: [
                        'left',
                        'center',
                        'right',
                      ],
                    },

                    position: {
                      type: 'string',

                      enum: [
                        'top',
                        'middle',
                        'bottom',
                      ],
                    },

                    fontSize: {
                      type: 'integer',

                      minimum: 48,
                      maximum: 120,
                    },
                  },

                  required: [
                    'alignment',
                    'position',
                    'fontSize',
                  ],
                },

                photos: {
                  type: 'object',

                  properties: {
                    layout: {
                      type: 'string',

                      enum: [
                        'single',
                        'two-horizontal',
                        'three-horizontal',
                      ],
                    },

                    shape: {
                      type: 'string',

                      enum: [
                        'circle',
                        'rounded',
                        'square',
                      ],
                    },
                  },

                  required: [
                    'layout',
                    'shape',
                  ],
                },

                decorations: {
                  type: 'array',

                  items: {
                    type: 'string',

                    enum: [
                      'border',
                      'soft-light',
                      'national-colors',
                      'minimal',
                    ],
                  },
                },
              },

              required: [
                'theme',
                'headline',
                'photos',
                'decorations',
              ],
            },
          },
        });
      } catch (error) {
        lastError = error;

        const retryable =
          isRetryableGeminiError(
            error,
          );

        const hasAttemptsLeft =
          attempt < maxAttempts;

        if (
          !retryable ||
          !hasAttemptsLeft
        ) {
          break;
        }

        const delay =
          retryDelays[attempt - 1] ??
          5000;

        console.warn(
          `Gemini request failed on attempt ${attempt}. ` +
          `Retrying in ${delay}ms...`,
        );

        await sleep(delay);
      }
    }

    console.error(
      'Gemini generation failed:',
      lastError,
    );

    throw new Error(
      getGeminiUserMessage(lastError),
    );
  };

export const generatePosterLayout =
  async (
    input: GeneratePosterLayoutInput,
  ): Promise<PosterLayout> => {
    const prompt = `
You are generating a structured visual layout configuration
for a Bengali political poster.

IMPORTANT:
- Do NOT rewrite the user's Bengali headline.
- Do NOT generate political slogans.
- Do NOT generate persuasive political content.
- Do NOT modify the supplied user content.
- Only determine visual/layout properties.
- Return JSON matching the requested schema.

Poster information:

Name: ${input.name}
Designation: ${input.designation}
Party/Organization: ${input.party}
Union: ${input.union}
Thana: ${input.thana}
District: ${input.district}
Occasion: ${input.occasionType}
Headline: ${input.headline}
Number of photos: ${input.photoCount}
`;

    const response =
      await generateWithRetry(
        prompt,
      );

    if (!response.text) {
      throw new Error(
        'Gemini returned an empty layout response.',
      );
    }

    let parsedJson: unknown;

    try {
      parsedJson =
        JSON.parse(
          response.text,
        );
    } catch {
      throw new Error(
        'Gemini returned invalid JSON.',
      );
    }

    const parsed =
      PosterLayoutSchema.safeParse(
        parsedJson,
      );

    if (!parsed.success) {
      console.error(
        'Invalid Gemini layout:',
        parsed.error.flatten(),
      );

      throw new Error(
        'Gemini returned an invalid poster layout.',
      );
    }

    return parsed.data;
  };