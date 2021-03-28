/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldSpec } from './FieldSpec';

/**
 * Definition of a VAIL field variable.
 * Map a name to a list of possible fields represented by that name
 */
export interface FieldVars {
  readonly [name: string]: FieldSpec[];
}

export interface MutableFieldVars {
  [name: string]: FieldSpec[];
}
