/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentTrend } from '../../api/spec/IntentSpec';
import { putFieldsInProperty } from './PutFieldsInProperty';

/**
 * Fill in missing information in a trend intent
 */
export function fillInTrendIntent(
  intent: IntentTrend,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentTrend, FieldVars] {
  [intent, fieldVars] = fillInMeasure(intent, fields, fieldVars, dataSemantics);
  [intent, fieldVars] = fillInTime(intent, fields, fieldVars, dataSemantics);
  return [intent, fieldVars];
}

/** fill in intent.measure if not present */
function fillInMeasure(
  intent: IntentTrend,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentTrend, FieldVars] {
  if (intent.measure) {
    return [intent, fieldVars];
  }

  const toAdd = fields.filter(field => dataSemantics[field.field].type === 'Qd');
  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'measure', toAdd, fieldVars);
  return [newIntent as IntentTrend, newFieldVars];
}

/** fill in intent.time if not present */
function fillInTime(
  intent: IntentTrend,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentTrend, FieldVars] {
  if (intent.time) {
    return [intent, fieldVars];
  }

  const toAdd = fields.filter(field => dataSemantics[field.field].type === 'CTime');
  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'time', toAdd, fieldVars);
  return [newIntent as IntentTrend, newFieldVars];
}
