/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentCorrelation, IntentFields } from '../../../api/spec/IntentSpec';
import { VailIntentSpec } from '../../../api/spec/VailIntentSpec';
import { editIntent } from '../../../engine/edit/EditIntent';

describe('editInput', () => {
  it('should replace fields in a fields intent', () => {
    const original: VailIntentSpec = { intents: [{ intentType: 'fields', fields: ['a', 'b'] }] };
    const actual = editIntent(original, { command: 'replaceField', old: 'a', new: 'c' });

    expect(actual.intents?.length).toBe(1);
    const intent = (actual.intents ? actual.intents[0] : { intentType: 'correlation' }) as IntentFields;
    expect(intent.fields[0]).toBe('c');
    expect(intent.fields[1]).toBe('b');
  });

  it('should replace fields in intents', () => {
    const original: VailIntentSpec = { intents: [{ intentType: 'correlation', field1: 'a', field2: 'b' }] };
    const actual = editIntent(original, { command: 'replaceField', old: 'a', new: 'c' });

    expect(actual.intents?.length).toBe(1);
    const intent = (actual.intents ? actual.intents[0] : { intentType: 'correlation' }) as IntentCorrelation;
    expect(intent.field1).toBe('c');
    expect(intent.field2).toBe('b');
  });

  it('should add a new intent to an empty list', () => {
    const original: VailIntentSpec = {};
    const actual = editIntent(original, { command: 'setIntent', intent: { intentType: 'geographic' } });

    expect(actual.intents?.length).toBe(1);
    expect(actual.intents ? actual.intents[0].intentType : '').toBe('geographic');
  });

  it('should add a new intent to an existing list', () => {
    const original: VailIntentSpec = { intents: [{ intentType: 'trend' }] };
    const actual = editIntent(original, { command: 'setIntent', intent: { intentType: 'geographic' } });

    expect(actual.intents?.length).toBe(2);
    expect(actual.intents ? actual.intents[1].intentType : '').toBe('geographic');
  });

  it('should replace an intent with the same name', () => {
    const original: VailIntentSpec = { intents: [{ intentType: 'trend', id: 42 }] };
    const actual = editIntent(original, { command: 'setIntent', intent: { intentType: 'geographic', id: 42 } });

    expect(actual.intents?.length).toBe(1);
    expect(actual.intents ? actual.intents[0].intentType : '').toBe('geographic');
    expect(actual.intents ? actual.intents[0].id : '').toBe(42);
  });

  it('should remove a named intent', () => {
    const original: VailIntentSpec = {
      intents: [
        { intentType: 'trend', id: 42 },
        { intentType: 'trend', id: 3 },
      ],
    };
    const actual = editIntent(original, { command: 'removeIntent', id: 42 });

    expect(actual.intents?.length).toBe(1);
    expect(actual.intents ? actual.intents[0].id : '').toBe(3);
  });
});
