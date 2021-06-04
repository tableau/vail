/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { fieldAPI } from '../../api/spec/FieldAPI';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { OutputSpec } from '../../api/spec/OutputSpec';

/** create a new OutputSpec for the stand-alone intent types */
export function intentToOutput(intent: IntentSpec, weight: number): OutputSpec | null {
  const intentIds = intent.id ? [intent.id] : [];

  switch (intent.intentType) {
    case 'correlation':
      if (intent.field1 && intent.field2) {
        return { weight, intentIds, encoding: { vizType: 'scatterPlot', x: [intent.field1], y: [intent.field2] } };
      }
      break;
    case 'distribution':
      if (intent.binField) {
        // drop the derivation if present since we need to bin all the rows
        const binField = fieldAPI(intent.binField).asDetails();
        const x = binField === null ? intent.binField : { field: binField.field, binCount: binField.binCount };
        return { weight, intentIds, encoding: { vizType: 'histogram', x: [x] } };
      }
      break;
    case 'encoding':
      return { weight, intentIds, encoding: intent.encoding };
    case 'geographic':
      if (intent.field && intent.geo) {
        return { weight, intentIds, encoding: { vizType: 'bar', x: [intent.field], y: [intent.geo] } };
      }
      break;
    case 'trend':
      if (intent.measure && intent.time) {
        return { weight, intentIds, encoding: { vizType: 'line', x: [intent.time], y: [intent.measure] } };
      }
      break;
  }
  return null;
}
