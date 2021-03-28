/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentSpec, IntentGeographic } from '../../api/spec/IntentSpec';
import { DropDownList } from './DropDownList';
import { PropertyLabel } from './PropertyLabel';

export interface GeoWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentGeographic;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentGeographic;
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

/** UI for editing geographic intent */
export class GeoWidget extends React.Component<GeoWidgetProps, GeoWidgetState> {
  public constructor(props: GeoWidgetProps) {
    super(props);
    const allNames = Object.getOwnPropertyNames(props.fieldInfo);
    const fieldsList = [noneItem].concat(allNames.filter(name => props.fieldInfo[name].type !== 'CGeo'));
    const geoList = [noneItem].concat(allNames.filter(name => props.fieldInfo[name].type === 'CGeo'));
    this.state = { fieldsList, geoList };
  }

  public render(): JSX.Element {
    const { inferredSpec, fieldVars } = this.props;
    const { fieldsList, geoList } = this.state;
    const field = inferredSpec.field ? inferredSpec.field : noneItem;
    const geo = inferredSpec.geo ? inferredSpec.geo : noneItem;
    const fieldName = field === noneItem ? noneItem : fieldAPI(field).resolveNames(fieldVars)[0];
    const geoName = fieldAPI(geo).resolveNames(fieldVars)[0];

    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Geographic:</b>
        <br />
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <PropertyLabel text="Field" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={fieldsList} selectedItem={fieldName} onSelect={this.pickField} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Geographic" prop="geo" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={geoList} selectedItem={geoName} onSelect={this.pickGeo} />
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

  private pickField = (name: string): void => {
    const field = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, field };
    this.props.setIntent(spec);
  };

  private pickGeo = (name: string): void => {
    const geo = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, geo };
    this.props.setIntent(spec);
  };
}

interface GeoWidgetState {
  fieldsList: string[];
  geoList: string[];
}
