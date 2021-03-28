/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldSpec } from './FieldSpec';
import { FocusStrategy } from './IntentSpec';

/** a description of how to encode fields to produce a single visualization */
export interface OutputSpec {
  /** value in [0,100] where higher numbers indicate a better fit for the intent */
  readonly weight: number;
  /** ids of the intents used to generate this output */
  readonly intentIds: number[];

  /** how to present the data */
  readonly encoding: EncodingSpec;
  /** changes to the data, e.g. filtering */
  readonly dataShape?: DataShapeSpec;
}

/** definition of how to encode data for use with output */
export interface EncodingSpec {
  readonly vizType: VizType;
  readonly x?: FieldSpec[];
  readonly y?: FieldSpec[];
  readonly text?: FieldSpec[];
  readonly color?: FieldSpec[];
  readonly size?: FieldSpec[];
  readonly shape?: FieldSpec[];
  readonly detail?: FieldSpec[];
}

export type VizType = 'bar' | 'histogram' | 'line' | 'scatterPlot' | 'singleAnswer' | 'textTable';

/** definition of how to shape data for use with output */
export interface DataShapeSpec {
  readonly focus?: FocusSpec[];
  readonly sort?: SortSpec[];
}

/** e.g., filter or highlight a subset of the data */
export interface FocusSpec {
  readonly field: FieldSpec;
  readonly values?: string[];
  readonly adjective?: AdjectiveType;
  readonly quantity?: number;
  readonly strategy: FocusStrategy;
}

export type AdjectiveType = 'top' | 'bottom' | 'high' | 'low';

/** apply a sort */
export interface SortSpec {
  readonly field: FieldSpec;
  readonly sortBy: FieldSpec;
  readonly sortType: SortType;
}

export type SortType = 'ascending' | 'descending';
