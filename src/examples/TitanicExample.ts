/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { newVailInstance } from '../api/engine/VailInstance';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { titanicDatasource } from './TitanicData';

/**
 * An example of using VAIL with the Titanic data set showing how to respond to
 * "Show me the distribution of ages"
 * with a follow up of
 *  "Just 5, 10, 15, and 20"
 */
function useTitanicData() {
  const vail = newVailInstance();

  // "Show me the distribution of ages"
  vail.doCommand({ command: 'setDataSemantics', dataSemantics: titanicDatasource });
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'distribution', id: 1, binField: 'Age' } });

  // infer missing information
  vail.doCommand({ command: 'inferIntent' });
  const intent: VailIntentSpec = vail.getIntent();
  // could show the user information about what was inferred in the resulting intent

  // suggest effective output
  vail.doCommand({ command: 'suggestOutput' });
  const output: VailOutputSpec | undefined = vail.getOutput();
  // can use the output to present the relevant data to the user

  // "Just 5, 10, 15, and 20"
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'focus', id: 2, field: 'Age', values: ['5', '10', '15', '20'] } });
  vail.doCommand({ command: 'inferIntent' });
  vail.doCommand({ command: 'suggestOutput' });
}
