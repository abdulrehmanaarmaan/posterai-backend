import puppeteer from 'puppeteer';
import { PosterLayout } from '../types/poster-layout.js';

interface RenderPosterInput {
  name: string;
  designation: string;
  party: string;
  union: string;
  thana: string;
  district: string;
  occasionType: string;
  headline: string;
  photos: {
    url: string;
  }[];
  layout: PosterLayout;
}

const escapeHtml = (
  value: string
): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

export const renderPoster = async (
  input: RenderPosterInput
): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1
    });

    const {
      layout
    } = input;

    const photoMarkup =
      input.photos
        .map(
          photo => `
            <img
              class="poster-photo"
              src="${escapeHtml(photo.url)}"
              alt="Poster photo"
            />
          `
        )
        .join('');

    const html = `
      <!DOCTYPE html>

      <html lang="bn">
        <head>
          <meta charset="UTF-8" />

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 1200px;
              height: 1600px;
            }

            body {
              font-family:
                "Noto Sans Bengali",
                "Noto Sans",
                Arial,
                sans-serif;

              background:
                ${layout.theme.backgroundStyle === 'dark'
        ? layout.theme.primaryColor
        : '#ffffff'};

              color:
                ${layout.theme.backgroundStyle === 'dark'
        ? '#ffffff'
        : '#111827'};
            }

            .poster {
              width: 1200px;
              height: 1600px;
              position: relative;
              overflow: hidden;

              background:
                linear-gradient(
                  145deg,
                  ${layout.theme.primaryColor},
                  ${layout.theme.secondaryColor}
                );

              padding: 70px;
              display: flex;
              flex-direction: column;
            }

            .border {
              position: absolute;
              inset: 24px;
              border: 8px solid rgba(255,255,255,.8);
              border-radius: 28px;
              pointer-events: none;
            }

            .occasion {
              text-align: center;
              color: white;
              font-size: 42px;
              font-weight: 700;
              margin-bottom: 35px;
            }

            .headline {
              color: white;
              font-size:
                ${layout.headline.fontSize}px;

              font-weight: 900;
              line-height: 1.25;

              text-align:
                ${layout.headline.alignment};

              margin-bottom: 45px;
            }

            .photos {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 35px;
              margin: 25px 0 45px;
              flex-wrap: wrap;
            }

            .poster-photo {
              width: 300px;
              height: 300px;
              object-fit: cover;

              ${layout.photos.shape === 'circle'
        ? 'border-radius: 50%;'
        : layout.photos.shape === 'rounded'
          ? 'border-radius: 30px;'
          : 'border-radius: 0;'
      }

              border: 8px solid white;
              box-shadow:
                0 15px 35px rgba(0,0,0,.25);
            }

            .info {
              color: white;
              text-align: center;
              margin-top: auto;
              margin-bottom: 40px;
            }

            .name {
              font-size: 58px;
              font-weight: 900;
              margin-bottom: 10px;
            }

            .designation {
              font-size: 35px;
              font-weight: 600;
              margin-bottom: 20px;
            }

            .party {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 20px;
            }

            .location {
              font-size: 28px;
              line-height: 1.5;
            }

            .footer {
              color: white;
              text-align: center;
              font-size: 22px;
              margin-top: 30px;
            }
          </style>
        </head>

        <body>
          <main class="poster">
            ${layout.decorations.includes('border')
        ? '<div class="border"></div>'
        : ''
      }

            <div class="occasion">
              ${escapeHtml(input.occasionType)}
            </div>

            <div class="headline">
              ${escapeHtml(input.headline)}
            </div>

            <div class="photos">
              ${photoMarkup}
            </div>

            <section class="info">
              <div class="name">
                ${escapeHtml(input.name)}
              </div>

              <div class="designation">
                ${escapeHtml(input.designation)}
              </div>

              <div class="party">
                ${escapeHtml(input.party)}
              </div>

              <div class="location">
                ${escapeHtml(input.union)}
                ·
                ${escapeHtml(input.thana)}
                ·
                ${escapeHtml(input.district)}
              </div>
            </section>

            <div class="footer">
              AI-assisted poster generation
            </div>
          </main>
        </body>
      </html>
    `;

    await page.setContent(
      html,
      {
        waitUntil: 'load'
      }
    );

    const image =
      await page.screenshot({
        type: 'png',
        fullPage: true
      });

    return Buffer.from(image);
  } finally {
    await browser.close();
  }
};