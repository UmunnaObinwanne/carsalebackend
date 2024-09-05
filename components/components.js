// components/component-loader.js
import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

const Components = {
  ImageUpload: componentLoader.add('ImageUpload', './ImageUpload')
};

export { componentLoader, Components };
