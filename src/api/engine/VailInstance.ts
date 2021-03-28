/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { VailIntentSpec } from '../spec/VailIntentSpec';
import { VailOutputSpec } from '../spec/VailOutputSpec';
import { DataSemantics } from '../dataSemantics/DataSemantics';
import { VailCommand } from '../command/Command';
import { VailInstanceImpl } from '../../engine/VailInstanceImpl';

/** manage the various VAIL specifications and commands */
export interface VailInstance {
  /** get current user intent specification */
  getIntent(): VailIntentSpec;
  /** get metadata for referenced data source */
  getDataSemantics(): DataSemantics;
  /** get most recent output recommendations, if any */
  getOutput(): VailOutputSpec | undefined;
  /** get entire history of commands */
  getCommands(): VailCommand[];

  /** run a command to modify specifications, resolve ambiguity, etc. */
  doCommand(command: VailCommand): void;
}

export function newVailInstance(): VailInstance {
  return new VailInstanceImpl();
}
