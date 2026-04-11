import { apiClient } from './client';

interface SignedCloudinaryUploadParams {
  apiKey: string;
  cloudName: string;
  folder?: string;
  publicId?: string;
  signature: string;
  timestamp: number;
}

interface CloudinaryUploadResult {
  eager?: Array<{ secure_url?: string }>;
  secure_url: string;
  url: string;
}

export function createCloudinaryUploadSignature(input?: { folder?: string; publicId?: string }) {
  return apiClient.post<SignedCloudinaryUploadParams>('/api/uploads/cloudinary/sign', input ?? {});
}

export async function uploadImageToCloudinary(file: File, input?: { folder?: string; publicId?: string }) {
  const signed = await createCloudinaryUploadSignature(input);
  if (!signed) {
    throw new Error('Unable to create Cloudinary upload signature');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signed.apiKey);
  formData.append('timestamp', String(signed.timestamp));
  formData.append('signature', signed.signature);

  if (signed.folder) {
    formData.append('folder', signed.folder);
  }

  if (signed.publicId) {
    formData.append('public_id', signed.publicId);
  }
  const response = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    body: formData,
    method: 'POST',
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    const message = payload?.error?.message || `Cloudinary upload failed with status ${response.status}`;
    throw new Error(message);
  }

  const payload = (await response.json()) as CloudinaryUploadResult;

  return {
    image: payload.secure_url,
    largeImage: payload.eager?.[0]?.secure_url || payload.secure_url,
  };
}
