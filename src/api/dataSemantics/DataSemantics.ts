/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldInfo } from './FieldInfo';

/** Information about the semantics of fields in a data source */
export interface DataSemantics {
  readonly [name: string]: FieldInfo;
}
