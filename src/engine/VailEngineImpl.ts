/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { editIntent } from './edit/EditIntent';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { EditCommands } from '../api/command/EditCommands';
import { suggestOutput } from './output/SuggestOutput';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { inferIntent } from './infer/InferIntent';
import { DataSemantics } from '../api/dataSemantics/DataSemantics';

export class VailEngineImpl {
  public editIntent(intent: VailIntentSpec, command: EditCommands): VailIntentSpec {
    return editIntent(intent, command);
  }
  public inferIntent(intent: VailIntentSpec, dataSemantics: DataSemantics): VailIntentSpec {
    return inferIntent(intent, dataSemantics);
  }
  public suggestOutput(intent: VailIntentSpec, dataSemantics: DataSemantics): VailOutputSpec {
    return suggestOutput(intent, dataSemantics);
  }
}
