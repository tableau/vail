/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentDistribution } from '../../api/spec/IntentSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { putFieldsInProperty } from './PutFieldsInProperty';

/**
 * Fill in missing information in a distribution intent.
 */
export function fillInDistributionIntent(
  intent: IntentDistribution,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentDistribution, FieldVars] {
  [intent, fieldVars] = fillInBinField(intent, fields, fieldVars, dataSemantics);
  return [intent, fieldVars];
}

/** if we need intent.field but it's missing, figure out a reasonable value for it */
function fillInBinField(
  intent: IntentDistribution,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentDistribution, FieldVars] {
  if (intent.binField) {
    return [intent, fieldVars];
  }

  // collect fields that are Qi, Qd, or CCurrency
  const qi = fields.filter(field => dataSemantics[field.field].type === 'Qi');
  const qd = fields.filter(field => dataSemantics[field.field].type === 'Qd');
  const currency = fields.filter(field => dataSemantics[field.field].type === 'CCurrency');
  const fullList = qi.concat(qd).concat(currency);

  // if there's an explicit binCount, set that on all fields
  const toAdd = intent.binCount
    ? fullList.map(f => {
        return { ...f, binCount: intent.binCount };
      })
    : fullList;

  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'binField', toAdd, fieldVars);
  return [newIntent as IntentDistribution, newFieldVars];
}
