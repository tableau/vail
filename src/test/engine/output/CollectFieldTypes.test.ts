/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { FieldDetails } from '../../../api/spec/FieldSpec';
import { collectFieldTypes } from '../../../engine/output/CollectFieldTypes';

describe('collectFieldTypes', () => {
  it('should handle no fields', () => {
    const actual = collectFieldTypes([], {});

    expect(actual.catAll.length).toBe(0);
    expect(actual.catTime.length).toBe(0);
    expect(actual.catGeo.length).toBe(0);
    expect(actual.quantMeasure.length).toBe(0);
    expect(actual.quantDimension.length).toBe(0);
    expect(actual.quantLat.length).toBe(0);
    expect(actual.quantLong.length).toBe(0);
  });

  it('should count field types', () => {
    const info: DataSemantics = {
      a: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
      b: { type: 'CTime', stats: { dataType: 'text', domain: [] } },
      c: { type: 'Qi', stats: { dataType: 'numeric', domain: [] } },
      d: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    };
    const actual = collectFieldTypes(['a', 'b', 'c', { field: 'd', derivation: 'count' }], info);

    expect(actual.catAll.length).toBe(2); // counts Cat & CTime
    expect(actual.catTime.length).toBe(1);
    expect(actual.catGeo.length).toBe(0);
    expect(actual.quantMeasure.length).toBe(1);
    expect(actual.quantDimension.length).toBe(1);
    expect(actual.quantLat.length).toBe(0);
    expect(actual.quantLong.length).toBe(0);

    expect(actual.catAll[0]).toBe('a');
    expect(actual.catAll[1]).toBe('b');
    expect(actual.cat[0]).toBe('a');
    expect(actual.catTime[0]).toBe('b');
    expect(actual.quantDimension[0]).toBe('c');
    const dField = actual.quantMeasure[0] as FieldDetails;
    expect(dField.field).toBe('d');
    expect(dField.derivation).toBe('count');
  });
});
