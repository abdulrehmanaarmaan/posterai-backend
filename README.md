# AI Political Poster Maker — Backend

An Express and TypeScript backend for the **AI Political Poster Maker** MVP.

The backend provides authentication, template management, photo uploads, AI-assisted poster layout generation, server-side poster rendering, Cloudinary storage, poster persistence, regeneration, deletion, and authenticated poster history.

The backend is intentionally focused on the assignment MVP rather than introducing unnecessary infrastructure or features outside the required scope.

## Features

- REST API built with Express and TypeScript
- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- MongoDB persistence through Mongoose
- Reusable poster templates
- Template retrieval
- Authenticated photo uploads
- Cloudinary image storage
- Maximum 3 uploaded photos per poster request
- AI-assisted poster layout generation with Gemini
- Server-side poster rendering with Puppeteer
- High-resolution poster generation
- Exact user-provided headline rendering
- Poster persistence
- Authenticated poster history
- Poster detail retrieval
- Poster regeneration
- Regeneration attempt limits
- Poster deletion
- Ownership checks
- Request validation with Zod
- Authentication middleware
- Error handling middleware
- Not-found handling
- Basic rate limiting
- Helmet security middleware
- CORS configuration
- Environment variable validation
- Health endpoint
- Template seeding script

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Zod
- Cloudinary
- Google Gemini through the Google GenAI SDK
- Puppeteer
- Multer
- express-rate-limit
- Helmet
- CORS
- dotenv
- tsx

## Architecture

```text
ai-political-poster-maker-backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   ├── db.ts
│   │   └── cloudinary.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── template/
│   │   ├── upload/
│   │   └── poster/
│   │
│   ├── services/
│   │   ├── cloudinary.service.ts
│   │   ├── gemini.service.ts
│   │   └── poster-render.service.ts
│   │
│   ├── utils/
│   │   ├── app-error.ts
│   │   ├── async-handler.ts
│   │   ├── jwt.ts
│   │   └── response.ts
│   │
│   └── types/
│       └── express.d.ts
│
├── scripts/
│   └── seed-templates.ts
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## API Base URL

Development:

```text
http://localhost:5000/api
```

The frontend should use:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

The exact Gemini model is configured through `GEMINI_MODEL` rather than hardcoded into the application's environment configuration.

### Environment Variable Responsibilities

| Variable | Purpose |
|---|---|
| `PORT` | Express server port |
| `NODE_ENV` | Application environment |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiration configuration |
| `CLIENT_URL` | Allowed frontend origin |
| `GEMINI_API_KEY` | Gemini API authentication |
| `GEMINI_MODEL` | Gemini model used by the generation service |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

Never expose these backend secrets through frontend `NEXT_PUBLIC_*` environment variables.

## Authentication

The backend uses JWT authentication.

### Register

```http
POST /api/auth/register
```

Creates a user account after validating the submitted registration data.

Passwords are hashed with bcrypt before being stored.

### Login

```http
POST /api/auth/login
```

Validates the user's credentials and returns an authentication token.

### Protected Requests

Protected endpoints expect:

```http
Authorization: Bearer <JWT>
```

The authentication middleware verifies the token and attaches the authenticated user information to the Express request.

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Authenticate a user |

### Templates

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/templates` | No | Retrieve active templates |
| GET | `/api/templates/:id` | No | Retrieve a specific template |

### Upload

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/upload` | Yes | Upload up to 3 poster photos |

### Posters

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/posters` | Yes | Create and generate a poster |
| GET | `/api/posters/me` | Yes | Retrieve the authenticated user's posters |
| GET | `/api/posters/:id` | Yes | Retrieve one owned poster |
| POST | `/api/posters/:id/regenerate` | Yes | Regenerate an owned poster |
| DELETE | `/api/posters/:id` | Yes | Delete an owned poster |

### Health

```http
GET /api/health
```

Used to verify that the backend server is running.

## API Response Format

Successful responses use a consistent response structure:

```json
{
  "success": true,
  "message": "Request successful.",
  "data": {}
}
```

Errors are handled centrally through the application's error middleware.

## User Model

The user model contains:

```text
name
email
passwordHash
role
createdAt
updatedAt
```

Supported roles currently include:

```text
user
admin
```

The MVP primarily uses authenticated user functionality. An admin dashboard is outside the current MVP scope.

## Template Model

