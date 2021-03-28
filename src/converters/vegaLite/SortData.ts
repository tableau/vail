/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import alasql from 'alasql';
import { FieldDerivation } from '../../api/spec/FieldDerivation';
import { FieldResolver } from '../../api/spec/FieldAPI';
import { SortSpec } from '../../api/spec/OutputSpec';

/**
 * use the sort spec to figure out how to sort the data
 * @returns sort field & sorted data
 */
export function sortData(sortSpec: SortSpec, fieldResolver: FieldResolver, data: object[], descending: boolean): [string, object[]] {
  const sortByField = fieldResolver.getField(sortSpec.sortBy);
  const sortByName = sortByField.field;
  const sortByAgg = derivationToSQL(sortByField.derivation);
  const field = fieldResolver.getField(sortSpec.field).field;

  // Create an aggregated dataset that can be used to compute the focusLimit and as input to Vegalite.
  const queryString = 'SELECT ' + field + ', ' + sortByAgg + '(' + sortByName + ') AS ' + sortByName + ' FROM ? GROUP BY ' + field;
  let res = alasql(queryString, [data]);
  if (descending) {
    res.sort((a: any, b: any) => (b[sortByName] > a[sortByName] ? 1 : -1));
  } else {
    res.sort((a: any, b: any) => (a[sortByName] > b[sortByName] ? 1 : -1));
  }
  return [sortByName, res];
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
