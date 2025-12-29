import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { env as ENV } from 'prisma/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: ENV('CLOUDINARY_CLOUD_NAME'),
      api_key: ENV('CLOUDINARY_API_KEY'),
      api_secret: ENV('CLOUDINARY_API_SECRET'),
    });
  },
};
