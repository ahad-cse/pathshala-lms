import type { Core } from '@strapi/strapi';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // Find the Authenticated and Public roles in users-permissions
      const authenticatedRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      const publicRole = await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } });

      if (authenticatedRole) {
        // Actions to enable for Authenticated role
        const authActions = [
          'plugin::users-permissions.user.me',
          'api::auth-test.auth-test.adminOnly',
          'api::auth-test.auth-test.contentManagerOnly',
          'api::auth-test.auth-test.instructorOnly',
          'api::auth-test.auth-test.studentOnly',
        ];

        for (const action of authActions) {
          const perm = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: authenticatedRole.id,
              },
            });

          if (!perm) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: authenticatedRole.id,
              },
            });
          }
        }
      }

      if (publicRole) {
        // Enable public auth callback and register permissions
        const publicActions = [
          'plugin::users-permissions.auth.callback',
          'plugin::users-permissions.auth.register',
        ];

        for (const action of publicActions) {
          const perm = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({
              where: {
                action,
                role: publicRole.id,
              },
            });

          if (!perm) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action,
                role: publicRole.id,
              },
            });
          }
        }
      }

      // Seed / ensure 4 test demo accounts
      if (authenticatedRole) {
        const demoUsers = [
          {
            username: 'admin',
            email: 'admin@demo.com',
            role_type: 'admin',
          },
          {
            username: 'content_manager',
            email: 'content@demo.com',
            role_type: 'content_manager',
          },
          {
            username: 'instructor',
            email: 'instructor@demo.com',
            role_type: 'instructor',
          },
          {
            username: 'student',
            email: 'student@demo.com',
            role_type: 'student',
          },
        ];

        const defaultPassword = 'Password123!';

        for (const demo of demoUsers) {
          const existingUser = await strapi.db
            .query('plugin::users-permissions.user')
            .findOne({ where: { email: demo.email } });

          if (!existingUser) {
            await strapi.plugin('users-permissions').service('user').add({
              username: demo.username,
              email: demo.email,
              password: defaultPassword,
              role_type: demo.role_type,
              role: authenticatedRole.id,
              confirmed: true,
              blocked: false,
              provider: 'local',
            });

            strapi.log.info(
              `[SEED] Created demo user: ${demo.email} with role: ${demo.role_type}`
            );
          } else {
            // Update password & role_type if needed
            await strapi.plugin('users-permissions').service('user').edit(existingUser.id, {
              password: defaultPassword,
              role_type: demo.role_type,
              confirmed: true,
              blocked: false,
            });
          }
        }
      }
    } catch (err) {
      strapi.log.error('[BOOTSTRAP] Error during role & user bootstrap:', err);
    }
  },
};
