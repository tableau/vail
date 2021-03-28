/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentDistribution, IntentSpec } from '../../api/spec/IntentSpec';
import { DropDownList } from './DropDownList';
import { PropertyLabel } from './PropertyLabel';

export interface DistributionWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentDistribution;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentDistribution;
  /** list of possible fields to focus on */
  readonly fields: string[];
  /** field variables that the spec may reference */
  readonly fieldVars: FieldVars;

  /** called when this widget changes the intent */
  setIntent(spec: IntentSpec): void;
  /** called when this widget wants to remove the associated intent */
  removeIntent(id?: number, removeWidgets?: boolean): void;
}

const noneItem = '<none>';

/** UI for editing distribution intent */
export class DistributionWidget extends React.Component<DistributionWidgetProps> {
  public render(): JSX.Element {
    const { inferredSpec, fields, fieldVars } = this.props;
    const binList = [noneItem].concat(fields);
    const binField = inferredSpec.binField ? fieldAPI(inferredSpec.binField).resolveNames(fieldVars)[0] : noneItem;
    const binCount = inferredSpec.binCount ? inferredSpec.binCount : '';
    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Distribution:</b>
        <br />
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <PropertyLabel text="Binned Field" prop={'binField'} inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={binList} selectedItem={binField} onSelect={this.pickBinnedField} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Bin Size" prop={'binCount'} inferred={inferredSpec.inferred} />
              </td>
              <td>
                <input defaultValue={binCount} onChange={this.changeBinSize} onKeyPress={this.onBinSizeKey} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  private pickRemove = (): void => {
    this.props.removeIntent(this.props.rawSpec.id, true);
  };

  private pickBinnedField = (name: string): void => {
    const binField = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, binField };
    this.props.setIntent(spec);
  };

  private changeBinSize = (event: any): void => {
    const valueStr = event.target.value;
    this.setState({ valueStr });
  };

  private onBinSizeKey = (event: any): void => {
    if (event.key === 'Enter') {
      const binCount = event.target.value === '' ? undefined : Number.parseInt(event.target.value);
      const spec: IntentDistribution = { ...this.props.rawSpec, binCount };
      this.props.setIntent(spec);
    }
  };
}
