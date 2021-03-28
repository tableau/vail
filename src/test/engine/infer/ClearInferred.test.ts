/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldVars } from '../../../api/spec/FieldVars';
import { IntentTrend } from '../../../api/spec/IntentSpec';
import { removeVariableProperty } from '../../../engine/infer/ClearInferred';

describe('removeVariableProperty', () => {
  it('should remove an intent property & its associated fieldVar', () => {
    const intent: IntentTrend = { intentType: 'trend', measure: { varName: 'test1' }, time: { varName: 'test2' } };
    const fieldVars: FieldVars = { test1: ['something'], test2: ['value'] };
    const [newIntent, newFieldVars] = removeVariableProperty(intent, 'measure', fieldVars);

    expect(newIntent.intentType).toBe('trend');
    // measure & test1 are gone
    expect((newIntent as IntentTrend).measure).toBeUndefined();
    expect(newFieldVars['test1']).toBeUndefined();
    // time & test2 are still there
    expect((newIntent as IntentTrend).time).toBeDefined();
    expect(newFieldVars['test2']).toBeDefined();
  });
});
