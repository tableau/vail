/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldDetails, VariableFieldDetails } from '../../../api/spec/FieldSpec';
import { IntentTrend } from '../../../api/spec/IntentSpec';
import { InvalidPropertyException, putFieldsInProperties, putFieldsInProperty } from '../../../engine/infer/PutFieldsInProperty';

describe('putFieldsInProperty', () => {
  it('should do nothing when there are no fields', () => {
    const intent: IntentTrend = { intentType: 'trend' };
    const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'measure', [], {});

    expect(newIntent.intentType).toBe('trend');
    expect(Object.getOwnPropertyNames(newIntent).length).toBe(1);
    expect(Object.getOwnPropertyNames(newFieldVars).length).toBe(0);
  });

  it('should add field when there is one in the list', () => {
    const intent: IntentTrend = { intentType: 'trend' };
    const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'measure', [{ field: 'a' }], {});

    expect(newIntent.intentType).toBe('trend');
    expect(Object.getOwnPropertyNames(newIntent).length).toBe(3);
    expect(Object.getOwnPropertyNames(newFieldVars).length).toBe(0);

    const measure = (newIntent as IntentTrend).measure as FieldDetails;
    expect(measure.field).toBe('a');
    const inferred = (newIntent as IntentTrend).inferred;
    expect(inferred ? inferred[0] : '').toBe('measure');
  });

  it('should use a field variable when there is more than one in the list', () => {
    const intent: IntentTrend = { intentType: 'trend' };
    const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'measure', [{ field: 'a' }, { field: 'b' }], {});

    expect(newIntent.intentType).toBe('trend');
    expect(Object.getOwnPropertyNames(newIntent).length).toBe(3);
    expect(Object.getOwnPropertyNames(newFieldVars).length).toBe(1);

    const measure = (newIntent as IntentTrend).measure as VariableFieldDetails;
    const varName = measure.varName;
    const varEntry = newFieldVars[varName];
    expect(varEntry.length).toBe(2);
    const inferred = (newIntent as IntentTrend).inferred;
    expect(inferred ? inferred[0] : '').toBe('measure');
  });

  it('should should complain if the specified property is not part of the given intent', () => {
    try {
      const intent: IntentTrend = { intentType: 'trend' };
      putFieldsInProperty(intent, 'wrong', [], {});
      fail('should not have allowed the wrong property name to be passed');
    } catch (e) {
      expect(e instanceof InvalidPropertyException).toBe(true);
    }
  });
});

describe('putFieldsInProperties', () => {
  it('should create a unique reference from each property', () => {
    const intent: IntentTrend = { intentType: 'trend' };
    const [newIntent, newFieldVars] = putFieldsInProperties(intent, ['measure', 'time'], 'z', [{ field: 'a' }, { field: 'b' }], {});

    expect(Object.getOwnPropertyNames(newFieldVars).length).toBe(1);
    expect(newIntent.intentType).toBe('trend');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(2);
    const measure = (newIntent as IntentTrend).measure as VariableFieldDetails;
    expect(measure.index !== undefined ? measure.index : -1).toBe(0);
    const time = (newIntent as IntentTrend).time as VariableFieldDetails;
    expect(time.index !== undefined ? time.index : -1).toBe(1);
    expect(measure.varName).toBe(time.varName);
  });
});
