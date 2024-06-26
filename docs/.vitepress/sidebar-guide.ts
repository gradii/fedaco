import {DefaultTheme} from "vitepress";

export function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        {text: 'Getting Started', link: '/getting-started'},
      ]
    },

  ]
}
