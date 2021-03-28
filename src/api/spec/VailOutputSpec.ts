/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldVars } from './FieldVars';
import { OutputSpec } from './OutputSpec';

/** Descriptions of possible VAIL output specs */
export interface VailOutputSpec {
  /** all outputs sorted so the best option is listed first */
  readonly sortedSpecs: OutputSpec[];

  /** list the output generated from each stand-alone intent */
  readonly idToOutput: IdToOutput;

  /** ambiguous fields, can be referenced by other portions of the output spec */
  readonly fieldVars: FieldVars;
}

export interface IdToOutput {
  readonly [id: number]: OutputSpec[];
  readonly intentIds: number[];
}
