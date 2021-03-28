/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

/** Information about a field's data values */
export type FieldStats = TextFieldStats | NumericFieldStats | BoolFieldStats | OtherFieldStats;

export interface TextFieldStats {
  readonly dataType: 'text';
  readonly domain: string[];
}

export interface NumericFieldStats {
  readonly dataType: 'numeric';
  readonly domain: number[];
}

export interface BoolFieldStats {
  readonly dataType: 'bool';
  readonly domain: boolean[];
}

export interface OtherFieldStats {
  readonly dataType: 'other';
}

/** get the number of unique values, or 'unknown' if the domain isn't known */
export function getCountDistinct(stats: FieldStats): number | 'unknown' {
  const domain = (stats as any).domain;
  if (domain === undefined) {
    return 'unknown';
  }
  const length = domain.length;
  return length === undefined || length === 0 ? 'unknown' : length;
}
