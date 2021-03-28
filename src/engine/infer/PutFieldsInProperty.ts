/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldDetails } from '../../api/spec/FieldSpec';
import { FieldVars, MutableFieldVars } from '../../api/spec/FieldVars';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';
import { IntentSpec } from '../../api/spec/IntentSpec';

/**
 * Put 0 or more fields into a property in an intent.
 * If 0, do nothing.
 * If 1, simply add the field.
 * If >1, put the list in a field variable and reference that from the intent.
 * @param intent specification to modify
 * @param property name of property to modify
 * @param fields list of fields to add to intent
 * @param fieldVars field variables to possibly add to
 */
export function putFieldsInProperty(
  intent: IntentSpec,
  property: string,
  fields: FieldDetails[],
  fieldVars: FieldVars
): [IntentSpec, FieldVars] {
  // validate that the property is an inferrable field of the given intent type
  const metadata = getIntentMetadata(intent);
  if (!metadata.inferrableFields.includes(property)) {
    throw new InvalidPropertyException(intent.intentType, property);
  }

  if (fields.length === 0) {
    // couldn't find anything useful to add
    return [intent, fieldVars];
  }

  const inferred = intent.inferred ? intent.inferred.concat(property) : [property];
  const generic = { ...intent, inferred } as any;
  if (fields.length === 1) {
    // add a single field
    generic[property] = fields[0];
    return [generic as IntentSpec, fieldVars];
  }

  // add a list of fields in a fieldVar
  const newFieldVars: MutableFieldVars = { ...fieldVars };
  // make field var name unique yet recognizable
  const varName = intent.intentType + '_' + property + (intent.id ? '_' + intent.id : '');
  newFieldVars[varName] = fields;
  generic[property] = { varName };
  return [generic as IntentSpec, newFieldVars];
}

/**
 * Put 0 or more fields into multiple properties in an intent.
 * If there are multiple fields, each property will reference the same field variable
 * with a unique index so that it's possible to permute the possibilities
 * @param intent specification to modify
 * @param properties name of properties to modify
 * @param unique a unique string to use in the fieldVar name
 * @param fields list of fields to add to intent
 * @param fieldVars field variables to possibly add to
 */
export function putFieldsInProperties(
  intent: IntentSpec,
  properties: string[],
  unique: string,
  fields: FieldDetails[],
  fieldVars: FieldVars
): [IntentSpec, FieldVars] {
  // if we don't need a fieldVar, defer to putFieldsInProperty
  if (fields.length <= 1) {
    properties.forEach(property => {
      [intent, fieldVars] = putFieldsInProperty(intent, property, fields, fieldVars);
    });
    return [intent, fieldVars];
  }

  // validate that the properties are inferrable fields of the given intent type
  const metadata = getIntentMetadata(intent);
  properties.forEach(property => {
    if (!metadata.inferrableFields.includes(property)) {
      throw new InvalidPropertyException(intent.intentType, property);
    }
  });

  // add a list of fields in a fieldVar
  const newFieldVars: MutableFieldVars = { ...fieldVars };
  // make field var name unique yet recognizable
  const varName = intent.intentType + '_' + unique + (intent.id ? '_' + intent.id : '');
  newFieldVars[varName] = fields;
  const inferred = intent.inferred ? intent.inferred.concat(properties) : properties;
  const generic = { ...intent, inferred } as any;
  // each property will reference the same fieldVar with a unique index
  properties.forEach((property, index) => {
    generic[property] = { varName, index };
  });
  return [generic as IntentSpec, newFieldVars];
}

export class InvalidPropertyException {
  public constructor(public readonly intentType: string, public readonly propertyName: string) {}
}
