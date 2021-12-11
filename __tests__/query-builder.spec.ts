import { getRepository, SelectQueryBuilder } from 'typeorm';
import { ExtendedQueryBuilder } from '../src';
import { Owner } from './models/owner.entity';

const OWNER_ALIAS = 'o';

describe('QueryBuilder Tests', () => {
  const generateQueryStr = (qb: SelectQueryBuilder<any>, queryObj: Record<string, any>) => {
    return new ExtendedQueryBuilder(qb, queryObj).build().getQuery();
  };

  it('Should return <equal_lookup> query string', () => {
    const testQueryObj = { 'o_._name': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE o.name = :name');
  });

  it('Should return <contains_lookup> query string', () => {
    const testQueryObj = { 'o_._name__contains': 'Sam' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    expect(generateQueryStr(qb, testQueryObj)).toContain('WHERE o.name ILIKE :name');
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

  it('Should return <in_lookup> query string', () => {
    const testQueryObj = { 'o_._name__in': 'Sam,Stan' };
    const repo = getRepository(Owner);
    const qb = repo.createQueryBuilder(OWNER_ALIAS);
    qb.select('o.name');
    expect(generateQueryStr(qb, testQueryObj)).toContain(`WHERE o.name IN ('Sam','Stan')`);
  });

  it('Should return <between_lookup> query string', () => {
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