Templates contain information such as:

```text
title
occasionType
thumbnailUrl
previewUrl
isActive
createdAt
updatedAt
```

Inactive templates are not intended to be available for normal poster creation.

Templates can be populated using the provided seed script.

## Poster Model

A poster stores information including:

```text
userId
templateId
name
designation
party
union
thana
district
occasionType
headline
photos
generatedImageUrl
generatedImagePublicId
status
generationAttempts
maxGenerationAttempts
layoutConfig
errorMessage
createdAt
updatedAt
```

Poster statuses include:

```text
generating
completed
failed
```

Posters are associated with their creating user so that authenticated users can only access their own poster resources.

## Poster Creation Flow

The backend poster creation pipeline is:

```text
POST /api/posters
        ↓
Validate authenticated user
        ↓
Validate request data
        ↓
Validate template
        ↓
Create poster record
        ↓
Generate AI-assisted layout configuration
        ↓
Render poster with Puppeteer
        ↓
Upload generated image to Cloudinary
        ↓
Save generated image information
        ↓
Mark poster as completed
        ↓
Return poster data
```

If generation fails, the poster is marked as failed and the error information is recorded.

## AI Generation Approach

The AI model is used for **layout and visual configuration**, not for rendering the final Bangla text directly into the generated image.

The AI-assisted layout configuration can determine properties such as:

- Theme colors
- Background style
- Headline alignment
- Headline position
- Headline font size
- Photo layout
- Photo shape
- Decorative elements

The service is instructed not to rewrite the user's supplied Bangla headline or introduce additional political slogans.

This approach keeps exact user-provided text under server-side rendering control instead of depending on image-generation text rendering.

## Poster Rendering

The final poster is rendered server-side using Puppeteer.

The renderer creates a fixed high-resolution poster canvas of:

```text
1200 × 1600 pixels
```

The rendering process combines:

- User-provided poster information
- User-provided Bangla headline
- Uploaded photos
- Selected template information
- AI-assisted layout configuration
- HTML/CSS styling

The final rendered image is captured as a high-resolution PNG and uploaded to Cloudinary.

## Why Server-Side Rendering Is Used

The AI model is not responsible for accurately drawing the final Bengali text.

Instead:

```text
Gemini
  ↓
Layout configuration
  ↓
HTML/CSS
  ↓
Puppeteer
  ↓
Exact text rendering
  ↓
1200 × 1600 image
```

This gives the application direct control over the final text and layout.

## Photo Uploads

The upload endpoint accepts image files through `multipart/form-data`.

Supported image formats are:

```text
JPEG
PNG
WebP
```

The MVP limits each upload request to a maximum of:

```text
3 photos
```

The backend uses Multer for multipart parsing and Cloudinary for image storage.

Uploaded images are associated with the authenticated user through the application's upload flow.

## Cloudinary Storage

Cloudinary is used for:

- User-uploaded photos
- Generated poster images

Generated poster records store the Cloudinary URL and public ID so that generated assets can also be removed when the corresponding poster is deleted.

## Regeneration

A poster can be regenerated through:

```http
POST /api/posters/:id/regenerate
```

The backend:

1. Verifies authentication.
2. Verifies poster ownership.
3. Verifies the poster and template.
4. Checks the regeneration attempt limit.
5. Requests another layout configuration.
6. Renders the poster again.
7. Uploads the new generated image.
8. Removes the previous generated Cloudinary asset.
9. Updates the poster record.

The poster model tracks:

```text
generationAttempts
maxGenerationAttempts
```

to prevent unlimited regeneration.

## Ownership and Authorization

Authentication and ownership checks are enforced on the backend.

For example, retrieving a poster does not rely only on a client-provided user ID.

The backend uses the authenticated JWT user identity and verifies that the requested poster belongs to that user.

This is why poster history uses:

```http
GET /api/posters/me
```

rather than requiring the frontend to provide an arbitrary user ID.

## Validation

Zod is used for request validation.

Validation is applied before business logic where appropriate.

The backend remains responsible for validation even though the frontend also performs client-side validation.

Client-side validation is therefore treated as a user-experience feature, not as a security boundary.

## Rate Limiting

Basic rate limiting is included for abuse-sensitive endpoints.

Authentication requests use a dedicated authentication rate limiter.

Poster generation uses a stricter generation-related rate limit because generation involves external services and server-side rendering.

