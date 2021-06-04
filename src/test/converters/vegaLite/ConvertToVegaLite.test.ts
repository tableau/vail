/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { convertToVegaLite } from '../../../converters/vegaLite/ConvertToVegaLite';
import { OutputSpec } from '../../../api/spec/OutputSpec';
import { FieldResolver } from '../../../api/spec/FieldAPI';

describe('convertToVegaLite', () => {
  const resolver = new FieldResolver({});

  it('should create a simple bar chart', () => {
    const output: OutputSpec = {
      weight: 50,
      intentIds: [],
      encoding: {
        vizType: 'bar',
        x: ['b'],
        y: ['a'],
      },
    };
    const dataSemantics: DataSemantics = {
      a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
      b: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    };
    const actual = convertToVegaLite(output, resolver, dataSemantics, []) as any;

    expect(actual['mark']).toBe('bar');
    const encoding = actual['encoding'] as any;
    const xEncoding = encoding['x'] as any;
    expect(xEncoding['field']).toBe('b');
    expect(xEncoding['type']).toBe('quantitative');
    const yEncoding = encoding['y'] as any;
    expect(yEncoding['field']).toBe('a');
    expect(yEncoding['type']).toBe('ordinal');
  });

  it('should handle sorting', () => {
    const output: OutputSpec = {
      weight: 50,
      intentIds: [],
      encoding: {
        vizType: 'bar',
        x: ['b'],
        y: ['a'],
      },
      dataShape: {
        sort: [
          { field: 'c', sortBy: 'b', sortType: 'descending' }, // ignore
          { field: 'a', sortBy: 'b', sortType: 'descending' }, // use
        ],
      },
    };
    const dataSemantics: DataSemantics = {
      a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
      b: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    };
    const actual = convertToVegaLite(output, resolver, dataSemantics, []) as any;

    expect(actual['mark']).toBe('bar');
    const encoding = actual['encoding'] as any;
    const xEncoding = encoding['x'] as any;
    expect(xEncoding['field']).toBe('b');
    expect(xEncoding['type']).toBe('quantitative');
    const yEncoding = encoding['y'] as any;
    expect(yEncoding['field']).toBe('a');
    expect(yEncoding['type']).toBe('ordinal');
    expect(yEncoding['sort']['field']).toBe('b');
    expect(yEncoding['sort']['op']).toBe('sum');
    expect(yEncoding['sort']['order']).toBe('descending');
  });

  it('should handle focus/adjective/highlight/sort', () => {
    const output: OutputSpec = {
      weight: 50,
      intentIds: [],
      encoding: {
        vizType: 'bar',
        x: ['b'],
        y: ['a'],
      },
      dataShape: {
        focus: [{ field: 'a', adjective: 'top', strategy: 'highlight' }],
        sort: [{ field: 'a', sortBy: 'b', sortType: 'descending' }],
      },
    };
    const dataSemantics: DataSemantics = {
      a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
      b: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    };
    const actual = convertToVegaLite(output, resolver, dataSemantics, []) as any;

    expect(actual['mark']).toBe('bar');
    const encoding = actual['encoding'] as any;
    const xEncoding = encoding['x'] as any;
    expect(xEncoding['field']).toBe('b');
    const yEncoding = encoding['y'] as any;
    expect(yEncoding['field']).toBe('a');
    expect(yEncoding['sort']['field']).toBe('b');
    const colorCondition = encoding['color']['condition'];
    expect(colorCondition['test']).toBe("datum['b'] >= 0");
    expect(colorCondition['value']).toBeDefined();
  });

  it('should handle focus/filter/values', () => {
    const output: OutputSpec = {
      weight: 50,
      intentIds: [],
      encoding: {
        vizType: 'bar',
        x: ['b'],
        y: ['a'],
      },
      dataShape: {
        focus: [{ field: 'b', values: ['1', '2'], strategy: 'highlight' }],
      },
    };
    const dataSemantics: DataSemantics = {
      a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
      b: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    };
    const actual = convertToVegaLite(output, resolver, dataSemantics, []) as any;

    expect(actual['mark']).toBe('bar');
    const encoding = actual['encoding'] as any;
    const xEncoding = encoding['x'] as any;
    expect(xEncoding['field']).toBe('b');
    const yEncoding = encoding['y'] as any;
    expect(yEncoding['field']).toBe('a');
    const transformFilter = actual['transform'][0]['filter'];
    expect(transformFilter['field']).toBe('b');
    expect(transformFilter['oneOf'][0]).toBe('1');
  });
});
