/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import styles from './index.module.css';
import { VailCommand } from './api/command/Command';
import { DebugWidgets } from './app/DebugWidgets';
import { IntentWidgets } from './app/intentGUI/IntentWidgets';
import { newVailInstance } from './api/engine/VailInstance';
import { VizGallery } from './app/VizGallery';

function onLoad(): void {
  ReactDOM.render(<TopLevel />, document.getElementById('root'));
}

window.onload = onLoad;

class TopLevel extends React.Component {
  state = {
    vailInstance: newVailInstance(),
    data: [],
  };

  private runCommand = (command: VailCommand): void => {
    const { vailInstance } = this.state;
    if (command.command === 'setDataSemantics') {
      // if we're changing the data source, first clear everything
      vailInstance.doCommand({ command: 'clearAll' });
    }
    vailInstance.doCommand(command);
    // fill in the intent & generate output
    vailInstance.doCommand({ command: 'inferIntent' });
    vailInstance.doCommand({ command: 'suggestOutput' });
    // poke the state to cause a refresh
    this.setState({ vailInstance });
  };

  private setData = (data: object[]): void => {
    this.setState({ data });
  };

  public render(): JSX.Element {
    const { vailInstance, data } = this.state;
    return (
      <div className={styles.mainForm}>
        <h1>VAIL (Visual Analytic Intent Language)</h1>
        <IntentWidgets runCommand={this.runCommand} setData={this.setData} intent={vailInstance.getIntent()} />
        <VizGallery width={600} height={400} vailInstance={vailInstance} data={data} />
        <DebugWidgets vailInstance={vailInstance} />
      </div>
    );
  }
}
