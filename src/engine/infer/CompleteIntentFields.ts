/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars, MutableFieldVars } from '../../api/spec/FieldVars';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { VailIntentSpec } from '../../api/spec/VailIntentSpec';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';

/** take all fields that are just names and flesh them out with defaults from the data source */
export function completeIntentFields(intent: VailIntentSpec, dataSemantics: DataSemantics): VailIntentSpec {
  const intentFields = getFullFields(dataSemantics, intent.intentFields);
  const fieldVars = fillInFieldVars(dataSemantics, intent.fieldVars);
  const intents = fillInIntents(dataSemantics, intent.intents);
  return { intentFields, fieldVars, intents };
}

function fillInFieldVars(dataSemantics: DataSemantics, fieldVars?: FieldVars): FieldVars | undefined {
  if (!fieldVars) {
    return fieldVars;
  }
  const newVars: MutableFieldVars = {};
  const varNames = Object.getOwnPropertyNames(fieldVars);
  varNames.forEach(name => {
    const newContent = getFullFields(dataSemantics, fieldVars[name]);
    if (newContent) {
      newVars[name] = newContent;
    }
  });
  return newVars;
}

function fillInIntents(dataSemantics: DataSemantics, intents?: IntentSpec[]): IntentSpec[] | undefined {
  if (!intents) {
    return intents;
  }
  return intents.map(intent => {
    const props = getIntentMetadata(intent).allFields;
    // make a new intent with modified properties
    const newIntent = { ...intent };
    props.forEach(p => {
      const value = (intent as any)[p];
      if (Array.isArray(value)) {
        const fields = value.map(v => getFullField(dataSemantics, v));
        (newIntent as any)[p] = fields;
      } else if (value) {
        (newIntent as any)[p] = getFullField(dataSemantics, value);
      }
    });
    return newIntent;
  });
}

function getFullFields(dataSemantics: DataSemantics, fields?: FieldSpec[]): FieldSpec[] | undefined {
  if (!fields) {
    return fields;
  }
  return fields.map(f => getFullField(dataSemantics, f));
}

/** if the field spec isn't explicit about things like derivation & bin size, use properties from the data source */
function getFullField(dataSemantics: DataSemantics, field: FieldSpec): FieldSpec {
  if (!isFieldIncomplete(field)) {
    return field;
  }
  const fieldName = fieldAPI(field).getName(); // we know it's not fieldVar so we can simply get the name
  const fieldInfo = dataSemantics[fieldName];
  if (!fieldInfo) {
    return field;
  } else if (fieldInfo.derivation === undefined && fieldInfo.binCount === undefined) {
    return field;
  }
  return { field: fieldName, derivation: fieldInfo.derivation, binCount: fieldInfo.binCount };
}

/** return true if all we have is the name of the field */
function isFieldIncomplete(field: FieldSpec): boolean {
  const fa = fieldAPI(field);
  if (fa.asVariable()) {
    return false;
  }
  const fd = fa.asDetails();
  return fd === null || (fd.derivation === undefined && fd.binCount === undefined);
}
