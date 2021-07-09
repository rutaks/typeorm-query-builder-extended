import { LookupFilter } from './enums';

/**
 * Checks if string is included in possible lookup filters
 */
export const isValidLookupFilter = (lookup: string): boolean => (Object as any).values(LookupFilter).includes(lookup);
