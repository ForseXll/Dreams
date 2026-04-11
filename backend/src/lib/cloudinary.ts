import { createHash } from 'node:crypto';

export interface CloudinaryUploadResponse {
  eager?: Array<{ secure_url?: string; url?: string }>;
  original_filename?: string;
  public_id: string;
  resource_type: string;
  secure_url: string;
  url: string;
}

export interface CloudinarySignedUploadParams {
  apiKey: string;
  cloudName: string;
  folder?: string;
  publicId?: string;
  signature: string;
  timestamp: number;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getCloudinaryConfig() {
  return {
    apiKey: getRequiredEnv('CLOUDINARY_API_KEY'),
    apiSecret: getRequiredEnv('CLOUDINARY_API_SECRET'),
    cloudName: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || undefined,
  };
}

function buildSignaturePayload(params: Record<string, string | number | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}

export function signCloudinaryParams(params: Record<string, string | number | undefined>) {
  const { apiSecret } = getCloudinaryConfig();
  const payload = buildSignaturePayload(params);

  return createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

export function createSignedUploadParams(input: { folder?: string; publicId?: string } = {}): CloudinarySignedUploadParams {
  const { apiKey, cloudName, uploadFolder } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = input.folder || uploadFolder;
  const publicId = input.publicId;
  const signature = signCloudinaryParams({
    folder,
    public_id: publicId,
    timestamp,
  });
  return {
    apiKey,
    cloudName,
    folder,
    publicId,
    signature,
    timestamp,
  };
}

export async function uploadToCloudinary(input: {
  file: Blob;
  fileName?: string;
  folder?: string;
  publicId?: string;
}) {
  const { apiKey, cloudName, uploadFolder } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = input.folder || uploadFolder;
  const publicId = input.publicId;
  const signature = signCloudinaryParams({
    folder,
    public_id: publicId,
    timestamp,
  });

  const formData = new FormData();
  formData.append('file', input.file, input.fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  if (folder) {
    formData.append('folder', folder);
  }

  if (publicId) {
    formData.append('public_id', publicId);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloudinary upload failed with status ${response.status}: ${message}`);
  }

  return response.json() as Promise<CloudinaryUploadResponse>;
}
