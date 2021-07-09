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
    const { EQ, GT, GTE, LT, LTE, I_LIKE } = ComparisonOperator;
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

    switch (lookup) {
      case LookupFilter.CONTAINS:
        query = `${alias}.${column} ${I_LIKE} :${column}`;
        queryValueObj[column] = `%${queryValue}%`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.LESS_THAN:
        query = `${alias}.${column} ${LT} :${column}`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.LESS_THAN_OR_EQUAL:
        query = `${alias}.${column} ${LTE} :${column}`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.GREATER_THAN:
        query = `${alias}.${column} ${GT} :${column}`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.GREATER_THAN_OR_EQUAL:
        query = `${alias}.${column} ${GTE} :${column}`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.EQUAL:
        query = `${alias}.${column} ${EQ} :${column}`;
        queryBuilder[condition](query, queryValueObj);
        break;
      case LookupFilter.IN:
        q = { alias, column, condition, queryValueObj };
        this.buildInLookupFilter(queryBuilder, queryValue, q);
        break;
      case LookupFilter.BETWEEN:
        const options = queryValue.split(',');
        queryBuilder[condition](`${alias}.${column} BETWEEN ${options[0]} AND ${options[1]}`);
        break;
      case LookupFilter.JSON_ARRAY_CONTAINS:
        q = { alias, column, queryValueObj };
        this.buildJsonBLookupFilter(queryBuilder, queryValue, q);
        break;
      default:
        throw new Error(`Lookup ${lookup} not supported yet`);
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
      if (i === options.length - 1) {
        queryValueObj[column] += `'${option}')`;
      } else {
        queryValueObj[column] += `'${option}',`;
      }
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
      if (i === options.length - 1) {
        queryValueObj[column] += `'${option}'`;
      } else {
        queryValueObj[column] += `'${option}',`;
      }
    }

    // Add jsonB query with array generated from options
    queryBuilder.andWhere(`${alias}.${column} ::jsonb ?| array[${queryValueObj[column]}]`);
  }
}
