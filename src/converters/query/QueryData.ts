/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import alasql from 'alasql';
import { FieldDerivation } from '../../api/spec/FieldDerivation';
import { fieldAPI, FieldResolver } from '../../api/spec/FieldAPI';
import { OutputSpec } from '../../api/spec/OutputSpec';
import { getOutputFields } from '../../api/spec/GetOutputFields';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { getFieldLabel } from './FieldLabel';

/**
 * Run a query to shape the data properly for the given OutputSpec, aggregating, sorting, etc.
 * Note that aggregated fields use getFieldLable() to generate a column name such as "average somefield".
 */
export function queryData(outputSpec: OutputSpec, fieldResolver: FieldResolver, dataSemantics: DataSemantics, data: object[]): object[] {
  const queryString = getQueryString(outputSpec, fieldResolver, dataSemantics);
  return alasql(queryString, [data]);
}

/**
 * generate the SQL query needed for a concrete instantiation of an output spec.
 * Note that aggregated fields use getFieldLable() to generate a column name such as "average somefield".
 * SELECT (all fields w/ aggregation) GROUP BY (dimensions) ORDER BY (sort fields)
 */
export function getQueryString(outputSpec: OutputSpec, fieldResolver: FieldResolver, dataSemantics: DataSemantics): string {
  const allFields = getOutputFields(outputSpec, fieldResolver);
  const selectClause = getSelectClause(allFields);
  const groupByClause = getGroupByClause(allFields, dataSemantics);
  const orderByClause = getOrderByClause(outputSpec, fieldResolver);
  return selectClause + ' FROM ? ' + groupByClause + ' ' + orderByClause;
}

/** create the select clause, taking into account aggregations */
function getSelectClause(allFields: FieldSpec[]): string {
  const pieces = allFields.map(field => {
    const details = fieldAPI(field).asDetails();
    if (details && details.derivation) {
      const agg = derivationToSQL(details.derivation);
      const nameAndDerivation = escapeName(getFieldLabel(details));
      return agg + '(' + details.field + ') AS ' + nameAndDerivation;
    } else {
      return fieldAPI(field).getName();
    }
  });
  return 'SELECT ' + pieces.join(', ');
}

/** group by fields that don't aggregate */
function getGroupByClause(allFields: FieldSpec[], dataSemantics: DataSemantics): string {
  const dims = allFields.filter(field => {
    const name = fieldAPI(field).getName();
    const fieldType = dataSemantics[name] ? dataSemantics[name].type : 'Cat';
    if (fieldType === 'Qd') {
      return false; // don't group by a measure
    }
    // don't group by anything with an aggregation
    const derivation = dataSemantics[name] ? dataSemantics[name].derivation : undefined;
    if (derivation !== undefined) {
      return false;
    }
    const details = fieldAPI(field).asDetails();
    return !details || details.derivation === undefined;
  });
  if (dims.length === 0) {
    return '';
  }
  const pieces = dims.map(field => fieldAPI(field).getName());
  return 'GROUP BY ' + pieces.join(', ');
}

/** sort if there's a sort spec */
function getOrderByClause(outputSpec: OutputSpec, fieldResolver: FieldResolver): string {
  if (outputSpec.dataShape && outputSpec.dataShape.sort) {
    const sortSpec = outputSpec.dataShape.sort[0];
    const sortByField = fieldResolver.getField(sortSpec.sortBy);
    const sortByName = escapeName(getFieldLabel(sortByField));
    const order = sortSpec.sortType === 'descending' ? 'DESC' : 'ASC';
    return 'ORDER BY ' + sortByName + ' ' + order;
  }
  return '';
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

function escapeName(name: string): string {
  return '`' + name + '`';
}
