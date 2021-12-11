import { SelectQueryBuilder } from 'typeorm';
import { WhereCondition } from './enums';
import { FilterBuilder } from './filter-builder';
import { SortingBuilder } from './sorting-builder';

class ExtendedQueryBuilder<T> {
  private queryBuilder: SelectQueryBuilder<T>;
  private queryObj: Record<string, any>;

  constructor(queryBuilder: SelectQueryBuilder<T>, queryObj: Record<string, any>) {
    if (!queryBuilder) {
      throw new Error('No query builder was provider to the instance');
    }
    if (Object.keys(queryObj)?.length < 1) {
      throw new Error('No query object was provider to the instance');
    }

    this.queryBuilder = queryBuilder;
    this.queryObj = queryObj;
  }

  /**
   * Traverses through the whole query obj parsed & builds a typeORM select query
   * @returns query builder
   */
  public build(): SelectQueryBuilder<T> {
    for (let i = 0; i < Object.keys(this.queryObj).length; i++) {
      let condition = WhereCondition.WHERE; // will be used to build query by either adding initial condition `where()` or addition condition(s) `addWhere()`
      const keyOperator = Object.keys(this.queryObj)[i]; // Get all keys from query string to use as columns to query the db
      const queryValue = this.queryObj[keyOperator]; // Get all values from query string to use as value to query the db

      if (keyOperator === 'order') {
        SortingBuilder.build(this.queryBuilder, queryValue);
        continue;
      }

      if (i > 0) {
        condition = WhereCondition.ADD_WHERE;
      }

      FilterBuilder.build(this.queryBuilder, keyOperator, queryValue, condition);
    }
    return this.queryBuilder;
  }
}

export default ExtendedQueryBuilder;
