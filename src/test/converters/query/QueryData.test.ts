/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { OutputSpec } from '../../../api/spec/OutputSpec';
import { FieldResolver } from '../../../api/spec/FieldAPI';
import { queryData } from '../../../converters/query/QueryData';
import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';

describe('queryData', () => {
  // sample data
  const data: object[] = [
    { dim1: 'a', dim2: 'c', meas1: 40, meas2: 50 },
    { dim1: 'a', dim2: 'c', meas1: 30, meas2: 50 },
    { dim1: 'a', dim2: 'd', meas1: 20, meas2: 70 },
    { dim1: 'b', dim2: 'd', meas1: 10, meas2: 70 },
  ];
  const dataSemantics: DataSemantics = {
    dim1: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    dim2: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    meas1: { type: 'Qi', stats: { dataType: 'numeric', domain: [] } },
    meas2: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
  };

  it('should only select fields in output spec', () => {
    const output: OutputSpec = { weight: 1, intentIds: [1], encoding: { vizType: 'bar', x: ['dim1', 'dim2'] } };
    const resolver = new FieldResolver({});

    const result = queryData(output, resolver, data, dataSemantics);
    expect(result.length).toBe(3); // ac, ad, bd
    // validate the first row only contains expected fields
    const row1 = result[0];
    expect(Object.keys(row1).length).toBe(2);
    expect(Object.keys(row1)[0]).toBe('dim1');
    expect(Object.keys(row1)[1]).toBe('dim2');
  });

  it('should aggregate', () => {
    const output: OutputSpec = {
      weight: 1,
      intentIds: [1],
      encoding: { vizType: 'bar', x: ['dim1', { field: 'meas1', derivation: 'average' }] },
    };
    const resolver = new FieldResolver({});

    const result = queryData(output, resolver, data, dataSemantics);
    expect(result.length).toBe(2); // a, b
    // validate the aggregated measures
    expect(Object.values(result[0])[1]).toBe(30); // average of 40,30,20
    expect(Object.values(result[1])[1]).toBe(10);
  });

  it('should not aggregate a measure, even if no derivation is specified', () => {
    // this supports histograms of a single measure since we need to work with every row
    const output: OutputSpec = { weight: 1, intentIds: [1], encoding: { vizType: 'bar', x: ['meas2'] } };
    const resolver = new FieldResolver({});

    const result = queryData(output, resolver, data, dataSemantics);
    expect(result.length).toBe(4);
  });

  it('should sort', () => {
    const output: OutputSpec = {
      weight: 1,
      intentIds: [1],
      encoding: { vizType: 'bar', x: ['dim1', 'meas1'] },
      dataShape: { sort: [{ field: 'dim1', sortBy: 'meas1', sortType: 'ascending' }] },
    };
    const resolver = new FieldResolver({});

    const result = queryData(output, resolver, data, dataSemantics);
    expect(result.length).toBe(4); // unaggregated
    // validate the row order by looking at meas1
    expect(Object.values(result[0])[1]).toBe(10);
    expect(Object.values(result[1])[1]).toBe(20);
    expect(Object.values(result[2])[1]).toBe(30);
    expect(Object.values(result[3])[1]).toBe(40);
  });
});
