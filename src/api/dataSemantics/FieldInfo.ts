/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldDerivation } from '../spec/FieldDerivation';
import { FieldStats } from './FieldStats';

/** Information about how to use a field */
export interface FieldInfo {
  readonly type: FieldType;
  readonly derivation?: FieldDerivation;
  readonly binCount?: number;
  readonly stats: FieldStats;
}

export type FieldType =
  // categorical
  | 'Cat'
  | 'CTime' // date or time
  | 'CGeo' // geographic role
  | 'CCurrency' // currency
  // quantitative
  | 'Qd' // dependent (measure)
  | 'Qi' // independent or date (dimension)
  | 'QLat' // latitude
  | 'QLon'; // longitude
