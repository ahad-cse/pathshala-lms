import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'pathshala_admin_jwt_secret_default_key_32c'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'pathshala_api_token_salt_default_key_32c'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'pathshala_transfer_salt_default_key_32c'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY', undefined),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
