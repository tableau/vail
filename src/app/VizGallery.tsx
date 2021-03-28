/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import * as VL from 'vega-lite';
import embed, { EmbedOptions } from 'vega-embed';
import { OutputSpec } from '../api/spec/OutputSpec';
import { FieldResolver } from '../api/spec/FieldAPI';
import { convertToVegaLite } from '../converters/vegaLite/ConvertToVegaLite';
import { VailInstance } from '../api/engine/VailInstance';
import { VailOutputSpec } from '../api/spec/VailOutputSpec';

export interface VizGalleryProps {
  readonly width: number;
  readonly height: number;
  readonly vailInstance: VailInstance;
  readonly data: object[];
}

/**
 * React component that displays one or more vizzes from a VailOutputSpec
 */
export class VizGallery extends React.Component<VizGalleryProps> {
  public render(): JSX.Element {
    const outputs = this.props.vailInstance.getOutput();
    if (!outputs || outputs.sortedSpecs.length === 0) {
      return <span />;
    }

    if (outputs.idToOutput.intentIds.length >= 2) {
      return this.vizPerIntent(outputs);
    } else if (Object.getOwnPropertyNames(outputs.fieldVars).length > 0) {
      return this.vizPerVarValue(outputs);
    } else if (outputs.idToOutput.intentIds.length === 1 && outputs.sortedSpecs.length >= 2) {
      return this.vizPerOutput(outputs);
    }
    return this.singleViz(outputs);
  }

  private vizPerIntent(outputs: VailOutputSpec): JSX.Element {
    const { width, height, vailInstance: vail, data } = this.props;
    const fieldResolver = new FieldResolver(outputs.fieldVars);
    const output1 = outputs.idToOutput[outputs.idToOutput.intentIds[0]];
    const output2 = outputs.idToOutput[outputs.idToOutput.intentIds[1]];
    embedVegaLite('#vegaLiteViz1', { width: width / 2, height }, output1[0], fieldResolver, vail, data);
    embedVegaLite('#vegaLiteViz2', { width: width / 2, height }, output2[0], fieldResolver, vail, data);
    return (
      <span>
        <div id="vegaLiteViz1" />
        <div id="vegaLiteViz2" />
      </span>
    );
  }

  private vizPerVarValue(outputs: VailOutputSpec): JSX.Element {
    const { width, height, vailInstance: vail, data } = this.props;
    const output = outputs.sortedSpecs[0];

    // create field resolvers set to the first two values of the first var
    const varName = Object.getOwnPropertyNames(outputs.fieldVars)[0];
    const fieldResolver1 = new FieldResolver(outputs.fieldVars);
    fieldResolver1.set(varName, 0);
    const fieldResolver2 = new FieldResolver(outputs.fieldVars);
    fieldResolver2.set(varName, 1);

    embedVegaLite('#vegaLiteViz1', { width: width / 2, height }, output, fieldResolver1, vail, data);
    embedVegaLite('#vegaLiteViz2', { width: width / 2, height }, output, fieldResolver2, vail, data);
    return (
      <span>
        <div id="vegaLiteViz1" />
        <div id="vegaLiteViz2" />
      </span>
    );
  }

  private vizPerOutput(outputs: VailOutputSpec): JSX.Element {
    const { width, height, vailInstance: vail, data } = this.props;
    const fieldResolver = new FieldResolver(outputs.fieldVars);
    const output1 = outputs.sortedSpecs[0];
    const output2 = outputs.sortedSpecs[1];
    embedVegaLite('#vegaLiteViz1', { width: width / 2, height }, output1, fieldResolver, vail, data);
    embedVegaLite('#vegaLiteViz2', { width: width / 2, height }, output2, fieldResolver, vail, data);
    return (
      <span>
        <div id="vegaLiteViz1" />
        <div id="vegaLiteViz2" />
      </span>
    );
  }

  private singleViz(outputs: VailOutputSpec): JSX.Element {
    const { width, height, vailInstance: vail, data } = this.props;
    const output = outputs.sortedSpecs[0];
    const fieldResolver = new FieldResolver(outputs.fieldVars);
    embedVegaLite('#vegaLiteViz', { width, height }, output, fieldResolver, vail, data);
    return <div id="vegaLiteViz" />;
  }
}

/** take an OutputSpec and embed it as a vega-lite viz in a div with the given id */
function embedVegaLite(
  divId: string,
  opts: EmbedOptions,
  output: OutputSpec,
  fieldResolver: FieldResolver,
  vail: VailInstance,
  data: object[]
) {
  const dataSemantics = vail.getDataSemantics();
  const vlSpec = convertToVegaLite(output, fieldResolver, dataSemantics, data);
  const results = VL.compile(vlSpec);
  embed(divId, results.spec, opts);
}
