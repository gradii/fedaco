import { DefaultTheme } from 'vitepress';

export function sidebarDatabase(): DefaultTheme.SidebarItem[] {
  return [
    {
      text     : 'Database',
      collapsed: false,
      base     : '/database',
      items    : [
        {text: 'Getting Started', link: '/getting-started'},
      ],
    },
    {
      text     : 'Drivers',
      collapsed: false,
      base     : '/database',
      items    : [
        {text: 'SQLite Driver', link: '/sqlite-driver'},
        {text: 'MySQL Driver', link: '/mysql-driver'},
        {text: 'PostgreSQL Driver', link: '/postgres-driver'},
        {text: 'SQL Server Driver', link: '/sqlserver-driver'},
      ],
    },
    {
      text     : 'Transactions',
      collapsed: false,
      base     : '/database',
      items    : [
        {text: 'Transactions Guide', link: '/transactions'},
        {text: 'Transaction Options', link: '/transaction-options'},
        {text: 'Transaction With Models', link: '/transaction-with-models'},
      ],
    },
    {
      text     : 'Schema',
      collapsed: false,
      base     : '/database',
      items    : [
        {text: 'Schema Operations', link: '/schema-operations'},
      ],
    },
  ];
}
