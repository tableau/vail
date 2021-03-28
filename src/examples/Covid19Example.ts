/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { newVailInstance } from '../api/engine/VailInstance';
import { VailIntentSpec } from '../api/spec/VailIntentSpec';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';
import { covidDatasource } from './Covid19Data';

/**
 * An example of using VAIL with the Covid19 data set showing how to respond to
 *  "Show me the trend in the covid data"
 * with a follow up of
 *  "I wanted to see totalcountconfirmed"
 */
function useCovid19Data() {
  const vail = newVailInstance();

  // "Show me the trend in the covid data"
  vail.doCommand({ command: 'setDataSemantics', dataSemantics: covidDatasource });
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'trend', id: 1 } });

  // infer missing information
  vail.doCommand({ command: 'inferIntent' });
  const intent: VailIntentSpec = vail.getIntent();
  /**
   * the intent will indicate that there were four possible fields to show:
   * newcountdeaths, newcountconfirmed, totalcountconfirmed, or totalcountdeaths
   */

  // suggest effective output
  vail.doCommand({ command: 'suggestOutput' });
  const output: VailOutputSpec | undefined = vail.getOutput();
  // can use the output to present the relevant data to the user

  // "I wanted to see totalcountconfirmed"
  vail.doCommand({ command: 'setIntent', intent: { intentType: 'trend', id: 1, measure: 'totalcountconfirmed' } });
  vail.doCommand({ command: 'inferIntent' });
  vail.doCommand({ command: 'suggestOutput' });
}
