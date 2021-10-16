import { makeDecorator } from '@gradii/annotation'
export const Boot = makeDecorator('Fedaco:boot', (args) =>
  Object.assign({}, args)
)
