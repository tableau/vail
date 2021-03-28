/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldDerivation } from './FieldDerivation';

/**
 * Definition of a VAIL field.
 * It can be a field name, field + details,
 * or field variable that points to a list of fields.
 * Use fieldAPI() to reason about a FieldSpec.
 */
export type FieldSpec = string | FieldDetails | VariableFieldDetails;

/** field name + optional details */
export interface FieldDetails {
  readonly field: string;
  readonly derivation?: FieldDerivation;
  readonly binCount?: number;
}

/** reference to a FieldVar, which contains a list of possible fields */
export interface VariableFieldDetails {
  readonly varName: string;
  /** if multiple intent properties reference the same variable, each gets a unique index */
  readonly index?: number;
}
