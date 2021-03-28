/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldDetails, FieldSpec, VariableFieldDetails } from './FieldSpec';
import { FieldVars } from './FieldVars';

/** get a useful API for working with a FieldSpec */
export function fieldAPI(field: FieldSpec): FieldAPI {
  return new FieldAPI(field);
}

/** an API for working with a FieldSpec */
export class FieldAPI {
  public constructor(public field: FieldSpec) {}

  /** check if two fields are the same type with the same value */
  public areEqual(other: FieldSpec): boolean {
    if (typeof this.field === 'string' && typeof other === 'string') {
      return this.field === other;
    } else if (isFieldDetails(this.field) && isFieldDetails(other)) {
      return areFieldDetailsEqual(this.field, other);
    } else if (isVariableFieldDetails(this.field) && isVariableFieldDetails(other)) {
      return areVariableFieldDetailsEqual(this.field, other);
    }
    return false;
  }

  /** can return multiple fields if it refers to a field variable */
  public resolveDetails(fieldVars: FieldVars): FieldDetails[] {
    if (isFieldDetails(this.field)) {
      return [this.field];
    } else if (isVariableFieldDetails(this.field)) {
      return lookupVariables(this.field, fieldVars);
    } else {
      return [{ field: this.field }];
    }
  }

  /** can return multiple fields if it refers to a field variable */
  public resolveNames(fieldVars: FieldVars): string[] {
    if (isVariableFieldDetails(this.field)) {
      const details = this.resolveDetails(fieldVars);
      const names = details.map(field => fieldAPI(field).getName());
      return names;
    } else {
      return [this.getName()];
    }
  }

  /** if this isn't a variable, return the field name */
  public getName(): string {
    if (isFieldDetails(this.field)) {
      return this.field.field;
    } else if (isVariableFieldDetails(this.field)) {
      return '';
    } else {
      return this.field;
    }
  }

  /** return as FieldDetails, if it's a string or FieldDetails */
  public asDetails(): FieldDetails | null {
    return isFieldDetails(this.field) ? this.field : typeof this.field === 'string' ? { field: this.field } : null;
  }

  /** return as VariableFieldDetails, if it's a variable */
  public asVariable(): VariableFieldDetails | null {
    return isVariableFieldDetails(this.field) ? this.field : null;
  }
}

/** object which knows how to resolve field variables and can track explicit overrides to them */
export class FieldResolver {
  // map from varName to index or set of indices (if variable reference has an index) in the variable array
  private override: { [name: string]: number | number[] } = {};

  public constructor(private readonly fieldVars: FieldVars) {}

  /**
   * Use the ith value from the field variable named 'varName'.
   * If references to this variable include an index, there are two options:
   *  - pass single number to say that {index:n} maps to element (i+n)
   *  - pass a list of numbers to say that {index:n} maps to element i[n]
   */
  public set(varName: string, i: number | number[]): void {
    this.override[varName] = i;
  }

  /** return the appropriate FieldDetails, using overrides or FieldVars */
  public getField(field: FieldSpec): FieldDetails {
    if (!isVariableFieldDetails(field)) {
      // if field isn't a variable, simply get the field as FieldDetails
      return fieldAPI(field).resolveDetails({})[0];
    }
    // figure out which of the fields in the variable list to use
    const override = this.override[field.varName];
    const i =
      override === undefined // no override, use first or field.index
        ? field.index === undefined
          ? 0
          : field.index
        : typeof override === 'number'
        ? override + (field.index ? field.index : 0) // use index that was specified // optionally adding field's index
        : field.index === undefined
        ? override[0] // have override array but no index
        : override[field.index]; // use field's index into override array
    const details = lookupVariables(field, this.fieldVars, true);
    return details[i % details.length];
  }
}

//
// support routines

function isFieldDetails(field: FieldSpec): field is FieldDetails {
  const details = field as FieldDetails;
  return details && details.field !== undefined;
}
function areFieldDetailsEqual(f1: FieldDetails, f2: FieldDetails): boolean {
  return f1.field === f2.field && f1.derivation === f2.derivation && f1.binCount === f2.binCount;
}

function isVariableFieldDetails(field: FieldSpec): field is VariableFieldDetails {
  const details = field as VariableFieldDetails;
  return details && details.varName !== undefined;
}
function areVariableFieldDetailsEqual(f1: VariableFieldDetails, f2: VariableFieldDetails): boolean {
  return f1.varName === f2.varName && f1.index === f2.index;
}

// need to lookup the variable, which should resolve to multiple fields
function lookupVariables(variable: VariableFieldDetails, fieldVars: FieldVars, dontCycle?: boolean): FieldDetails[] {
  const fields = fieldVars[variable.varName];
  if (!fields) {
    return [];
  }

  // now copy across each possibility
  const allFields: FieldDetails[] = [];
  for (const fieldSpec of fields) {
    // resolve the FieldSpec
    const fieldDetails = fieldAPI(fieldSpec).resolveDetails({});
    if (fieldDetails.length > 0) {
      allFields.push(fieldDetails[0]);
    }
  }

  if (!variable.index || dontCycle) {
    return allFields;
  }
  // if there's an index, cycle the array
  const first = allFields.slice(0, variable.index);
  const last = allFields.slice(variable.index);
  return last.concat(first);
}
