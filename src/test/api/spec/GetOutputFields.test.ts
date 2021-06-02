/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { OutputSpec } from '../../../api/spec/OutputSpec';
import { fieldAPI, FieldResolver } from '../../../api/spec/FieldAPI';
import { getOutputFields } from '../../../api/spec/GetOutputFields';

describe('getOutputFields', () => {
  it('should find x/y encodings', () => {
    const output: OutputSpec = { weight: 100, intentIds: [1], encoding: { vizType: 'scatterPlot', x: ['a'], y: ['b'] } };
    const resolver = new FieldResolver({});

    const fields = getOutputFields(output, resolver);
    expect(fields.length).toBe(2);
    expect(fieldAPI(fields[0]).getName()).toBe('a');
    expect(fieldAPI(fields[1]).getName()).toBe('b');
  });

  it('should not repeat duplicates', () => {
    const output: OutputSpec = { weight: 100, intentIds: [1], encoding: { vizType: 'scatterPlot', x: ['a'], y: ['a'] } };
    const resolver = new FieldResolver({});

    const fields = getOutputFields(output, resolver);
    expect(fields.length).toBe(1);
    expect(fieldAPI(fields[0]).getName()).toBe('a');
  });

  it('should get focus & sort fields', () => {
    const output: OutputSpec = {
      weight: 100,
      intentIds: [1],
      encoding: { vizType: 'scatterPlot' },
      dataShape: {
        focus: [{ field: 'a', strategy: 'filter' }],
        sort: [{ field: 'b', sortBy: 'c', sortType: 'ascending' }],
      },
    };
    const resolver = new FieldResolver({});

    const fields = getOutputFields(output, resolver);
    expect(fields.length).toBe(3);
    expect(fieldAPI(fields[0]).getName()).toBe('a');
    expect(fieldAPI(fields[1]).getName()).toBe('b');
    expect(fieldAPI(fields[2]).getName()).toBe('c');
  });

  it('should work with variables & a FieldResolver', () => {
    const output: OutputSpec = { weight: 100, intentIds: [1], encoding: { vizType: 'scatterPlot', y: [{ varName: 'var1' }] } };
    const resolver = new FieldResolver({ var1: ['a', 'b'] });
    resolver.set('var1', 1);

    const fields = getOutputFields(output, resolver);
    expect(fields.length).toBe(1);
    expect(fieldAPI(fields[0]).getName()).toBe('b');
  });
});
