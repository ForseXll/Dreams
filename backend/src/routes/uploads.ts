import { z } from 'zod';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { createSignedUploadParams, uploadToCloudinary } from '../lib/cloudinary';

const signUploadSchema = z.object({
  folder: z.string().min(1).optional(),
  publicId: z.string().min(1).optional(),
});

export async function uploadRoutes(fastify) {
  fastify.post('/uploads/cloudinary/sign', {
    schema: {
      tags: ['Uploads'],
      summary: 'Create signed Cloudinary upload parameters',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        properties: {
          folder: { type: 'string' },
          publicId: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            apiKey: { type: 'string' },
            cloudName: { type: 'string' },
            folder: { type: 'string' },
            publicId: { type: 'string' },
            signature: { type: 'string' },
            timestamp: { type: 'integer' },
          },
        },
      },
    },
    preHandler: [authMiddleware, requirePermission('ITEMCREATE')],
  }, async (request) => {
    const body = signUploadSchema.parse(request.body || {});
    const signed = createSignedUploadParams(body);
    console.log('signed', signed);
    return signed;
  });

  fastify.post('/uploads/cloudinary', {
    schema: {
      tags: ['Uploads'],
      summary: 'Upload an image to Cloudinary through the backend',
      security: [{ bearerAuth: [] }],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            image: { type: 'string' },
            largeImage: { type: 'string' },
            originalFilename: { type: 'string' },
            publicId: { type: 'string' },
            resourceType: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: [authMiddleware, requirePermission('ITEMCREATE')],
  }, async (request, reply) => {
    const file = await request.file();

    if (!file) {
      return reply.status(400).send({ error: 'File is required' });
    }

    const cloudinaryResponse = await uploadToCloudinary({
      file: new Blob([await file.toBuffer()], { type: file.mimetype }),
      fileName: file.filename,
    });

    return {
      image: cloudinaryResponse.secure_url,
      largeImage: cloudinaryResponse.eager?.[0]?.secure_url || cloudinaryResponse.secure_url,
      originalFilename: cloudinaryResponse.original_filename || file.filename,
      publicId: cloudinaryResponse.public_id,
      resourceType: cloudinaryResponse.resource_type,
    };
  });
}
