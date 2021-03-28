/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from './DataSemantics';
import { FieldInfo } from '../dataSemantics/FieldInfo';
import { FieldStats } from '../dataSemantics/FieldStats';

/** compute statistics for any fields with incomplete stats */
export function computeFieldStats(dataSemantics: DataSemantics, data: object[]): DataSemantics {
  const info: MutableFields = {};
  const names = Object.getOwnPropertyNames(dataSemantics);
  for (const name of names) {
    const fieldInfo = dataSemantics[name];
    const stats = computeIfNeeded(fieldInfo.stats, name, data);
    info[name] = { ...fieldInfo, stats };
  }
  return info;
}

interface MutableFields {
  [name: string]: FieldInfo;
}

function computeIfNeeded(stats: FieldStats, name: string, data: object[]): FieldStats {
  if (stats.dataType === 'text' && stats.domain.length === 0) {
    // we have a text field with no domain, so compute it
    const domain: string[] = [];
    for (const row of data) {
      const value = (row as any)[name];
      // TODO: maintain sorted domain so this isn't a linear search
      if (typeof value === 'string' && !domain.includes(value)) {
        domain.push(value);
      }
    }
    return { dataType: 'text', domain };
  }

  return stats;
}
