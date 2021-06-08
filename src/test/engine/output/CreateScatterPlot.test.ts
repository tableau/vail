/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { createScatterPlot } from '../../../engine/output/CreateScatterPlot';

describe('createScatterPlot', () => {
  const simpleSemantics: DataSemantics = {
    measure: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    measure2: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },

    catSmall: { type: 'Cat', stats: { dataType: 'text', domain: ['a', 'a', 'a'] } },
    catMedium: { type: 'Cat', stats: { dataType: 'text', domain: ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'] } },
    catLarge: {
      type: 'Cat',
      stats: {
        dataType: 'text',
        domain: ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
      },
    },
  };

  it('should put low cardinality cat on color in a scatterplot', () => {
    const output = createScatterPlot('measure', 'measure2', ['catSmall'], 50, [1], simpleSemantics);

    const encoding = output.encoding;
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
    expect(encoding.y ? encoding.y[0] : '').toBe('measure2');
    expect(encoding.color ? encoding.color[0] : '').toBe('catSmall');
  });

  it('should put high cardinality cat on detail in a scatterplot', () => {
    const output = createScatterPlot('measure', 'measure2', ['catLarge'], 50, [1], simpleSemantics);

    const encoding = output.encoding;
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
    expect(encoding.y ? encoding.y[0] : '').toBe('measure2');
    expect(encoding.detail ? encoding.detail[0] : '').toBe('catLarge');
  });

  it('should put lowest cardinality cat on color & others on detail in a scatterplot', () => {
    const output = createScatterPlot('measure', 'measure2', ['catLarge', 'catMedium', 'catSmall'], 50, [1], simpleSemantics);

    const encoding = output.encoding;
    expect(encoding.x ? encoding.x[0] : '').toBe('measure');
    expect(encoding.y ? encoding.y[0] : '').toBe('measure2');
    expect(encoding.color ? encoding.color[0] : '').toBe('catSmall');
    expect(encoding.detail ? encoding.detail[0] : '').toBe('catMedium');
    expect(encoding.detail ? encoding.detail[1] : '').toBe('catLarge');
  });
});
