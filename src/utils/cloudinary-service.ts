import cloudinary from '@/configs/cloudinary.config';

export default async function upload(path: string, options: object = {}): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(path, options);
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
  }
}
