/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentSpec } from './IntentSpec';
import { FieldVars } from './FieldVars';
import { FieldSpec } from './FieldSpec';

/** definition of the VAIL intent specification */
export interface VailIntentSpec {
  /** list of intents */
  readonly intents?: IntentSpec[];
  /** field variables, i.e., lists of possible fields */
  readonly fieldVars?: FieldVars;
  /** fields listed in intents */
  readonly intentFields?: FieldSpec[];
}
