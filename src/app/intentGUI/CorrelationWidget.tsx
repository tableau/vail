/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldVars } from '../../api/spec/FieldVars';
import { IntentCorrelation, IntentSpec } from '../../api/spec/IntentSpec';
import { DropDownList } from './DropDownList';
import { PropertyLabel } from './PropertyLabel';

export interface CorrelationWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentCorrelation;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentCorrelation;
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

/** UI for editing correlation intent */
export class CorrelationWidget extends React.Component<CorrelationWidgetProps> {
  public render(): JSX.Element {
    const { inferredSpec, fields, fieldVars } = this.props;
    const field1 = inferredSpec.field1 ? fieldAPI(inferredSpec.field1).resolveNames(fieldVars)[0] : noneItem;
    const field2 = inferredSpec.field2 ? fieldAPI(inferredSpec.field2).resolveNames(fieldVars)[0] : noneItem;
    const fieldList = [noneItem].concat(fields);

    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Correlation:</b>
        <br />
        <br />
        <table>
          <tbody>
            <tr>
              <td>
                <PropertyLabel text="Field1" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={fieldList} selectedItem={field1} onSelect={this.pickField1} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Field2" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={fieldList} selectedItem={field2} onSelect={this.pickField2} />
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

  private pickField1 = (name: string): void => {
    const field1 = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, field1 };
    this.props.setIntent(spec);
  };

  private pickField2 = (name: string): void => {
    const field2 = name === noneItem ? undefined : name;
    const spec = { ...this.props.rawSpec, field2 };
    this.props.setIntent(spec);
  };
}
