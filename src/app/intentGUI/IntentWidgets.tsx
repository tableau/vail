/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { DropDownList } from './DropDownList';
import { dataSources } from './DataSources';
import { VailCommand } from '../../api/command/Command';
import { FocusWidget } from './FocusWidget';
import { CorrelationWidget } from './CorrelationWidget';
import { DistributionWidget } from './DistributionWidget';
import { TrendWidget } from './TrendWidget';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { VailIntentSpec } from '../../api/spec/VailIntentSpec';
import { computeFieldStats } from '../../api/dataSemantics/ComputeFieldStats';
import { FieldsWidget } from './FieldsWidget';
import { GeoWidget } from './GeoWidget';

export interface IntentWidgetsProps {
  /** current intent, which may contain properties that were inferred */
  intent: VailIntentSpec;

  /** IntentWidgets call this to execute a command based on user input */
  runCommand(command: VailCommand): void;
  /** IntentWidgets calls this to set the data table */
  setData(data: object[]): void;
}

const noneItem = '<none>';

/** Simple UI for editing intent specifications */
export class IntentWidgets extends React.Component<IntentWidgetsProps> {
  state: IntentWidgetsState = {
    selectedData: noneItem,
    dataSourceNames: [noneItem].concat(Object.getOwnPropertyNames(dataSources)),
    rawIntents: [],
    nextId: 1,
  };

  public render(): JSX.Element {
    const { selectedData, dataSourceNames } = this.state;
    const inferredIntents = this.props.intent.intents ? this.props.intent.intents : [];
    return (
      <table cellPadding="10">
        <tbody>
          <tr>
            <td valign="top">
              <b>Pick data:</b>
              <br />
              <br />
              <DropDownList items={dataSourceNames} selectedItem={selectedData} onSelect={this.setDataSemantics} />
            </td>
            {inferredIntents.map(inferredIntent => this.renderIntent(inferredIntent))}
            <td valign="top">
              <b>Add intent:</b>
              <br />
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addFieldsIntent}>
                Fields
              </button>
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addFocusIntent}>
                Focus
              </button>
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addCorrelationIntent}>
                Correlation
              </button>
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addDistributionIntent}>
                Distribution
              </button>
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addGeoIntent}>
                Geographic
              </button>
              <br />
              <button style={{ marginBottom: 5 }} onClick={this.addTrendIntent}>
                Trend
              </button>
              <br />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  private renderIntent(inferredSpec: IntentSpec): JSX.Element | undefined {
    if (!inferredSpec || !inferredSpec.id || this.state.selectedData === noneItem) {
      return undefined;
    }
    const key = inferredSpec.id;
    const rawSpec = this.state.rawIntents[key];
    const fieldInfo = dataSources[this.state.selectedData].info;
    const fields = Object.getOwnPropertyNames(fieldInfo);
    const fieldVars = this.props.intent.fieldVars ? this.props.intent.fieldVars : {};
    switch (inferredSpec.intentType) {
      case 'correlation':
        if (rawSpec.intentType === 'correlation') {
          return (
            <td valign="top" key={key}>
              <CorrelationWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fields={fields}
                fieldVars={fieldVars}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
      case 'distribution':
        if (rawSpec.intentType === 'distribution') {
          return (
            <td valign="top" key={key}>
              <DistributionWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fields={fields}
                fieldVars={fieldVars}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
      case 'fields':
        if (rawSpec.intentType === 'fields') {
          return (
            <td valign="top" key={key}>
              <FieldsWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fields={fields}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
      case 'focus':
        if (rawSpec.intentType === 'focus') {
          return (
            <td valign="top" key={key}>
              <FocusWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fields={fields}
                fieldVars={fieldVars}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
      case 'geographic':
        if (rawSpec.intentType === 'geographic') {
          return (
            <td valign="top" key={key}>
              <GeoWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fieldVars={fieldVars}
                fieldInfo={fieldInfo}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
      case 'trend':
        if (rawSpec.intentType === 'trend') {
          return (
            <td valign="top" key={key}>
              <TrendWidget
                inferredSpec={inferredSpec}
                rawSpec={rawSpec}
                fieldVars={fieldVars}
                fieldInfo={fieldInfo}
                setIntent={this.setIntent}
                removeIntent={this.removeIntent}
              />
            </td>
          );
        }
        break;
    }
    return undefined;
  }

  /** called when the data source is set thru the UI */
  private setDataSemantics = (name: string): void => {
    this.setState({ selectedData: name, selectedFields: [], intents: [], nextId: 1 });
    if (name === noneItem) {
      return;
    }

    const data = dataSources[name].data;
    const dataSemantics = computeFieldStats(dataSources[name].info, data);
    this.props.runCommand({ command: 'setDataSemantics', dataSemantics });
    this.props.setData(data);
  };

  /** called when a new correlation intent is added thru the UI */
  private addCorrelationIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'correlation' });
  };

  /** called when a new fields intent is added thru the UI */
  private addFieldsIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'fields', fields: [] });
  };

  /** called when a new focus intent is added thru the UI */
  private addFocusIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'focus' });
  };

  /** called when a new distribution intent is added thru the UI */
  private addDistributionIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'distribution' });
  };

  /** called when a new trend intent is added thru the UI */
  private addTrendIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'trend' });
  };

  /** called when a new geographic intent is added thru the UI */
  private addGeoIntent = (event: any): void => {
    this.addRawIntent({ intentType: 'geographic' });
  };

  private addRawIntent = (intent: IntentSpec): void => {
    const newIntent: IntentSpec = { ...intent, id: this.state.nextId };
    const rawIntents = [...this.state.rawIntents];
    rawIntents[this.state.nextId] = newIntent;
    this.setState({ ...this.state, rawIntents, nextId: this.state.nextId + 1 });
    this.props.runCommand({ command: 'setIntent', intent: newIntent });
  };

  /** called when an intent widget changes its intent */
  private setIntent = (spec: IntentSpec): void => {
    const newSpec = { ...spec, inferred: undefined };
    this.props.runCommand({ command: 'setIntent', intent: newSpec });
    const rawIntents = [...this.state.rawIntents];
    const id = spec.id ? spec.id : 0;
    rawIntents[id] = spec;
    this.setState({ ...this.state, rawIntents });
  };

  /** called to remove a named intent spec */
  private removeIntent = (id?: number, removeWidgets?: boolean): void => {
    if (id) {
      this.props.runCommand({ command: 'removeIntent', id });
      if (removeWidgets) {
        const rawIntents = [...this.state.rawIntents];
        rawIntents[id] = (undefined as unknown) as IntentSpec;
        this.setState({ ...this.state, rawIntents });
      }
    }
  };
}

interface IntentWidgetsState {
  /** name of the selected data source */
  readonly selectedData: string;
  /** all the data source names */
  readonly dataSourceNames: string[];

  /** list of raw intent specs being edited without inferred properties */
  readonly rawIntents: IntentSpec[];
  /** id of next intent */
  readonly nextId: number;
}
