import {DefaultTheme} from "vitepress";

export function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        {text: 'Getting Started', link: '/getting-started'},
        {text: 'Migration Guide', link: '/migration'},
        {text: 'Nest Integration', link: '/nest-integration'},
      ]
    },
    {
      text: 'Connections',
      collapsed: false,
      items: [
        {text: 'Multiple Connections', link: '/multiple-connections'},
        {text: 'Connection Pooling & Isolated Transactions', link: '/connection-pooling'},
      ]
    },
    {
      text: 'Extending',
      collapsed: false,
      items: [
        {text: 'Writing a Custom Driver', link: '/custom-driver'},
      ]
    },

  ]
}
