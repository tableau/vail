/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentFocus } from '../../api/spec/IntentSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../api/spec/FieldSpec';
import { putFieldsInProperty } from './PutFieldsInProperty';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { getCountDistinct } from '../../api/dataSemantics/FieldStats';

/**
 * Fill in missing information in a focus intent.
 */
export function fillInFocusIntent(
  intent: IntentFocus,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentFocus, FieldVars] {
  [intent, fieldVars] = fillInField(intent, fields, fieldVars, dataSemantics);
  [intent, fieldVars] = fillInSortBy(intent, fields, fieldVars, dataSemantics);
  intent = fillInStrategy(intent);
  return [intent, fieldVars];
}

/** if we need intent.field but it's missing, figure out a reasonable value for it */
function fillInField(
  intent: IntentFocus,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentFocus, FieldVars] {
  let possibleFields: FieldDetails[] = [];
  if (!intent.field && intent.adjective) {
    possibleFields = fieldsFromAdjective(intent, fields, dataSemantics);
  } else if (!intent.field && intent.values) {
    possibleFields = fieldsFromValues(intent, fields, dataSemantics);
  }

  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'field', possibleFields, fieldVars);
  return [newIntent as IntentFocus, newFieldVars];
}

function fieldsFromAdjective(intent: IntentFocus, fields: FieldDetails[], dataSemantics: DataSemantics): FieldDetails[] {
  const possibleFields: FieldDetails[] = [];
  for (const field of fields) {
    const stats = dataSemantics[field.field].stats;
    // limit to text fields
    if (stats.dataType === 'text') {
      if (!intent.quantity) {
        possibleFields.push(field);
      } else {
        // if we have a quantity, limit it to fields with at least that many unique values
        const count = getCountDistinct(stats);
        if (count === 'unknown' || count > intent.quantity) {
          possibleFields.push(field);
        }
      }
    }
  }
  return possibleFields;
}

// look thru all intent.values to find which fields have those values in their domain
function fieldsFromValues(intent: IntentFocus, fields: FieldDetails[], dataSemantics: DataSemantics): FieldDetails[] {
  let possibleFields: FieldDetails[] = [];
  if (intent.values) {
    for (const value of intent.values) {
      const fieldsForValue = fieldsFromValue(value, fields, dataSemantics);
      // if value wasn't part of any domain, we'll ignore it, assuming it was a typo,
      // otherwise we'll get the intersection of our previous list & the new list
      if (fieldsForValue.length > 0) {
        if (possibleFields.length === 0) {
          // first value
          possibleFields = fieldsForValue;
        } else {
          // find intersection
          possibleFields = possibleFields.filter(f => fieldsForValue.some(f2 => fieldAPI(f).areEqual(f2)));
        }
        if (possibleFields.length === 0) {
          // no fields, so abort
          return [];
        }
      }
    }
  }
  return possibleFields;
}

// find which fields have the given value in its domain
function fieldsFromValue(value: string, fields: FieldDetails[], dataSemantics: DataSemantics): FieldDetails[] {
  const possibleFields: FieldDetails[] = [];
  const names = Object.getOwnPropertyNames(dataSemantics);
  for (const name of names) {
    const fieldInfo = dataSemantics[name];
    const stats = fieldInfo ? fieldInfo.stats : null;
    if (stats) {
      if (stats.dataType === 'text' && stats.domain.includes(value)) {
        possibleFields.push({ field: name, derivation: fieldInfo.derivation, binCount: fieldInfo.binCount });
      } else if (stats.dataType === 'numeric' && stats.domain.includes(Number.parseFloat(value))) {
        possibleFields.push({ field: name, derivation: fieldInfo.derivation, binCount: fieldInfo.binCount });
      }
    }
  }
  return possibleFields;
}

function fillInSortBy(
  intent: IntentFocus,
  fields: FieldDetails[],
  fieldVars: FieldVars,
  dataSemantics: DataSemantics
): [IntentFocus, FieldVars] {
  if (intent.sortBy || !intent.adjective) {
    return [intent, fieldVars];
  }

  const possibleFields: FieldDetails[] = [];
  const possibleCurrencyFields: FieldDetails[] = [];
  const isCurrency =
    intent.adjective === 'cheap' ||
    intent.adjective === 'cheapest' ||
    intent.adjective === 'expensive' ||
    intent.adjective === 'most expensive';
  // any numeric fields in use are possibilities for 'sortBy'
  for (const field of fields) {
    const names = fieldAPI(field).resolveNames(fieldVars);
    for (const name of names) {
      const fieldInfo = dataSemantics[name];
      if (isCurrency) {
        // First check if adjective is of currency type and find a currency field if possible
        if (fieldInfo.type === 'CCurrency') {
          possibleCurrencyFields.push({ field: name });
        }
      }
      if (fieldInfo.stats.dataType === 'numeric') {
        possibleFields.push({ field: name });
      }
    }
  }

  // if there's currency use it, else use basic list
  if (possibleCurrencyFields.length > 0) {
    const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'sortBy', possibleCurrencyFields, fieldVars);
    return [newIntent as IntentFocus, newFieldVars];
  }
  const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'sortBy', possibleFields, fieldVars);
  return [newIntent as IntentFocus, newFieldVars];
}

/** default to 'highlight' if strategy isn't specified */
function fillInStrategy(intent: IntentFocus): IntentFocus {
  if (intent.strategy !== undefined) {
    return intent;
  }
  const inferred = intent.inferred ? intent.inferred.concat('strategy') : ['strategy'];
  return { ...intent, strategy: 'highlight', inferred };
}
