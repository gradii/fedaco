import { ProcessorInterface } from './processor-interface';

export class Processor implements ProcessorInterface {

  processSelect(queryBuilder, results) {
    return results;
  }

  processInsertGetId(){

  }
}