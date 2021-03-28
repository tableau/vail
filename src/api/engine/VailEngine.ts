/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { VailIntentSpec } from '../spec/VailIntentSpec';
import { VailOutputSpec } from '../spec/VailOutputSpec';
import { EditCommands } from '../command/EditCommands';
import { DataSemantics } from '../dataSemantics/DataSemantics';
import { VailEngineImpl } from '../../engine/VailEngineImpl';

/** The core routines for working with VAIL intent and output */
export interface VailEngine {
  /** generate a new intent spec based on a command for modifying an old intent spec */
  editIntent(intent: VailIntentSpec, command: EditCommands): VailIntentSpec;

  /** infer the missing pieces of user intent */
  inferIntent(intent: VailIntentSpec, dataSemantics: DataSemantics): VailIntentSpec;

  /** use the intent spec + data source metadata to suggest effective output */
  suggestOutput(intent: VailIntentSpec, dataSemantics: DataSemantics): VailOutputSpec;
}

export function getVailEngine(): VailEngine {
  return new VailEngineImpl();
}
