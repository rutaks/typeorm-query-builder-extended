import { SelectQueryBuilder } from 'typeorm';
import { ComparisonOperator, LookupDelimiter, LookupFilter, WhereCondition } from './enums';
import { isValidLookupFilter } from './validation.util';

export class FilterBuilder {
  /**
   * Parses the query string &
   * builds a query targeted to the respective column in the specified table
   * using the respective lookup assigned in the string
   * @param queryBuilder query builder to assign built query to
   * @param keyLookup string holding the column alias and query lookup option
   * @param queryValue value to use to query
   * @param condition where condition prop mentioning if condition is or is not an addition condition
   */
  public static build(
    queryBuilder: SelectQueryBuilder<any>,
    keyLookup: string,
    queryValue: string,
    condition: WhereCondition,
  ): void {
    const { EQ, I_LIKE } = ComparisonOperator;
    const [columnWithAlias, lookup] = keyLookup.split(LookupDelimiter.LOOKUP_DELIMITER); // Separate query column name from the query lookup operation
    const [alias, column] = columnWithAlias.split(LookupDelimiter.COLUMN_NAME_DELIMITER); // get table alias & table column name
    const queryValueObj = {}; // query value object used to parse query value into the query builder
    queryValueObj[column] = queryValue; // set query value to key of query object
    let query = '';
    let q: any = {};

    if (!lookup) {
      query = `${alias}.${column} ${EQ} :${column}`;
      queryBuilder[condition](query, queryValueObj);
      return;
    }

    if (!isValidLookupFilter(lookup)) {
      throw new Error(`Lookup ${lookup} not supported.`);
    }

    q = { alias, column, condition, queryValueObj };
    this.buildLookupQuery(query, lookup, queryValue, q, queryBuilder);
  }

  private static buildLookupQuery(
    query: string,
    lookup: string,
    queryValue: string,
    queryObj: {
      alias: string;
      column: string;
      condition: WhereCondition;
      queryValueObj: Record<string, any>;
    },
    queryBuilder: SelectQueryBuilder<any>,
  ) {
    const { alias, column, condition, queryValueObj } = queryObj;
    if (lookup === LookupFilter.CONTAINS) {
      query = this.getQueryString({ alias, column, lookup: ComparisonOperator.I_LIKE });
      queryValueObj[column] = `%${queryValue}%`;
      queryBuilder[condition](query, queryValueObj);
    } else if (lookup === LookupFilter.IN) {
      this.buildInLookupFilter(queryBuilder, queryValue, queryObj);
    } else if (lookup === LookupFilter.BETWEEN) {
      const options = queryValue.split(',');
      queryBuilder[condition](`${alias}.${column} BETWEEN ${options[0]} AND ${options[1]}`);
    } else if (lookup === LookupFilter.JSON_ARRAY_CONTAINS) {
      this.buildJsonBLookupFilter(queryBuilder, queryValue, queryObj);
    } else {
      const queryLookup = this.filterLookupToComparisonOperator(lookup);
      query = this.getQueryString({ alias, column, lookup: queryLookup });
      queryBuilder[condition](query, queryValueObj);
    }
  }

  /**
   * Builds query for IN database operation
   * @param queryBuilder
   * @param queryValue
   * @param query
   */
  private static buildInLookupFilter(
    queryBuilder: SelectQueryBuilder<any>,
    queryValue: string,
    query: {
      alias: string;
      column: string;
      condition: WhereCondition;
      queryValueObj: Record<string, any>;
    },
  ): void {
    const { alias, column, condition, queryValueObj } = query;
    const options = queryValue.split(',');
    queryValueObj[column] = '(';
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      queryValueObj[column] += `'${option}'${i === options.length - 1 ? ')' : ','}`;
    }
    queryBuilder[condition](`${alias}.${column} IN ${queryValueObj[column]}`);
  }

  /**
   * Builds a query to find value in a JSONB column
   * @param queryBuilder
   * @param queryValue
   * @param alias
   * @param column
   * @param queryValueObj
   */
  private static buildJsonBLookupFilter(
    queryBuilder: SelectQueryBuilder<any>,
    queryValue: string,
    query: {
      alias: string;
      column: string;
      queryValueObj: Record<string, any>;
    },
  ): void {
    const { alias, column, queryValueObj } = query;
    // Finds values in jsonB column similar to options received
    // i.e: `colors__jsonarrcontain=GREEN,RED,BLUE` will be change into an array containing [GREEN,RED,BLUE]
    const options = queryValue.split(',');
    queryValueObj[column] = '';

    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      queryValueObj[column] += `'${option}'${i === options.length - 1 ? '' : ','}`;
    }

    // Add jsonB query with array generated from options
    queryBuilder.andWhere(`${alias}.${column} ::jsonb ?| array[${queryValueObj[column]}]`);
  }

  /**
   * Generates a query string
   * @param queryObj Query props
   * @returns query string
   */
  private static getQueryString(queryObj: { alias: string; column: string; lookup: string }) {
    return `${queryObj?.alias}.${queryObj?.column} ${queryObj?.lookup} :${queryObj?.column}`;
  }

  private static filterLookupToComparisonOperator(filter: string) {
    switch (filter) {
      case LookupFilter.LESS_THAN:
        return ComparisonOperator.LT;
      case LookupFilter.LESS_THAN_OR_EQUAL:
        return ComparisonOperator.LTE;
      case LookupFilter.GREATER_THAN:
        return ComparisonOperator.GT;
      case LookupFilter.GREATER_THAN_OR_EQUAL:
        return ComparisonOperator.GTE;
      case LookupFilter.EQUAL:
        return ComparisonOperator.EQ;
      case LookupFilter.NOT:
        return ComparisonOperator.NOT_EQ;
    }
  }
}
