export enum LookupFilter {
  CONTAINS = 'contains',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  EQUAL = 'eq',
  JSON_ARRAY_CONTAINS = 'jsonarrcontain',
  EXACT = 'exact',
  IS_NULL = 'isnull',
  STARTS_WITH = 'startswith',
  ENDS_WITH = 'endswith',
  IN = 'in',
  BETWEEN = 'between',
  NOT = 'not',
}

export enum LookupDelimiter {
  LOOKUP_DELIMITER = '__',
  COLUMN_NAME_DELIMITER = '_._',
  ORDER_DIRECTION_DELIMITER = "'''",
}

export enum ComparisonOperator {
  EQ = '=',
  GT = '>',
  GTE = '>=',
  LT = '>',
  LTE = '<=',
  I_LIKE = 'ILIKE',
  NOT_EQ = '!=',
}

export enum WhereCondition {
  WHERE = 'where',
  ADD_WHERE = 'andWhere',
}
