/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentCorrelation } from '../../api/spec/IntentSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { putFieldsInProperties, putFieldsInProperty } from './PutFieldsInProperty';
import { fieldAPI } from '../../api/spec/FieldAPI';

/**
 * Fill in missing information in a correlation intent.
 */
export function fillInCorrelationIntent(
  intent: IntentCorrelation,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentCorrelation, FieldVars] {
  if (intent.field1 && intent.field2) {
    return [intent, fieldVars];
  }

  const possible = fields.filter(field => dataSemantics[field.field].stats.dataType === 'numeric');
  if (possible.length === 0) {
    return [intent, fieldVars]; // no useful fields to use
  }

  // make sure the final inferred field isn't the same as the other field
  if (intent.field1 && !intent.field2) {
    const other = fieldAPI(intent.field1).resolveDetails(fieldVars);
    const list = getSecondList(other, possible);
    return putFieldsInProperty(intent, 'field2', list, fieldVars) as [IntentCorrelation, FieldVars];
  } else if (!intent.field1 && intent.field2) {
    const other = fieldAPI(intent.field2).resolveDetails(fieldVars);
    const list = getSecondList(other, possible);
    return putFieldsInProperty(intent, 'field1', list, fieldVars) as [IntentCorrelation, FieldVars];
  }

  // both properties will reference the same field variable of possible fields,
  return putFieldsInProperties(intent, ['field1', 'field2'], 'field', possible, fieldVars) as [IntentCorrelation, FieldVars];
}

/** return a list that looks like 'all' but doesn't start with the first item in 'first' */
function getSecondList(first: FieldDetails[], all: FieldDetails[]): FieldDetails[] {
  if (first.length === 0 || all.length <= 1 || !fieldAPI(first[0]).areEqual(all[0])) {
    // either the first items don't match, or there aren't enough fields to bother changing the list
    return all;
  }
  // put the first item in 'all' at the end
  return all.slice(1).concat(all[0]);
}
