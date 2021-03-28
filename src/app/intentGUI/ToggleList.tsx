/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';

/** properties for ToggleList */
export interface ToggleListProps {
  /** unique name for this list */
  readonly name: string;

  /** items to display in dropdown */
  readonly items: string[];

  /** called when an item is toggled */
  readonly onToggle: (index: number, state: boolean) => void;
}

/**
 * Display a list of items that can be toggled on/off
 */
export class ToggleList extends React.Component<ToggleListProps> {
  public render(): JSX.Element {
    const { name, items } = this.props;
    return (
      <span>
        {items.map((item, i) => {
          const key = i.toString();
          return (
            <div key={name + key}>
              <input type="checkbox" name={name} value={key} id={key} onChange={this.handleChange} />
              <label htmlFor={key}>{item}</label>
            </div>
          );
        })}
      </span>
    );
  }

  private handleChange = (event: any): void => {
    const index = Number.parseInt(event.target.value);
    this.props.onToggle(index, event.target.checked);
  };
}