Redis is not required for the current MVP.

The current rate limiting is application-level and suitable for the current single-backend MVP architecture.

## Security Middleware

The backend uses:

- Helmet
- CORS
- JWT authentication
- bcrypt password hashing
- Zod validation
- Request rate limiting
- Centralized error handling
- Ownership checks
- Environment-based secret management

## Error Handling

The backend uses centralized error handling through:

```text
AppError
asyncHandler
error.middleware.ts
not-found.middleware.ts
```

This keeps route handlers focused on application logic while allowing errors to be processed consistently.

## Database

MongoDB is used as the application's persistent database.

Mongoose provides:

- Schema definitions
- Models
- Validation support
- Queries
- Indexes
- Database connection management

The poster collection includes indexes supporting user-based poster history and poster status queries.

## Seed Templates

Template data can be seeded through:

```bash
npm run seed
```

The seed script is located at:

```text
scripts/seed-templates.ts
```

## Local Development

Install dependencies:

```bash
npm install
```

Create the environment file:

```text
.env
```

Configure the required values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=
GEMINI_MODEL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Seed the templates:

```bash
npm run seed
```

Start the development server:

```bash
npm run dev
```

The backend will normally be available at:

```text
http://localhost:5000
```

The API is available under:

```text
http://localhost:5000/api
```

## Build

Compile the TypeScript project:

```bash
npm run build
```

The compiled output is generated in:

```text
dist/
```

## Production Start

After building:

```bash
npm start
```

## Backend Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the development server with TypeScript watch mode |
| `npm run build` | Compile TypeScript |
| `npm start` | Start the compiled production server |
| `npm run seed` | Seed poster templates |

## Frontend Integration

The frontend communicates with this backend through REST APIs.

The main integration flow is:

```text
Next.js Frontend
      ↓
API Client
      ↓
Express REST API
      ↓
Authentication / Validation
      ↓
Application Services
      ↓
MongoDB / Cloudinary / Gemini / Puppeteer
```

The frontend should configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

The backend should allow the configured frontend origin through:

```env
CLIENT_URL=http://localhost:3000
```

## MVP Scope

The backend implements the core assignment workflow:

```text
Authentication
      ↓
Templates
      ↓
Photo Upload
      ↓
Poster Creation
      ↓
AI-assisted Layout
      ↓
Server-side Rendering
      ↓
Cloudinary Storage
      ↓
Poster History
      ↓
Preview / Download
      ↓
Regeneration
      ↓
Deletion
```

The following features are intentionally outside the current MVP scope:

- Admin dashboard
- Moderation workflow
- Advanced analytics
- Bulk poster generation
- Payment/subscription system
- PDF export
- WebSocket-based generation updates
- Background job queues
- Redis
- Advanced distributed generation infrastructure
- Collaboration features

These can be considered future extensions if the application grows beyond the MVP.

## Architecture Decisions

### Separate Frontend and Backend

The frontend and backend are maintained as separate applications.

This keeps:

- Browser-facing code separate from server-only code.
- Backend secrets away from the client.
- AI and rendering dependencies on the server.
- Database access on the server.

### Gemini for Layout Assistance

Gemini is used to assist with visual/layout decisions rather than directly rendering the final Bangla poster text.

### Puppeteer for Final Rendering

Puppeteer provides deterministic server-side HTML/CSS rendering and allows the backend to preserve the exact supplied text.

### Cloudinary for Image Storage

Cloudinary provides storage for uploaded photos and generated poster images without requiring the backend to store image binaries directly in MongoDB.

### MongoDB for Application Data

MongoDB stores users, templates, poster metadata, generation status, generation attempts, and generated image references.

### Redis Is Not Required for the MVP

The current application does not require Redis because the MVP does not depend on:

- Distributed rate limiting
- Background job queues
- Distributed caching
- WebSocket presence/state
- Shared ephemeral application state

Redis can be introduced later if the application requires those capabilities.

## Security Notes

- MongoDB credentials remain server-side.
- Gemini credentials remain server-side.
- Cloudinary API secrets remain server-side.
- JWT signing secrets remain server-side.
- Users cannot retrieve arbitrary users' posters through the authenticated poster endpoints.
- Uploads are limited by file count, size, and supported image types.
- Generation endpoints are rate limited.
- Backend validation is enforced independently of frontend validation.

## License

This project was created as an MVP assignment/project