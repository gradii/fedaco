import {defineConfig} from 'vitepress';
import {sidebarGuide} from './sidebar-guide';
import {sidebarRelationships} from './sidebar-relationships';
import {sidebarModelFunctions} from './sidebar-model-functions';
import {sidebarDatabase} from './sidebar-database';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Fedaco ORM",
  description: "Laravel Eloquent With Typescript",
  ignoreDeadLinks: true,
  base: '/fedaco/',
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2021-2024 Gradii.'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Guide', link: '/guide/getting-started'},
      {text: 'Database', link: '/database/getting-started'},
      {text: 'Relationships', link: '/relationships/defining-relationships/relation-one-to-one'},
      {text: 'Model Functions', link: '/model-functions/attach'},
      {text: 'Examples', link: 'https://github.com/gradii/fedaco-examples'}
    ],

    sidebar: {
      '/guide/': {
        base: '/guide/',
        items: sidebarGuide()
      },
      '/database/': {
        base: '/database/',
        items: sidebarDatabase()
      },
      'relationships': {
        base: '/relationships',
        items: sidebarRelationships()
      },
      '/model-functions/': {
        base: '/model-functions/',
        items: sidebarModelFunctions()
      }
    },

    socialLinks: [
      {icon: 'github', link: 'https://github.com/gradii/fedaco'}
    ]
  }
})


