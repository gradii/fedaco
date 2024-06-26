import { DefaultTheme } from 'vitepress';

export function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [
    {
      text     : 'Database',
      collapsed: false,
      base     : '/database',
      items    : [
        {text: 'Getting Started', link: '/getting-started'},
      ]
    },

  ];
}
