/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { computeFieldStats } from '../../../api/dataSemantics/ComputeFieldStats';
import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { TextFieldStats } from '../../../api/dataSemantics/FieldStats';

describe('computeFieldStats', () => {
  it('should compute a missing domain', () => {
    const info: DataSemantics = {
      a: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
      b: { type: 'Cat', stats: { dataType: 'text', domain: [] } },
    };
    const data: object[] = [
      { a: 1, b: 'one' },
      { a: 2, b: 'two' },
      { a: 3, b: 'one' },
    ];
    const results = computeFieldStats(info, data);
    const stats = results['b'].stats as TextFieldStats;
    expect(stats.domain.length).toBe(2);
  });
});
