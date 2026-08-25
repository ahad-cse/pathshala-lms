import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', env('URL', undefined)),
  proxy: true,
  app: {
    keys: env.array('APP_KEYS', [
      'pathshala_app_key_1_random_32chars_long_key_a',
      'pathshala_app_key_2_random_32chars_long_key_b',
      'pathshala_app_key_3_random_32chars_long_key_c',
      'pathshala_app_key_4_random_32chars_long_key_d',
    ]),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});

export default config;
