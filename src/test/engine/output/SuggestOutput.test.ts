/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { suggestOutput } from '../../../engine/output/SuggestOutput';
import { VailIntentSpec } from '../../../api/spec/VailIntentSpec';
import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';

describe('suggestOutput', () => {
  const simpleSemantics: DataSemantics = {
    cat: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    measure: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    time: { type: 'CTime', stats: { dataType: 'text', domain: [] } },
  };

  it('should pass through a simple encoding intent', () => {
    const intent: VailIntentSpec = {
      intentFields: ['a', 'b'],
      intents: [
        {
          intentType: 'encoding',
          id: 7,
          encoding: { vizType: 'bar', x: ['a'], y: ['b'] },
        },
      ],
    };
    const output = suggestOutput(intent, {});

    expect(output.sortedSpecs.length).toBe(1);
    expect(output.sortedSpecs[0].intentIds[0]).toBe(7);
    const encoding = output.sortedSpecs[0].encoding;
    expect(encoding.vizType).toBe('bar');
    expect(encoding.x ? encoding.x[0] : '').toBe('a');
  });

  it('should handle a fields intent that needs data semantics', () => {
    const intent: VailIntentSpec = { intents: [{ intentType: 'fields', fields: ['measure'] }] };
    const output = suggestOutput(intent, simpleSemantics);

    expect(output.sortedSpecs.length).toBe(1);
    const encoding = output.sortedSpecs[0].encoding;
    expect(encoding.vizType).toBe('histogram');
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
  });

  it('should create an output for each stand-alone intent', () => {
    const intent: VailIntentSpec = {
      intents: [
        { intentType: 'trend', id: 1, measure: 'a', time: 'b' },
        { intentType: 'distribution', id: 2, binField: 'a' },
      ],
    };
    const output = suggestOutput(intent, {});

    // validate sortedSpecs
    expect(output.sortedSpecs.length).toBe(2);
    // distribution output comes first because it was most recent intent
    expect(output.sortedSpecs[0].intentIds[0]).toBe(2);
    const encoding0 = output.sortedSpecs[0].encoding;
    expect(encoding0.vizType).toBe('histogram');
    // from trend
    expect(output.sortedSpecs[1].intentIds[0]).toBe(1);
    const encoding1 = output.sortedSpecs[1].encoding;
    expect(encoding1.vizType).toBe('line');

    // validate idToOutput
    expect(output.idToOutput[1][0].intentIds[0]).toBe(1);
    expect(output.idToOutput[2][0].intentIds[0]).toBe(2);
  });

  it('should apply a modifier intent to every stand-alone intent', () => {
    const intent: VailIntentSpec = {
      intents: [
        { intentType: 'trend', id: 1, measure: 'a', time: 'b' },
        { intentType: 'distribution', id: 2, binField: 'a' },
        { intentType: 'focus', id: 3, field: 'a', values: ['1', '2'] },
      ],
    };
    const output = suggestOutput(intent, {});

    expect(output.sortedSpecs.length).toBe(2);
    expect(output.sortedSpecs[0].intentIds[0]).toBe(2);
    expect(output.sortedSpecs[0].intentIds[1]).toBe(3);
    expect(output.sortedSpecs[1].intentIds[0]).toBe(1);
    expect(output.sortedSpecs[1].intentIds[1]).toBe(3);
    const dataShape0 = output.sortedSpecs[0].dataShape;
    expect(dataShape0 && dataShape0.focus ? dataShape0.focus.length : 0).toBe(1);
    const dataShape1 = output.sortedSpecs[0].dataShape;
    expect(dataShape1 && dataShape1.focus ? dataShape1.focus.length : 0).toBe(1);
  });

  it('should create a viz even if it only has a modifier intent', () => {
    const intent: VailIntentSpec = {
      intentFields: ['cat'],
      intents: [{ intentType: 'focus', id: 3, field: 'cat', values: ['1', '2'] }],
    };
    const output = suggestOutput(intent, simpleSemantics);

    expect(output.sortedSpecs.length).toBe(1);
  });
});
