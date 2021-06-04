/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../../api/spec/FieldSpec';
import { fieldAPI } from '../../../api/spec/FieldAPI';
import { fillInDistributionIntent } from '../../../engine/infer/FillnDistribution';
import { IntentDistribution } from '../../../api/spec/IntentSpec';

describe('fillInDistributionIntent', () => {
  const dataSemantics: DataSemantics = {
    a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    b: { type: 'Qi', stats: { dataType: 'numeric', domain: [] } },
    c: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    d: { type: 'CCurrency', stats: { dataType: 'numeric', domain: [] } },
  };

  it('should fill in a single field', () => {
    const intent: IntentDistribution = { intentType: 'distribution' };
    const someFields: FieldDetails[] = [{ field: 'a' }, { field: 'b' }];
    const [newIntent] = fillInDistributionIntent(intent, someFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('distribution');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(1);
    const binField = newIntent.binField ? fieldAPI(newIntent.binField).asDetails() : null;
    if (binField === null) {
      fail('expected to find FieldDetails in binField');
    } else {
      expect(binField.field).toBe('b');
      expect(binField.derivation).toBeUndefined();
      expect(binField.binCount).toBe(10); // default
    }
  });

  it('should not include derivation, but should include binCount', () => {
    const intent: IntentDistribution = { intentType: 'distribution' };
    const someFields: FieldDetails[] = [{ field: 'a' }, { field: 'c', derivation: 'average', binCount: 42 }];
    const [newIntent] = fillInDistributionIntent(intent, someFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('distribution');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(1);
    const binField = newIntent.binField ? fieldAPI(newIntent.binField).asDetails() : null;
    if (binField === null) {
      fail('expected to find FieldDetails in binField');
    } else {
      expect(binField.field).toBe('c');
      expect(binField.derivation).toBeUndefined();
      expect(binField.binCount).toBe(42);
    }
  });

  it('should override field binCount', () => {
    const intent: IntentDistribution = { intentType: 'distribution', binCount: 3 };
    const someFields: FieldDetails[] = [{ field: 'a' }, { field: 'd' }];
    const [newIntent] = fillInDistributionIntent(intent, someFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('distribution');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(1);
    const binField = newIntent.binField ? fieldAPI(newIntent.binField).asDetails() : null;
    if (binField === null) {
      fail('expected to find FieldDetails in binField');
    } else {
      expect(binField.field).toBe('d');
      expect(binField.binCount).toBe(3);
    }
  });

  it('should find all relevant fields', () => {
    const intent: IntentDistribution = { intentType: 'distribution' };
    const allFields: FieldDetails[] = [{ field: 'a' }, { field: 'b' }, { field: 'c' }, { field: 'd' }];
    const [newIntent, newVars] = fillInDistributionIntent(intent, allFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('distribution');
    expect(newIntent.inferred ? newIntent.inferred.length : 0).toBe(1);
    const binField = newIntent.binField ? fieldAPI(newIntent.binField).asVariable() : null;
    if (binField === null) {
      fail('expected binField to be a field variable');
    } else {
      const fields = newVars[binField.varName];
      expect(fields.length).toBe(3);
    }
  });
});
