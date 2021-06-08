/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldSpec } from './FieldSpec';
import { EncodingSpec } from './OutputSpec';

/**
 * All intent specifications contain the following:
 * - intentType: identifies the particular type of intent
 * - id:         [optional] used for tracking the intent across edits and output
 * - inferred:   [optional] a list of intent properties that were filled in by intent inferencing
 */
export type IntentSpec =
  | IntentCorrelation
  | IntentDistribution
  | IntentEncoding
  | IntentFields
  | IntentFocus
  | IntentGeographic
  | IntentTrend;

/** correlation */
export interface IntentCorrelation {
  readonly intentType: 'correlation';
  readonly id?: number;
  readonly inferred?: string[];

  readonly field1?: FieldSpec;
  readonly field2?: FieldSpec;
  readonly detail?: FieldSpec[];
}

/** distribution */
export interface IntentDistribution {
  readonly intentType: 'distribution';
  readonly id?: number;
  readonly inferred?: string[];

  readonly binField?: FieldSpec;
  /** if specified, overrides value in FieldSpec */
  readonly binCount?: number;
}

/** encoding */
export interface IntentEncoding {
  readonly intentType: 'encoding';
  readonly id?: number;
  readonly inferred?: string[];

  readonly encoding: EncodingSpec;
}

/** fields */
export interface IntentFields {
  readonly intentType: 'fields';
  readonly id?: number;
  readonly inferred?: string[];

  readonly fields: FieldSpec[];
}

/** focus */
export interface IntentFocus {
  readonly intentType: 'focus';
  readonly id?: number;
  readonly inferred?: string[];

  readonly field?: FieldSpec;
  readonly values?: string[];
  readonly sortBy?: FieldSpec;
  readonly adjective?: FocusAdjective;
  readonly quantity?: number;
  readonly strategy?: FocusStrategy;
}
export type FocusAdjective = 'top' | 'bottom' | 'best' | 'worst' | 'high' | 'low' | 'cheapest' | 'most expensive' | 'cheap' | 'expensive';
export type FocusStrategy = 'filter' | 'highlight' | string;

/** geographic */
export interface IntentGeographic {
  readonly intentType: 'geographic';
  readonly id?: number;
  readonly inferred?: string[];

  readonly field?: FieldSpec;
  readonly geo?: FieldSpec;
}

/** trend */
export interface IntentTrend {
  readonly intentType: 'trend';
  readonly id?: number;
  readonly inferred?: string[];

  readonly measure?: FieldSpec;
  readonly time?: FieldSpec;
}
