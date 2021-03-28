/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { newVailInstance } from '../api/engine/VailInstance';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { gapminderDatasource } from './GapminderData';

/**
 * An example of using VAIL with the Gapminder data set showing how to respond to
 *  "Show me life expectancy by country"
 * with a follow up of
 *  "Show population instead of life expectency"
 */
function useGapminderData() {
  const vail = newVailInstance();

  // "Show me life expectancy by country"
  vail.doCommand({ command: 'setDataSemantics', dataSemantics: gapminderDatasource });
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'fields', fields: ['lifeExpectancy', 'country'] } });

  // infer missing information
  vail.doCommand({ command: 'inferIntent' });
  const intent: VailIntentSpec = vail.getIntent();
  // could show the user information about what was inferred in the resulting intent

  // suggest effective output
  vail.doCommand({ command: 'suggestOutput' });
  const output: VailOutputSpec | undefined = vail.getOutput();
  // can use the output to present the relevant data to the user

  // "Show population instead of life expectency"
  vail.doCommand({ command: 'replaceField', old: 'lifeExpectancy', new: 'population' });
  vail.doCommand({ command: 'inferIntent' });
  vail.doCommand({ command: 'suggestOutput' });
}
