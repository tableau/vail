/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import { VailInstance } from '../api/engine/VailInstance';

interface DebugWidgetsProps {
  vailInstance: VailInstance;
}

/** Display widgets that show useful debug information about the various specifications */
export class DebugWidgets extends React.Component<DebugWidgetsProps> {
  public render(): JSX.Element {
    const intent = JSON.stringify(this.props.vailInstance.getIntent(), undefined, 2);
    const data = JSON.stringify(this.props.vailInstance.getDataSemantics(), undefined, 2);
    const output = JSON.stringify(this.props.vailInstance.getOutput(), undefined, 2);
    const commands = JSON.stringify(this.props.vailInstance.getCommands(), undefined, 2);

    return (
      <div>
        <br />
        <table>
          <tbody>
            <tr>
              <th>intent spec</th>
              <th>output spec</th>
            </tr>
            <tr>
              <td>
                <textarea cols={40} rows={20} spellCheck={false} readOnly={true} value={intent} />
              </td>
              <td>
                <textarea cols={40} rows={20} spellCheck={false} readOnly={true} value={output} />
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th>commands</th>
              <th>data</th>
            </tr>
            <tr>
              <td>
                <textarea cols={40} rows={20} spellCheck={false} readOnly={true} value={commands} />
              </td>
              <td>
                <textarea cols={40} rows={20} spellCheck={false} readOnly={true} value={data} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
