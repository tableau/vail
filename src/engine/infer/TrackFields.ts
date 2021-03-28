/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldSpec } from '../../api/spec/FieldSpec';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';

/** track unique FieldSpec values */
export class TrackFields {
  private fields: FieldSpec[] = [];

  public add(field: FieldSpec): void {
    if (!this.fields.some(f => fieldAPI(f).areEqual(field))) {
      this.fields.push(field);
    }
  }

  public addTracked(tracked: TrackFields): void {
    tracked.fields.forEach(field => this.add(field));
  }

  public get(): FieldSpec[] {
    return this.fields;
  }
}

/** collect fields from various intent spec properties, if set */
export function trackIntentFields(intent: IntentSpec): TrackFields {
  const properties = getIntentMetadata(intent).allFields;
  const tracker = new TrackFields();
  for (let prop of properties) {
    const value = (intent as any)[prop];
    if (Array.isArray(value)) {
      value.forEach(v => tracker.add(v));
    } else if (value !== undefined) {
      tracker.add(value as FieldSpec);
    }
  }
  return tracker;
}
