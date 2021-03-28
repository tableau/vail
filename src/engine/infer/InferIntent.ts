/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { VailIntentSpec } from '../../api/spec/VailIntentSpec';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { fillInFocusIntent } from './FillInFocusIntent';
import { FieldDerivation } from '../../api/spec/FieldDerivation';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { fillInTrendIntent } from './FillInTrendIntent';
import { fillInDistributionIntent } from './FillnDistribution';
import { TrackFields, trackIntentFields } from './TrackFields';
import { completeIntentFields } from './CompleteIntentFields';
import { clearInferred } from './ClearInferred';
import { fillInCorrelationIntent } from './FillInCorrelation';
import { fillInGeographicIntent } from './FillInGeographicIntent';

/** infer the missing portions of user intent */
export function inferIntent(spec: VailIntentSpec, dataSemantics: DataSemantics): VailIntentSpec {
  let newSpec = spec;
  const fieldVars: FieldVars = {};
  const trackFields = new TrackFields();

  // fill in missing details in the intent specs
  if (spec.intents) {
    const intents: IntentSpec[] = [];
    const fieldsToConsider = orderFields(spec, dataSemantics);
    let vars: FieldVars = {};
    for (const intent of spec.intents) {
      const [clearedIntent, clearedFieldVars] = clearInferred(intent, fieldVars);

      const [newIntent, newVars] = fillInIntent(clearedIntent, fieldsToConsider, clearedFieldVars, dataSemantics);
      intents.push(newIntent);
      vars = { ...vars, ...newVars };

      const newTracked = trackIntentFields(newIntent);
      trackFields.addTracked(newTracked);
    }

    const intentFields = trackFields.get();
    newSpec = { intentFields, intents, fieldVars: { ...fieldVars, ...vars } };
  }

  // fill in the field specs with proper derivation, etc.
  newSpec = completeIntentFields(newSpec, dataSemantics);

  return newSpec;
}

/** defer to intent-specific code to fill in missing or ambiguous details */
function fillInIntent(
  intent: IntentSpec,
  fieldsToConsider: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentSpec, FieldVars] {
  switch (intent.intentType) {
    case 'correlation':
      return fillInCorrelationIntent(intent, fieldsToConsider, fieldVars, dataSemantics);
    case 'distribution':
      return fillInDistributionIntent(intent, fieldsToConsider, fieldVars, dataSemantics);
    case 'focus':
      return fillInFocusIntent(intent, fieldsToConsider, fieldVars, dataSemantics);
    case 'geographic':
      return fillInGeographicIntent(intent, fieldsToConsider, fieldVars, dataSemantics);
    case 'trend':
      return fillInTrendIntent(intent, fieldsToConsider, fieldVars, dataSemantics);
  }
  return [intent, {}];
}

function orderFields(spec: VailIntentSpec, dataSemantics: DataSemantics): FieldDetails[] {
  const fields: FieldDetails[] = [];

  // get the fields in the data source
  const allFields = Object.getOwnPropertyNames(dataSemantics);
  allFields.forEach(field => pushIfUnique({ field }, fields, dataSemantics));

  return fields;
}

/**
 * add the field to the list if it's not already in the list
 */
function pushIfUnique(field: FieldDetails, list: FieldDetails[], dataSemantics: DataSemantics): void {
  const any = list.filter(item => item.field === field.field && item.derivation === field.derivation);
  if (any.length > 0) {
    return;
  }

  // not already in the list, so add it
  if (field.derivation === undefined && field.binCount === undefined) {
    let derivation = 'average' as FieldDerivation,
      binCount = 1;
    // if the field only has a name, get field info from the data source
    const fieldInfo = dataSemantics[field.field];
    if (fieldInfo) {
      derivation = fieldInfo.derivation!;
      binCount = fieldInfo.binCount!;
    }
    list.push({ field: field.field, derivation, binCount });
  } else {
    list.push(field);
  }
}
