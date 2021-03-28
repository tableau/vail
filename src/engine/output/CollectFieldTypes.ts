/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars } from '../../api/spec/FieldVars';
import { FieldInfo } from '../../api/dataSemantics/FieldInfo';

/** The collection of fields of each type */
export interface FieldTypeCounts {
  readonly catAll: FieldSpec[];
  readonly quantAll: FieldSpec[];

  readonly cat: FieldSpec[];
  readonly catTime: FieldSpec[];
  readonly catGeo: FieldSpec[];
  readonly quantMeasure: FieldSpec[];
  readonly quantDimension: FieldSpec[];
  readonly quantLat: FieldSpec[];
  readonly quantLong: FieldSpec[];
}

/** collect types for specific fields */
export function collectFieldTypes(fields: FieldSpec[], info: DataSemantics, fieldVars?: FieldVars): FieldTypeCounts {
  const empty: FieldSpec[] = [];
  const collect = {
    catAll: empty.concat([]),
    quantAll: empty.concat([]),
    cat: empty.concat([]),
    catTime: empty.concat([]),
    catGeo: empty.concat([]),
    quantMeasure: empty.concat([]),
    quantDimension: empty.concat([]),
    quantLat: empty.concat([]),
    quantLong: empty.concat([]),
  };
  fields.forEach(field => {
    const fa = fieldAPI(field);
    if (fa.asVariable() && fieldVars) {
      const details = fa.resolveDetails(fieldVars);
      if (details.length > 0) {
        // use first field as a representative of the list in the field variable
        const name = details[0].field;
        addFieldType(field, info[name], collect);
      }
    } else {
      const name = fa.getName();
      addFieldType(field, info[name], collect);
    }
  });
  collect.catAll = collect.cat.concat(collect.catTime).concat(collect.catGeo);
  collect.quantAll = collect.quantMeasure
    .concat(collect.quantDimension)
    .concat(collect.quantLat)
    .concat(collect.quantLong);
  return collect;
}

function addFieldType(field: FieldSpec, info: FieldInfo, collect: FieldTypeCounts): void {
  if (!info) {
    return;
  }
  switch (info.type) {
    case 'Cat':
      collect.cat.push(field);
      break;
    case 'CTime':
      collect.catTime.push(field);
      break;
    case 'CGeo':
      collect.catGeo.push(field);
      break;
    case 'Qd':
    case 'CCurrency':
      collect.quantMeasure.push(field);
      break;
    case 'Qi':
      collect.quantDimension.push(field);
      break;
    case 'QLat':
      collect.quantLat.push(field);
      break;
    case 'QLon':
      collect.quantLong.push(field);
      break;
  }
}
