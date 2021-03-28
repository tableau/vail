/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { FieldVars } from '../../api/spec/FieldVars';
import { FocusAdjective, IntentFocus, IntentSpec } from '../../api/spec/IntentSpec';
import { DropDownList } from './DropDownList';
import { Slider } from './Slider';
import { PropertyLabel } from './PropertyLabel';
import { fieldAPI } from '../../api/spec/FieldAPI';

export interface FocusWidgetProps {
  /** intent that widget is editing */
  readonly rawSpec: IntentFocus;
  /** same spec, but possibly containing inferred properties to show the user */
  readonly inferredSpec: IntentFocus;
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
// same as FocusAdjective
const adjectives = [noneItem, 'top', 'bottom', 'best', 'worst', 'high', 'low', 'most expensive', 'expensive', 'cheapest', 'cheap'];
// same as FocusStrategy
const strategies = [noneItem, 'filter', 'highlight'];

/** UI for editing focus intent */
export class FocusWidget extends React.Component<FocusWidgetProps> {
  state = {
    valueStr: '',
  };

  public render(): JSX.Element {
    const { inferredSpec, fields, fieldVars } = this.props;
    const field = inferredSpec.field ? fieldAPI(inferredSpec.field).resolveNames(fieldVars)[0] : noneItem;
    const fieldList = [noneItem].concat(fields);
    const values = this.state.valueStr;
    const sortByField = inferredSpec.sortBy ? fieldAPI(inferredSpec.sortBy).resolveNames(fieldVars)[0] : noneItem;
    const sortByList = [noneItem].concat(fields);
    const adjective = inferredSpec.adjective ? inferredSpec.adjective : noneItem;
    const quantity = inferredSpec.quantity ? inferredSpec.quantity : '';
    const strategy = inferredSpec.strategy ? inferredSpec.strategy : noneItem;

    // Hard-coding values for the teaser. Need to update this so that the values are dynamically passed
    const min = 27,
      max = 86909,
      value = 9260;

    return (
      <div>
        <button style={{ padding: '0px' }} onClick={this.pickRemove}>
          x
        </button>
        &nbsp;
        <b>Focus:</b>
        <br />
        <br />
        <table style={{ borderSpacing: '0 8px' }}>
          <tbody>
            <tr>
              <td>
                <PropertyLabel text="Field" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={fieldList} selectedItem={field} onSelect={this.pickField} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Values" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <input defaultValue={values} onChange={this.changeValues} onKeyPress={this.onValuesKey} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Sort by" prop={'sortBy'} inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={sortByList} selectedItem={sortByField} onSelect={this.pickSortBy} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Adjective" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={adjectives} selectedItem={adjective} onSelect={this.pickAdjective} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Quantity" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <input type="number" size={10} defaultValue={quantity} onChange={this.changeQuantity} />
              </td>
            </tr>
            <tr>
              <td>
                <PropertyLabel text="Strategy" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <DropDownList items={strategies} selectedItem={strategy} onSelect={this.pickStrategy} />
              </td>
            </tr>
            <tr id="rangeSlider" style={{ visibility: 'hidden' }}>
              <td>
                <PropertyLabel text="Range" inferred={inferredSpec.inferred} />
              </td>
              <td>
                <Slider min={min} max={max} value={value} />
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

  private changeValues = (event: any): void => {
    const valueStr = event.target.value;
    this.setState({ valueStr });
  };

  private onValuesKey = (event: any): void => {
    if (event.key === 'Enter') {
      const values = event.target.value.split(',').map((v: string) => v.trim());
      const spec: IntentFocus = { ...this.props.rawSpec, values };
      this.props.setIntent(spec);
    }
  };

  private pickSortBy = (name: string): void => {
    const sortBy = name === noneItem ? undefined : name;
    const spec: IntentFocus = { ...this.props.rawSpec, sortBy };
    this.props.setIntent(spec);
  };

  private pickAdjective = (name: string): void => {
    const adjective = name === noneItem ? undefined : (name as FocusAdjective);
    const spec: IntentFocus = { ...this.props.rawSpec, adjective };
    this.props.setIntent(spec);
    let rangeSlider = document.getElementById('rangeSlider');
    if (rangeSlider) {
      switch (adjective) {
        case 'low':
        case 'high':
        case 'expensive':
        case 'cheap':
          rangeSlider.style.visibility = 'visible';
          break;
        default:
          rangeSlider.style.visibility = 'hidden';
      }
    }
  };

  private changeQuantity = (event: any): void => {
    const value = Number.parseInt(event.target.value);
    const quantity = Number.isInteger(value) && value >= 1 ? value : undefined;
    const spec: IntentFocus = { ...this.props.rawSpec, quantity };
    this.props.setIntent(spec);
  };

  private pickStrategy = (name: string): void => {
    const strategy = name === noneItem ? undefined : name;
    const spec: IntentFocus = { ...this.props.rawSpec, strategy };
    this.props.setIntent(spec);
  };

  private setRange = (min: number, max: number): void => {};
}
