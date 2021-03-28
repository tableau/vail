/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentTrend, IntentSpec } from '../../api/spec/IntentSpec';
import { DropDownList } from './DropDownList';
import { PropertyLabel } from './PropertyLabel';

export interface TrendWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentTrend;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentTrend;
  /** field variables that the spec may reference */
  readonly fieldVars: FieldVars;
  /** active data source */
  readonly fieldInfo: DataSemantics;

  /** called when this widget changes the intent */
  setIntent(spec: IntentSpec): void;
  /** called when this widget wants to remove the associated intent */
  removeIntent(id?: number, removeWidgets?: boolean): void;
}

const noneItem = '<none>';

/** UI for editing trend intent */
export class TrendWidget extends React.Component<TrendWidgetProps, TrendWidgetState> {
  public constructor(props: TrendWidgetProps) {
    super(props);
    const allNames = Object.getOwnPropertyNames(props.fieldInfo);
    const measureList = [noneItem].concat(allNames.filter(name => props.fieldInfo[name].type === 'Qd'));
    const timeList = [noneItem].concat(allNames.filter(name => props.fieldInfo[name].type === 'CTime'));
    this.state = { measureList, timeList };
  }

  public render(): JSX.Element {
    const { inferredSpec, fieldVars } = this.props;
    const { measureList, timeList } = this.state;
    const measure = inferredSpec.measure ? inferredSpec.measure : noneItem;
    const time = inferredSpec.time ? inferredSpec.time : noneItem;
    const measureName = fieldAPI(measure).resolveNames(fieldVars)[0];
    const timeName = fieldAPI(time).resolveNames(fieldVars)[0];

    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Trend:</b>
        <br />
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <PropertyLabel text="Measure" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={measureList} selectedItem={measureName} onSelect={this.pickMeasure} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Time" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={timeList} selectedItem={timeName} onSelect={this.pickTime} />
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

  private pickMeasure = (name: string): void => {
    const measure = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, measure };
    this.props.setIntent(spec);
  };

  private pickTime = (name: string): void => {
    const time = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, time };
    this.props.setIntent(spec);
  };
}

interface TrendWidgetState {
  measureList: string[];
  timeList: string[];
}
