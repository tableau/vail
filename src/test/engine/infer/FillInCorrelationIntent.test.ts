/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../../api/spec/FieldSpec';
import { fieldAPI } from '../../../api/spec/FieldAPI';
import { IntentCorrelation } from '../../../api/spec/IntentSpec';
import { fillInCorrelationIntent } from '../../../engine/infer/FillInCorrelation';

describe('fillInCorrelationIntent', () => {
  const dataSemantics: DataSemantics = {
    a: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    b: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    c: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
  };
  const allFields: FieldDetails[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }];

  it('should fill in both missing fields, while making the defaults different', () => {
    const intent: IntentCorrelation = { intentType: 'correlation' };
    const [newIntent, newVars] = fillInCorrelationIntent(intent, allFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('correlation');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(2);

    const field1 = newIntent.field1 ? newIntent.field1 : { field: 'z' };
    const names1 = fieldAPI(field1).resolveNames(newVars);
    expect(names1[0]).toBe('a');
    expect(names1[1]).toBe('c');
    // the first item in the two lists should not be the same
    const field2 = newIntent.field2 ? newIntent.field2 : { field: 'z' };
    const names2 = fieldAPI(field2).resolveNames(newVars);
    expect(names2[0]).toBe('c');
    expect(names2[1]).toBe('a');
  });
});
