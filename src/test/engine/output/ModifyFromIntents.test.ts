/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentEncoding } from '../../../api/spec/IntentSpec';
import { OutputSpec } from '../../../api/spec/OutputSpec';
import { modifyFromIntents } from '../../../engine/output/ModifyFromIntents';

describe('modifyFromIntents', () => {
  it('should add/replace ecoding properties', () => {
    const intent: IntentEncoding = { intentType: 'encoding', id: 7, encoding: { vizType: 'bar', y: ['b'], text: ['c'] } };
    const original: OutputSpec = { weight: 50, intentIds: [], encoding: { vizType: 'bar', x: ['a'] } };
    const actual = modifyFromIntents([intent], [original])[0];

    expect(actual.intentIds[0]).toBe(7);
    expect(actual.encoding.x ? actual.encoding.x[0] : '').toBe('a');
    expect(actual.encoding.y ? actual.encoding.y[0] : '').toBe('b');
    expect(actual.encoding.text ? actual.encoding.text[0] : '').toBe('c');
  });
});
