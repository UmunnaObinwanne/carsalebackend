import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import PageResource from './resources/pageResources.js';
import { componentLoader } from './components/components.js';

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
  resources: [PageResource],
  componentLoader,
  branding: {
    logo: '/shopmart logo.jpg',
  },
  rootPath: '/admin',
});

const adminJsRouter = AdminJSExpress.buildRouter(adminJs);

export { adminJs, adminJsRouter };
