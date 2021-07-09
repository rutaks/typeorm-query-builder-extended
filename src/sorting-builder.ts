import { SelectQueryBuilder } from 'typeorm';
import { LookupDelimiter } from './enums';

export class SortingBuilder {
  /**
   * Evaluates, builds & add `ORDER BY` fields to the query builder
   * @param queryBuilder query builder to add fields in
   * @param queryValue order by value
   */
  public static build(queryBuilder: SelectQueryBuilder<any>, queryValue: string): void {
    const { ORDER_DIRECTION_DELIMITER } = LookupDelimiter;
    const orderOptions = queryValue.split(','); // Get all order options
    // Traverse all order options
    for (const option of orderOptions) {
      const [orderKey, orderDirection]: string[] = option.split(ORDER_DIRECTION_DELIMITER); // Get order key & order direction separated by "'"
      queryBuilder.orderBy(orderKey.replace('_._', '.'), orderDirection === 'asc' ? 'ASC' : 'DESC'); // Set order direction
    }
  }
}
