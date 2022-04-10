import { getRepository, SelectQueryBuilder } from 'typeorm';
import { ExtendedQueryBuilder } from '../src';
import { Owner } from './models/owner.entity';

const OWNER_ALIAS = 'o';

describe('QueryBuilder Tests', () => {
  const generateQueryStr = (qb: SelectQueryBuilder<any>, queryObj: Record<string, any>) => {
    return new ExtendedQueryBuilder(qb, queryObj).build().getQuery();
  };

  it('Should sanitize query', () => {
    const testQueryObj = { 'o_._name': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    const builder = new ExtendedQueryBuilder(qb, testQueryObj, ['limit', 'page']);
    expect(builder.build().getQuery()).toBeTruthy();
  });

  it('Should throw error when query object is empty', () => {
    const testQueryObj = {};
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(() => generateQueryStr(qb, testQueryObj)).toThrow();
  });

  it('Should throw error when query object is empty', () => {
    const testQueryObj = {};
    expect(() => generateQueryStr(null, testQueryObj)).toThrow();
  });

  it('Should return <equal_lookup> query string', () => {
    const testQueryObj = { 'o_._name': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE o.name = :name');
  });

  it('Should return query with more than one operand', () => {
    const testQueryObj = { 'o_._name': 'Sam', 'o_._gender': 'MALE' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE o.name = :name AND "o"."gender" = :gender');
  });

  it('Should return <contains_lookup> query string', () => {
    const testQueryObj = { 'o_._name__contains': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE o.name ILIKE :name');
  });

  it('Should throw error when lookup not found', () => {
    const testQueryObj = { 'o_._name__fakelookup': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(() => generateQueryStr(qb, testQueryObj)).toThrow();
  });

  it('Should return query string with order sorting', () => {
    const testQueryObj = { order: `o_._name'''asc` };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toBeTruthy();
  });

  it('Should return <lt_lookup> query string', () => {
    const testQueryObj = { 'o_._dob__lt': '2011-10-05T14:48:00.000Z' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE "o"."dob" < :dob');
  });

  it('Should return <lte_lookup> query string', () => {
    const testQueryObj = { 'o_._dob__lte': '2011-10-05T14:48:00.000Z' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE "o"."dob" <= :dob');
  });

  it('Should return <gt_lookup> query string', () => {
    const testQueryObj = { 'o_._dob__gt': '2011-10-05T14:48:00.000Z' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE "o"."dob" > :dob');
  });

  it('Should return <gte_lookup> query string', () => {
    const testQueryObj = { 'o_._dob__gte': '2011-10-05T14:48:00.000Z' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE "o"."dob" >= :dob');
  });

  it('Should return <eq_lookup> query string', () => {
    const testQueryObj = { 'o_._isDeleted__eq': false };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE "o"."isDeleted" = :isDeleted`);
  });

  it('Should return <not_lookup> query string', () => {
    const testQueryObj = { 'o_._isDeleted__not': false };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE "o"."isDeleted" != :isDeleted`);
  });

  it('Should return <between_lookup> query string', () => {
    const testQueryObj = { 'o_._name__between': 'Sam,Stan' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE o.name BETWEEN Sam AND Stan`);
  });

  it('Should return <eq> query string', () => {
    const testQueryObj = { 'o_._name__between': 'Sam,Stan' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE o.name BETWEEN Sam AND Stan`);
  });

  it('Should return <jsonarrcontain_lookup> query string', () => {
    const testQueryObj = { 'o_._name__jsonarrcontain': 'Sam,Stan' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE o.name ::jsonb ?| array['Sam','Stan']`);
  });
});
