/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../dataSemantics/DataSemantics';

/** commands that drive VailInstance */
export type ManagerCommands = ClearAll | ClearIntent | InferIntent | SuggestOutput | SetDataSemantics;

/** clear intent, data sources, and output */
export interface ClearAll {
  readonly command: 'clearAll';
}

/** clear the intent specifications and output */
export interface ClearIntent {
  readonly command: 'clearIntent';
}

/** leverage knowledge of the data to infer missing pieces of the intent models */
export interface InferIntent {
  readonly command: 'inferIntent';
}

/** leverage intents, data sources, & visual best practices to generate recommended output */
export interface SuggestOutput {
  readonly command: 'suggestOutput';
}

/** set information about fields in a data source */
export interface SetDataSemantics {
  readonly command: 'setDataSemantics';
  readonly dataSemantics: DataSemantics;
}
