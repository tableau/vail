/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentSpec } from './IntentSpec';

/** metadata about intent inferaces */
export interface IntentMetadata {
  /** all field-properties */
  readonly allFields: string[];
  /** list of field-properties that can be inferred depending on context */
  readonly inferrableFields: string[];
  /** list of non-field-properties that can be inferred depending on context */
  readonly inferrableProperties: string[];
  /** create a new output spec, create a new output spec from a list of fields,
   *  modify other output specs, or it depends on whether there are other 'create' intents */
  readonly outputType: 'create' | 'fields' | 'modify' | 'depends';
}

const correlationMetadata: IntentMetadata = {
  allFields: ['field1', 'field2'],
  inferrableFields: ['field1', 'field2'],
  inferrableProperties: [],
  outputType: 'create',
};

const distributionMetadata: IntentMetadata = {
  allFields: ['binField'],
  inferrableFields: ['binField'],
  inferrableProperties: [],
  outputType: 'create',
};

const encodingMetadata: IntentMetadata = {
  allFields: [],
  inferrableFields: [],
  inferrableProperties: [],
  outputType: 'depends',
};

const fieldsMetadata: IntentMetadata = {
  allFields: ['fields'],
  inferrableFields: [],
  inferrableProperties: [],
  outputType: 'fields',
};

const focusMetadata: IntentMetadata = {
  allFields: ['field', 'sortBy'],
  inferrableFields: ['field', 'sortBy'],
  inferrableProperties: ['quantity', 'strategy'],
  outputType: 'modify',
};

const geographicMetadata: IntentMetadata = {
  allFields: ['field', 'geo'],
  inferrableFields: ['field', 'geo'],
  inferrableProperties: [],
  outputType: 'create',
};

const trendMetadata: IntentMetadata = {
  allFields: ['measure', 'time'],
  inferrableFields: ['measure', 'time'],
  inferrableProperties: [],
  outputType: 'create',
};

/** get the metadata associated with a given intent */
export function getIntentMetadata(intent: IntentSpec): IntentMetadata {
  const it = intent.intentType;
  switch (it) {
    case 'correlation':
      return correlationMetadata;
    case 'distribution':
      return distributionMetadata;
    case 'encoding':
      return encodingMetadata;
    case 'fields':
      return fieldsMetadata;
    case 'focus':
      return focusMetadata;
    case 'geographic':
      return geographicMetadata;
    case 'trend':
      return trendMetadata;
  }
  // if this happens, metadata needs to be added for a new intent type
  throw new MissingMetadataException(it);
}

export class MissingMetadataException {
  public constructor(public readonly intentType: string) {}
}
