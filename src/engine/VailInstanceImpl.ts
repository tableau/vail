/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { VailCommand } from '../api/command/Command';
import { VailEngine, getVailEngine } from '../api/engine/VailEngine';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { DataSemantics } from '../api/dataSemantics/DataSemantics';

export class VailInstanceImpl {
  private intents: VailIntentSpec = {};
  private dataSemantics: DataSemantics = {};
  private output?: VailOutputSpec;
  private commands: VailCommand[] = [];
  private engine: VailEngine = getVailEngine();

  public getIntent(): VailIntentSpec {
    return this.intents;
  }

  public getDataSemantics(): DataSemantics {
    return this.dataSemantics;
  }

  public getOutput(): VailOutputSpec | undefined {
    return this.output;
  }

  public getCommands(): VailCommand[] {
    return this.commands;
  }

  public doCommand(command: VailCommand): void {
    switch (command.command) {
      case 'clearAll':
        this.intents = {};
        this.dataSemantics = {};
        this.output = undefined;
        break;
      case 'clearIntent':
        this.intents = {};
        this.output = undefined;
        break;
      case 'inferIntent':
        this.intents = this.engine.inferIntent(this.intents, this.dataSemantics);
        break;
      case 'suggestOutput':
        this.output = this.engine.suggestOutput(this.intents, this.dataSemantics);
        break;
      case 'setDataSemantics':
        this.dataSemantics = command.dataSemantics;
        this.commands = [];
        break;
      default:
        this.intents = this.engine.editIntent(this.intents, command);
        break;
    }
    this.commands.push(command);
  }
}
