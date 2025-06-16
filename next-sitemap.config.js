// next-sitemap.config.js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://masterprima.site',
  generateRobotsTxt: true,
  exclude: [
    '/auth-mp-secure-2024/*',   // dashboard & auth
    // Path berikut hanya jika benar-benar ingin DITUTUP dari Google
    '/',
    '/about',
    '/blog',
    '/price',
    '/blog/*',                 // untuk semua detail post: /blog/slug
  ],
};
