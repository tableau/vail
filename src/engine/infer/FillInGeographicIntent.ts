/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentGeographic } from '../../api/spec/IntentSpec';
import { putFieldsInProperty } from './PutFieldsInProperty';

/**
 * Fill in missing information in a Geographic intent
 */
export function fillInGeographicIntent(
  intent: IntentGeographic,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentGeographic, FieldVars] {
  [intent, fieldVars] = fillInField(intent, fields, fieldVars, dataSemantics);
  [intent, fieldVars] = fillInGeo(intent, fields, fieldVars, dataSemantics);
  return [intent, fieldVars];
}

/** fill in intent.field if not present */
function fillInField(
  intent: IntentGeographic,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentGeographic, FieldVars] {
  if (intent.field) {
    return [intent, fieldVars];
  }

  const toAdd = fields.filter(field => dataSemantics[field.field].type === 'Qd');
  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'field', toAdd, fieldVars);
  return [newIntent as IntentGeographic, newFieldVars];
}

/** fill in intent.geo if not present */
function fillInGeo(
  intent: IntentGeographic,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentGeographic, FieldVars] {
  if (intent.geo) {
    return [intent, fieldVars];
  }

  const toAdd = fields.filter(field => dataSemantics[field.field].type === 'CGeo');
  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'geo', toAdd, fieldVars);
  return [newIntent as IntentGeographic, newFieldVars];
}
