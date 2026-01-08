import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { env as ENV } from 'prisma/config';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const cloudName = ENV('CLOUDINARY_CLOUD_NAME');
    const apiKey = ENV('CLOUDINARY_API_KEY');
    const apiSecret = ENV('CLOUDINARY_API_SECRET');

    // console.log('Cloudinary Config:', { cloudName, apiKey, apiSecret });

    return cloudinary.config({
      cloud_name: 'dj8d3e2d9',
      api_key: '217645854594291',
      api_secret: '50z714QWdMPzGsYzmyChHHaxV0o',
    });
  },
};
