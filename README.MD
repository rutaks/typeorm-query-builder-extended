<div align="center">
    <img src="https://raw.githubusercontent.com/rutaks/typeorm-query-builder-extended/main/assets/img/logo.png" width="200" height="200">
</div>
<h1 align="center"> TypeORM Query Builder Extended</h1>
<div align="center">
  <img src="https://img.shields.io/npm/dt/typeorm-query-builder-extended.svg">
  <img src="https://img.shields.io/npm/v/typeorm-query-builder-extended.svg">
  <a href="https://codecov.io/gh/rutaks/typeorm-query-builder-extended">
    <img src="https://codecov.io/gh/rutaks/typeorm-query-builder-extended/branch/main/graph/badge.svg?token=IFVV7MUUOT"/>
</a>
</div>

This library allows you to automatically transform a Express.js `req.query` or a valid key/value object into a TypeORM SelectQueryBuilder that allows the option of making queries to a foreign relation/table through the query or key/value object parsed

## Installation

```bash
yarn add typeorm-query-builder-extended
```

OR

```bash
npm install typeorm-query-builder-extended
```

## How does it work?

<div align="center">
    <img src="https://raw.githubusercontent.com/rutaks/typeorm-query-builder-extended/main/assets/img/how_it_works.png" width="800" height="400">
</div>

A `req.query string` or `valid key/value object` is sent to the builder along with the initial `SelectQueryBuilder` that should have been previously created. The builder converts all props from the query object into a valid `SelectQueryBuilder` props and appends it to the afore added `SelectQueryBuilder`

## Usage

Use ExtendedQueryBuilder export from package and pass your `req.query` or `key/value object` as arguments:

```typescript
import { ExtendedQueryBuilder } from 'typeorm-query-builder-extended';

const queryBuilder = <YOUR_REPOSITORY>.createQueryBuilder(<YOUR_ALIAS>); // <YOUR_REPOSITORY> i.e: personRepository | <YOUR_ALIAS> i.e: person

const builder = new ExtendedQueryBuilder(queryBuilder, req.query); // The third parameter is an optional array of properties in the req.query that you do not want in the database query object.(i.e: page, limit, etc)
const builtQuery = builder.build();
// Now your query is built, use get the rows queried for
const results = builtQuery.getRawMany();
```

## Structure of string query

One query is mainly of 4 parts:

- Table Alias `The Alias denoting table in the query string`
- Table column name `The name of column of the table being queried on`
- Query Lookup `The operation done on the table`
- Table Column Value `The value of the query operation`

### Full Structure

`foo/?<TABLE_ALIAS>_._<COLUMN_NAME>__<LOOKUP>=<COLUMN_VALUE>`

#### The table alias

Denoted by `_._` in the query string

i.e: `person_._`

```typescript
/* Omitted... */.createQueryBuilder('person');
```

- Or when using joins:

```typescript
.
.
.
queryBuilder.leftJoin('person.company', 'company');
```

#### The table's column name

Denoted by `__`
i.e:

- `person_._firstName__ (IF YOU HAVE A LOOKUP YOU WANT TO ADD)`
- `person_._firstName (IF YOU DO NOT HAVE A LOOKUP YOU WANT TO ADD)`

#### The query's lookup

Check the available lookups [here](#available-lookups)

#### The table's column value

This is denoted by adding it after your query lookup

## Example

- You can find a demo project of the package [here](https://github.com/rutaks/typeorm-query-builder-extended-demo)

```typescript
import { getRepository } from 'typeorm';
import { ExtendedQueryBuilder } from 'typeorm-query-builder-extended';
import { User } from './path-to-your-entity/User'; // Your typeORM entity class

.
.
.

app.get('/foo', (req, res) => {
  const userRepository = getRepository(User);
  const queryBuilder = userRepository.createQueryBuilder('user');
  const builder = new ExtendedQueryBuilder(queryBuilder, req.query);
  const builtQuery = builder.build();
  const results = builtQuery.getMany();
  return res.status(200).send(results); //returned results from the built query
});
```

## Available Lookups

| Lookup             | Behaviour                                                                      | Example                               | Types Working on        |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------------------- | ----------------------- |
| _(none)_           | Return entries that match with value                                           | `foo=sam`                             | `String, Number, Enums` |
| **contains**       | Return entries that contains value                                             | `foo__contains=sa`                    | `String, Enums`         |
| **startswith**     | Return entries that starts with value                                          | `foo__startswith=a`                   | `String`                |
| **endswith**       | Return entries that ends with value                                            | `foo__endswith=am`                    | `String`                |
| **lt**             | Return entries with value less than or equal to provided                       | `foo__lt=18`                          | `Number, Date`          |
| **lte**            | Return entries with value less than provided                                   | `foo__lte=18`                         | `Number, Date`          |
| **gt**             | Returns entries with value greater than provided                               | `foo__gt=18`                          | `Number, Date`          |
| **gte**            | Return entries with value greater than or equal to provided                    | `foo__gte=18`                         | `Number, Date`          |
| **in**             | Return entries that match with values in list                                  | `foo__in=developer,tester`            | `String, Enums, Number` |
| **between**        | Return entries in range                                                        | `foo__between=1,27`                   | `String, Number`        |
| **jsonarrcontain** | Return entries that match a jsonb array column that contains value in the list | `foo__jsonarrcontain=RED,BLUE,ORANGE` | `String, Number, Enums` |
| **not**            | Return entries that do not match with value                                    | `foo__not=ACTIVE`                     | `String, Number, Enums` |
