import { BaseProvider } from '@adminjs/upload';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Page from '../models/pageModel.js';
import uploadFeature from '@adminjs/upload';
import { componentLoader } from '../components/components.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom Cloudinary Provider
class CloudinaryProvider extends BaseProvider {
  constructor() {
    super('page-images'); // 'page-images' is the folder name in Cloudinary
  }

  // Upload a file to Cloudinary
  async upload(file, key) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: this.bucket }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve({ key: result.public_id, ...result });
      }).end(file.buffer);
    });
  }

  // Delete a file from Cloudinary
  async delete(key, bucket) {
    return cloudinary.uploader.destroy(`${bucket}/${key}`);
  }

  // Get the file path (URL) from Cloudinary
  async path(key, bucket) {
    return cloudinary.url(`${bucket}/${key}`);
  }
}

const cloudinaryProvider = new CloudinaryProvider();

const PageResource = {
  resource: Page,
  options: {
    properties: {
      content: {
        type: 'richtext',
      },
      slug: {
        isVisible: { edit: true, list: true, filter: true, show: true },
        position: 2,
        isDisabled: false,
      },
      title: {
        isTitle: true,
        position: 1,
      },
      featuredImage: {
        type: 'string',
        isVisible: { list: true, filter: true },
        label: 'Featured Image',
        custom: {
          description: 'Upload the main image for this page (Max size: 2MB)',
        },
      },
    },
  },
  features: [
      uploadFeature({
        componentLoader,
      provider: cloudinaryProvider,
      properties: {
        key: 'featuredImage', // Maps to `featuredImage` field in your model
        mimeType: 'mimeType',
        file: 'file',
      },
      validation: { mimeTypes: ['image/png', 'image/jpeg', 'image/gif'] },
    }),
  ],
};

export default PageResource;
