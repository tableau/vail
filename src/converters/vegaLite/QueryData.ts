/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import alasql from 'alasql';
import { FieldDerivation } from '../../api/spec/FieldDerivation';
import { FieldResolver } from '../../api/spec/FieldAPI';
import { OutputSpec, SortSpec } from '../../api/spec/OutputSpec';

/** Run a query to shape the data properly for the given OutputSpec, aggregating, sorting, etc. */
export function queryData(outputSpec: OutputSpec, fieldResolver: FieldResolver, data: object[]): object[] {
  if (outputSpec.dataShape && outputSpec.dataShape.sort) {
    const sortSpec = outputSpec.dataShape.sort[0];
    return sortData(sortSpec, fieldResolver, data);
  }
  // TODO: aggregate, etc.
  return data;
}

/**
 * use the sort spec to figure out how to sort the data
 * @returns sorted data
 */
export function sortData(sortSpec: SortSpec, fieldResolver: FieldResolver, data: object[]): object[] {
  // TODO: query for all fields from the OutputSpec
  const sortByField = fieldResolver.getField(sortSpec.sortBy);
  const sortByName = sortByField.field;
  const sortByAgg = derivationToSQL(sortByField.derivation);
  const field = fieldResolver.getField(sortSpec.field).field;
  const descending = sortSpec.sortType === 'descending';

  // Create an aggregated dataset that can be used to compute the focusLimit and as input to Vegalite.
  const queryString = 'SELECT ' + field + ', ' + sortByAgg + '(' + sortByName + ') AS ' + sortByName + ' FROM ? GROUP BY ' + field;
  let res = alasql(queryString, [data]);
  if (descending) {
    res.sort((a: any, b: any) => (b[sortByName] > a[sortByName] ? 1 : -1));
  } else {
    res.sort((a: any, b: any) => (a[sortByName] > b[sortByName] ? 1 : -1));
  }
  return res;
}

/** VAIL field derivation to SQL command */
function derivationToSQL(derivation?: FieldDerivation): string {
  switch (derivation) {
    case 'sum':
      return 'SUM';
    case 'average':
      return 'AVG';
    case 'min':
      return 'MIN';
    case 'max':
      return 'MAX';
    case 'count':
      return 'COUNT';
    case 'median':
      return 'MEDIAN';
    // TODO: finish the rest of these
  }
  return 'SUM';
}
