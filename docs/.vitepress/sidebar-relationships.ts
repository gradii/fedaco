import { DefaultTheme } from 'vitepress';

export function sidebarRelationships(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Defining Relationships',
      base: '/relationships/defining-relationships',
      collapsed: false,
      items: [
        {text: 'Relation One To One', link: '/relation-one-to-one'},
        {text: 'Relation One To Many', link: '/relation-one-to-many'},
        {text: 'Relation Has One Of Many', link: '/relation-has-one-of-many'},
        {text: 'Relation Has One Through', link: '/relation-has-one-through'},
        {text: 'Relation Has Many Through', link: '/relation-has-many-through'},
      ]
    },
    {
      text: 'Many To Many',
      base: '/relationships/many-to-many-relationship',
      collapsed: false,
      items: [
        {
          text: 'Relation Many To Many',
          link: '/relation-many-to-many'
        },
        {
          text: 'Retrieving Intermediate Table Columns',
          link: '/retrieving-intermediate-table-columns'
        },
        {
          text: 'Filtering Queries via Intermediate Table Columns',
          link: '/filtering-queries-via-intermediate-table-columns'
        },
        {
          text: 'Ordering Queries via Intermediate Table Columns',
          link: '/ordering-queries-via-intermediate-table-columns'
        },
        {
          text: 'Defining Custom Intermediate Table Models',
          link: '/defining-custom-intermediate-table-models'
        }
      ]
    }
  ]
}
