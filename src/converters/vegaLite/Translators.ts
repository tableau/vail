/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { AnyMark } from 'vega-lite/build/src/mark';
import { StandardType } from 'vega-lite/build/src/type';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { FieldResolver } from '../../api/spec/FieldAPI';
import { OutputSpec, VizType } from '../../api/spec/OutputSpec';

/**
 * Functions that convert from VAIL types to VegaLite types
 */

/** convert VAIL viz type to vega-lite viz type */
export function convertVizType(vizType?: VizType): AnyMark {
  switch (vizType) {
    case 'textTable':
      return 'text';
    case 'scatterPlot':
      return 'circle';
    case 'bar':
    case 'histogram':
      return 'bar';
    case 'line':
      return 'line';
    default:
      return 'circle';
  }
}

type SortType = 'descending' | 'ascending';
type VLFieldType = 'ordinal' | 'quantitative' | 'nominal' | 'temporal';

interface VLFieldDef {
  field: string;
  type: VLFieldType;
  sort?: { field: string; op: string; order: SortType };
}

/** convert VAIL field info to vega-lite field info */
export function convertFieldType(
  field: FieldSpec,
  outputSpec: OutputSpec,
  dataSemantics: DataSemantics,
  fieldResolver: FieldResolver
): VLFieldDef {
  const fieldName = fieldResolver.getField(field).field;
  const fieldInfo = dataSemantics[fieldName];
  const vegaType = getVegaType(fieldInfo.type);
  const vlFieldDef = { field: fieldName, type: vegaType };
  return tackOnSort(vlFieldDef, outputSpec, fieldResolver);
}

function getVegaType(type: string): StandardType {
  let vegaType: VLFieldType = 'ordinal';
  switch (type) {
    case 'Cat':
    case 'CGeo':
      vegaType = 'ordinal';
      break;
    case 'CTime':
      vegaType = 'temporal';
      break;
    case 'Qd':
    case 'CCurrency':
      vegaType = 'quantitative';
      break;
    case 'Qi':
      vegaType = 'nominal';
      break;
    case 'QLat':
    case 'QLon':
      vegaType = 'quantitative';
      break;
  }
  return vegaType;
}

/** if OutputSpec sorts on the field, tack it onto vlField */
function tackOnSort(vlField: VLFieldDef, outputSpec: OutputSpec, fieldResolver: FieldResolver): VLFieldDef {
  if (outputSpec.dataShape && outputSpec.dataShape.sort) {
    for (const sortSpec of outputSpec.dataShape.sort) {
      const sortField = fieldResolver.getField(sortSpec.field).field;
      if (vlField.field === sortField) {
        const sortSortBy = fieldResolver.getField(sortSpec.sortBy).field;
        return { ...vlField, sort: { field: sortSortBy, op: 'sum', order: sortSpec.sortType as SortType } };
      }
    }
  }
  return vlField;
}
