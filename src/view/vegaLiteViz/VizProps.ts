/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as VL from 'vega-lite';

/**
 * Properties for VegaListViz, which displays a viz from a vega-lite specification
 */
export interface VizProps {
  readonly vizSpec: VL.TopLevelSpec;
  readonly width: number;
  readonly height: number;
}
