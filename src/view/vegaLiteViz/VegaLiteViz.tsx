/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import * as VL from 'vega-lite';
import embed from 'vega-embed';
import { VizProps } from './VizProps';

/**
 * React component that displays a viz from a vega-lite specification
 */
export class VegaLiteViz extends React.Component<VizProps> {
  public render(): JSX.Element {
    const { width, height } = this.props;
    const results = VL.compile(this.props.vizSpec);
    embed('#vegaLiteViz', results.spec, { width, height });
    return <div id="vegaLiteViz" />;
  }
}
