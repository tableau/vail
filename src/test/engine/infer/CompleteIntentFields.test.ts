/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../../api/spec/FieldSpec';
import { IntentFields, IntentFocus } from '../../../api/spec/IntentSpec';
import { VailIntentSpec } from '../../../api/spec/VailIntentSpec';
import { completeIntentFields } from '../../../engine/infer/CompleteIntentFields';

describe('completeIntentFields', () => {
  const dataSemantics: DataSemantics = {
    a: { type: 'Qd', derivation: 'max', stats: { dataType: 'numeric', domain: [] } },
    b: { type: 'Qd', derivation: 'min', stats: { dataType: 'numeric', domain: [] } },
  };

  it('should add derivation to intents', () => {
    const intent: VailIntentSpec = {
      intents: [{ intentType: 'focus', field: 'b' }],
    };
    const actual = completeIntentFields(intent, dataSemantics);
    const focus = actual.intents ? (actual.intents[0] as IntentFocus) : null;
    expect(focus && focus.field ? (focus.field as FieldDetails).derivation : '').toBe('min');
  });

  it('should add derivation to fieldVars', () => {
    const intent: VailIntentSpec = {
      fieldVars: { a: ['a', 'c'] },
    };
    const actual = completeIntentFields(intent, dataSemantics);
    const var1 = actual.fieldVars ? actual.fieldVars['a'] : ['a'];
    expect((var1[0] as FieldDetails).derivation).toBe('max');
  });

  it('should work with an intent prop that is a list of fields', () => {
    const intent: VailIntentSpec = {
      intents: [{ intentType: 'fields', fields: ['a', 'b'] }],
    };
    const actual = completeIntentFields(intent, dataSemantics);
    const fields: IntentFields = actual.intents ? (actual.intents[0] as IntentFields) : { intentType: 'fields', fields: [] };
    expect((fields.fields[0] as FieldDetails).derivation).toBe('max');
    expect((fields.fields[1] as FieldDetails).derivation).toBe('min');
  });
});
