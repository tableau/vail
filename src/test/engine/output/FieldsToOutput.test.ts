/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { IntentFields } from '../../../api/spec/IntentSpec';
import { fieldsToOutput } from '../../../engine/output/FieldsToOutput';

describe('fieldsToOutput', () => {
  const simpleSemantics: DataSemantics = {
    cat: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    measure: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    measure2: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    time: { type: 'CTime', stats: { dataType: 'text', domain: [] } },
  };

  it('should create a bar from a cat & measure', () => {
    const intent: IntentFields = { intentType: 'fields', fields: ['cat', 'measure'] };
    const output = fieldsToOutput(intent, simpleSemantics);

    expect(output.length).toBe(1);
    const encoding = output[0].encoding;
    expect(encoding.vizType).toBe('bar');
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
    expect(encoding.y ? encoding.y[0] : '').toBe('cat');
  });

  it('should prefer a line chart for cat & time, but also suggest a bar', () => {
    const intent: IntentFields = { intentType: 'fields', fields: ['time', 'measure'] };
    const output = fieldsToOutput(intent, simpleSemantics);

    expect(output.length).toBe(2);
    const weight1 = output[0].weight;
    const weight2 = output[1].weight;
    expect(weight1 > weight2).toBeTruthy();

    const encoding1 = output[0].encoding;
    expect(encoding1.vizType).toBe('line');
    expect(encoding1.x ? encoding1.x[0] : '').toBe('time');
    expect(encoding1.y ? encoding1.y[0] : '').toBe('measure');
    const encoding2 = output[1].encoding;
    expect(encoding2.vizType).toBe('bar');
    expect(encoding2.x ? encoding2.x[0] : '').toBe('measure');
    expect(encoding2.y ? encoding2.y[0] : '').toBe('time');
  });

  it('should create a scatterplot from two measures', () => {
    const intent: IntentFields = { intentType: 'fields', fields: ['measure', 'measure2'] };
    const output = fieldsToOutput(intent, simpleSemantics);

    const scatter = output.filter(o => o.encoding.vizType === 'scatterPlot');
    expect(scatter.length).toBe(1);
    const encoding = scatter[0].encoding;
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
    expect(encoding.y ? encoding.y[0] : '').toBe('measure2');
  });
});
