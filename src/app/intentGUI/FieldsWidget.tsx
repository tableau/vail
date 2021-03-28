/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { IntentFields, IntentSpec } from '../../api/spec/IntentSpec';
import { ToggleList } from './ToggleList';

export interface FieldsWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentFields;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentFields;
  /** list of possible fields to use */
  readonly fields: string[];

  /** called when this widget changes the intent */
  setIntent(spec: IntentSpec): void;
  /** called when this widget wants to remove the associated intent */
  removeIntent(id?: number, removeWidgets?: boolean): void;
}

/** UI for editing fields intent */
export class FieldsWidget extends React.Component<FieldsWidgetProps, FieldsWidgetState> {
  state: FieldsWidgetState = { selectedFields: [] };

  public render(): JSX.Element {
    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Pick fields:</b>
        <br />
        <br />
        <ToggleList name={'field-list'} items={this.props.fields} onToggle={this.toggleField} />
      </div>
    );
  }

  private pickRemove = (): void => {
    this.props.removeIntent(this.props.rawSpec.id, true);
  };

  /** called when the presence of a field is toggled thru the UI */
  private toggleField = (index: number, state: boolean): void => {
    const selectedFields = this.state.selectedFields;
    selectedFields[index] = state;
    this.setState({ selectedFields });

    const fields = this.props.fields.filter((field, i) => selectedFields[i]);
    const spec = { ...this.props.rawSpec, fields };
    this.props.setIntent(spec);
  };
}

interface FieldsWidgetState {
  /** if [i] is true, then the ith field in the fields list is selected */
  readonly selectedFields: boolean[];
}
