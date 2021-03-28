/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { fieldAPI } from '../../api/spec/FieldAPI';
import { VariableFieldDetails } from '../../api/spec/FieldSpec';
import { FieldVars, MutableFieldVars } from '../../api/spec/FieldVars';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';
import { IntentSpec } from '../../api/spec/IntentSpec';

/**
 * clear out all the inferred properties on an intent specification
 * @param intent return a cleared version of this intent
 * @param fieldVars return a version without fieldVars referenced from intent
 * @param fieldProps properties that are fields, which might reference a fieldVar
 * @param otherProps properties with a value that might need to be removed
 */
export function clearInferred(intent: IntentSpec, fieldVars: FieldVars): [IntentSpec, FieldVars] {
  const inferred = intent.inferred;
  if (!inferred) {
    return [intent, fieldVars];
  }

  // remove the list of inferred properties
  intent = { ...intent, inferred: undefined };
  const intentMetadata = getIntentMetadata(intent);
  // remove properties that are fields
  for (let prop of intentMetadata.inferrableFields) {
    if (inferred.includes(prop)) {
      [intent, fieldVars] = removeVariableProperty(intent, prop, fieldVars);
      (intent as any)[prop] = undefined;
    }
  }
  // remove any other properties
  for (let prop of intentMetadata.inferrableProperties) {
    if (inferred.includes(prop)) {
      (intent as any)[prop] = undefined;
    }
  }
  return [intent, fieldVars];
}

/** if intent.property is a field var, remove it and the field var */
export function removeVariableProperty(intent: IntentSpec, property: string, fieldVars: FieldVars): [IntentSpec, FieldVars] {
  if (!fieldAPI((intent as any)[property]).asVariable()) {
    return [intent, fieldVars];
  }

  // remove property from intent
  const generic = { ...intent } as any;
  const varName = (generic[property] as VariableFieldDetails).varName;
  generic[property] = undefined;

  // remove fieldVar it referenced
  const newFieldVars: MutableFieldVars = {};
  const allVars = Object.getOwnPropertyNames(fieldVars);
  allVars.forEach(v => {
    if (v !== varName) {
      newFieldVars[v] = fieldVars[v];
    }
  });

  return [generic, newFieldVars];
}
