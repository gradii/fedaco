import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Fedaco ORM",
  description: "Laravel Eloquent With Typescript",
  ignoreDeadLinks: true,
  base: '/fedaco/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Model Functions', link: '/model-functions/attach'}
    ],

    sidebar: [
      {
        text: 'Model Functions',
        items: [
          {text: 'Function Attach', link: '/model-functions/attach'},
          {text: 'Function Chunk', link: '/model-functions/chunk'},
          {text: 'Function ChunkById', link: '/model-functions/chunkById'},
          {text: 'Function Count', link: '/model-functions/count'},
          {text: 'Function Create', link: '/model-functions/create'},
          {text: 'Function CreateQuery', link: '/model-functions/createQuery'},
          {text: 'Function Delete', link: '/model-functions/delete'},
          {text: 'Function DoesntExist', link: '/model-functions/doesntExist'},
          {text: 'Function Each', link: '/model-functions/each'},
          {text: 'Function EachById', link: '/model-functions/eachById'},
          {text: 'Function Fillable', link: '/model-functions/fillable'},
          {text: 'Function Find', link: '/model-functions/find'},
          {text: 'Function FindOrFail', link: '/model-functions/findOrFail'},
          {text: 'Function FindOrNew', link: '/model-functions/findOrNew'},
          {text: 'Function First', link: '/model-functions/first'},
          {text: 'Function FirstOrCreate', link: '/model-functions/firstOrCreate'},
          {text: 'Function FirstOrNew', link: '/model-functions/firstOrNew'},
          {text: 'Function FormatISO', link: '/model-functions/formatISO'},
          {text: 'Function ForPageAfterId', link: '/model-functions/forPageAfterId'},
          {text: 'Function Fresh', link: '/model-functions/fresh'},
          {text: 'Function FromDateTime', link: '/model-functions/fromDateTime'},
          {text: 'Function FromQuery', link: '/model-functions/fromQuery'},
          {text: 'Function GetAttribute', link: '/model-functions/getAttribute'},
          {text: 'Function GetConnectionName', link: '/model-functions/getConnectionName'},
          {text: 'Function GetCountForPagination', link: '/model-functions/getCountForPagination'},
          {text: 'Function GetQuery', link: '/model-functions/getQuery'},
          {text: 'Function GetRelation', link: '/model-functions/getRelation'},
          {text: 'Function GroupBy', link: '/model-functions/groupBy'},
          {text: 'Function Has', link: '/model-functions/has'},
          {text: 'Function Head', link: '/model-functions/head'},
          {text: 'Function InitAttributes', link: '/model-functions/initAttributes'},
          {text: 'Function Insert', link: '/model-functions/insert'},
          {text: 'Function Is', link: '/model-functions/is'},
          {text: 'Function IsIgnoringTouch', link: '/model-functions/isIgnoringTouch'},
          {text: 'Function IsNumber', link: '/model-functions/isNumber'},
          {text: 'Function Join', link: '/model-functions/join'},
          {text: 'Function Match', link: '/model-functions/match'},
          {text: 'Function Max', link: '/model-functions/max'},
          {text: 'Function Min', link: '/model-functions/min'},
          {text: 'Function MorphMap', link: '/model-functions/morphMap'},
          {text: 'Function NewQuery', link: '/model-functions/newQuery'},
          {text: 'Function NewRelation', link: '/model-functions/newRelation'},
          {text: 'Function Oldest', link: '/model-functions/oldest'},
          {text: 'Function Paginate', link: '/model-functions/paginate'},
          {text: 'Function Pluck', link: '/model-functions/pluck'},
          {text: 'Function Save', link: '/model-functions/save'},
          {text: 'Function SaveOrFail', link: '/model-functions/saveOrFail'},
          {text: 'Function Select', link: '/model-functions/select'},
          {text: 'Function SetConnection', link: '/model-functions/setConnection'},
          {text: 'Function SetDateFormat', link: '/model-functions/setDateFormat'},
          {text: 'Function SetRawAttributes', link: '/model-functions/setRawAttributes'},
          {text: 'Function StartOfSecond', link: '/model-functions/startOfSecond'},
          {text: 'Function ToArray', link: '/model-functions/toArray'},
          {text: 'Function ToJSON', link: '/model-functions/toJSON'},
          {text: 'Function ToSql', link: '/model-functions/toSql'},
          {text: 'Function ToThrowError', link: '/model-functions/toThrowError'},
          {text: 'Function Update', link: '/model-functions/update'},
          {text: 'Function UpdateOrCreate', link: '/model-functions/updateOrCreate'},
          {text: 'Function UseConnection', link: '/model-functions/useConnection'},
          {text: 'Function Where', link: '/model-functions/where'},
          {text: 'Function WhereColumn', link: '/model-functions/whereColumn'},
          {text: 'Function WhereHas', link: '/model-functions/whereHas'},
          {text: 'Function With', link: '/model-functions/with'},
        ]
      },
      {}
    ],

    socialLinks: [
      {icon: 'github', link: 'https://github.com/gradii/fedaco'}
    ]
  }
})
