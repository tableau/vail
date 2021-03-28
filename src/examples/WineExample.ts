/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { newVailInstance } from '../api/engine/VailInstance';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { wineDatasource } from './WineData';

/**
 * An example of using VAIL with the Wine data set showing how to respond to
 * "Show me the expensive varieties of wines"
 * with a follow up of
 *  "What's the correlation between points and price?"
 */
function useWineData() {
  const vail = newVailInstance();

  // "Show me the expensive varieties of wines"
  vail.doCommand({ command: 'setDataSemantics', dataSemantics: wineDatasource });
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'focus', id: 1, adjective: 'expensive', field: 'variety' } });

  // infer missing information
  vail.doCommand({ command: 'inferIntent' });
  const intent: VailIntentSpec = vail.getIntent();
  // could show the user information about what was inferred in the resulting intent

  // suggest effective output
  vail.doCommand({ command: 'suggestOutput' });
  const output: VailOutputSpec | undefined = vail.getOutput();
  // can use the output to present the relevant data to the user

  // "What's the correlation between points and price?"
  vail.doCommand({ command: 'removeIntent', id: 1 });
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'correlation', id: 2, field1: 'points', field2: 'price' } });
  vail.doCommand({ command: 'inferIntent' });
  vail.doCommand({ command: 'suggestOutput' });
}
