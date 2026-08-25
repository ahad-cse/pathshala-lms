/**
 * Blog Post & Publication Controller with Draft / Published Security Filter
 * 
 * Line-by-Line Reasoning for Video Walkthrough:
 * 1. Draft Isolation: Drafts (is_published === false) must NEVER be exposed to public visitors, students, or instructors.
 * 2. Query Filtering (find):
 *    - For unauthenticated visitors, Students, and Instructors: An explicit backend database filter { is_published: { $eq: true } } is enforced.
 *    - For Admin and Content Manager: All articles are returned so they can manage drafts and toggle publication.
 * 3. Single Article Lookup (findOne):
 *    - Allows lookup by either documentId or unique URL slug.
 *    - If the article is a draft and the requester is not an Admin or Content Manager, returns 404 Not Found (zero draft leakage).
 * 4. Authoring Permissions (create, update, delete):
 *    - Strictly enforced on the backend: Only Admin and Content Manager roles can author or edit blog posts.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    const canManageContent = user && (user.role_type === 'admin' || user.role_type === 'content_manager');

    ctx.query = {
      ...ctx.query,
      populate: {
        author: {
          fields: ['id', 'username', 'email'],
        },
        ...(typeof ctx.query.populate === 'object' ? ctx.query.populate : {}),
      },
    };

    // If not Admin or Content Manager, strictly enforce is_published filter
    if (!canManageContent) {
      ctx.query.filters = {
        ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
        is_published: {
          $eq: true,
        },
      };
    }

    return super.find(ctx);
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const canManageContent = user && (user.role_type === 'admin' || user.role_type === 'content_manager');

    // Attempt lookup by documentId or by unique slug
    let post: any = await strapi.documents('api::blog-post.blog-post').findOne({
      documentId: id,
      populate: ['author'],
    });

    if (!post) {
      const postsBySlug = await strapi.documents('api::blog-post.blog-post').findMany({
        filters: { slug: { $eq: id } },
        populate: ['author'],
      });
      if (postsBySlug && postsBySlug.length > 0) {
        post = postsBySlug[0];
      }
    }

    if (!post) {
      return ctx.notFound('Article not found.');
    }

    // If post is a draft and requester is not Admin/CM, block access
    if (!post.is_published && !canManageContent) {
      return ctx.notFound('Article not found.');
    }

    return ctx.send({ data: post });
  },

  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to create blog posts.');
    }

    if (user.role_type !== 'admin' && user.role_type !== 'content_manager') {
      return ctx.forbidden('Access denied: Only Content Managers and Admins can author blog posts.');
    }

    const { title, content, excerpt, cover_image_url, is_published, slug } = ctx.request.body?.data || {};

    if (!title || !content) {
      return ctx.badRequest('Article title and content are required.');
    }

    // Auto-generate slug from title if not supplied
    const generatedSlug = slug || title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat('-', Date.now().toString().slice(-4));

    const userEntry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
      select: ['id', 'documentId'],
    });

    const userDocId = userEntry?.documentId || user.documentId;

    const newPost = await strapi.documents('api::blog-post.blog-post').create({
      data: {
        title,
        slug: generatedSlug,
        content,
        excerpt: excerpt || '',
        cover_image_url: cover_image_url || '',
        is_published: !!is_published,
        ...(is_published ? { published_date: new Date().toISOString() } : {}),
        author: userDocId,
      },
      populate: ['author'],
    });

    return ctx.created({ data: newPost });
  },

  async update(ctx) {
    const user = ctx.state.user;

    if (!user || (user.role_type !== 'admin' && user.role_type !== 'content_manager')) {
      return ctx.forbidden('Access denied: Only Content Managers and Admins can update blog posts.');
    }

    const { is_published } = ctx.request.body?.data || {};
    if (is_published !== undefined) {
      if (is_published) {
        ctx.request.body.data.published_date = new Date().toISOString();
      }
    }

    return super.update(ctx);
  },

  async delete(ctx) {
    const user = ctx.state.user;

    if (!user || (user.role_type !== 'admin' && user.role_type !== 'content_manager')) {
      return ctx.forbidden('Access denied: Only Content Managers and Admins can delete blog posts.');
    }

    return super.delete(ctx);
  },
}));
