import { DefaultTheme } from 'vitepress';

export function sidebarRelationships(): DefaultTheme.SidebarItem[] {
  return [
    {text: 'Query Relationships', link: '/query-relationships',},
    {text: 'Aggregating Related Models', link: '/aggregating-related-models'},
    {text: 'Eager Loading', link: '/eager-loading'},
    {text: 'Inserting and Updating Related Models', link: 'inserting-and-updating-related-models'},
    {text: 'Touching Parent Timestamps', link: 'touching-parent-timestamps'},
    {
      text     : 'Defining Relationships',
      base     : '/relationships/defining-relationships',
      collapsed: false,
      items    : [
        {text: 'Relation One To One', link: '/relation-one-to-one'},
        {text: 'Relation One To Many', link: '/relation-one-to-many'},
        {text: 'Relation Has One Of Many', link: '/relation-has-one-of-many'},
        {text: 'Relation Has One Through', link: '/relation-has-one-through'},
        {text: 'Relation Has Many Through', link: '/relation-has-many-through'},
      ]
    },
    {
      text     : 'Many To Many',
      base     : '/relationships/many-to-many-relationship',
      collapsed: false,
      items    : [
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
    },
    {
      text     : 'Polymorphic Relationships',
      base     : '/relationships/polymorphic-relationships',
      collapsed: false,
      items    : [
        {text: 'Polymorphic Introduction', link: '/polymorphic-introduction'},
        {text: 'Polymorphic One To One', link: '/polymorphic-one-to-one'},
        {text: 'Polymorphic One To Many', link: '/polymorphic-one-to-many'},
        {text: 'Polymorphic One Of Many', link: '/polymorphic-one-of-many'},
        {text: 'Polymorphic Many To Many', link: '/polymorphic-many-to-many'},
        {text: 'Custom Polymorphic Types', link: '/custom-polymorphic-types'},
      ]
    }
  ];
}
