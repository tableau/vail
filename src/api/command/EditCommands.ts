/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldSpec } from '../spec/FieldSpec';
import { IntentSpec } from '../spec/IntentSpec';

/** commands for editing the intent specification */
export type EditCommands = SetIntent | RemoveIntent | ReplaceField;

/** set a specific intent; if it has a name that matches an existing intent, replace it */
export interface SetIntent {
  readonly command: 'setIntent';
  readonly intent: IntentSpec;
}

/** remove the intent specification with the given id */
export interface RemoveIntent {
  readonly command: 'removeIntent';
  readonly id: number;
}

/** replace all uses of one field with another field */
export interface ReplaceField {
  readonly command: 'replaceField';
  readonly old: FieldSpec;
  readonly new: FieldSpec;
}
