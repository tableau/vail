/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';

/** properties for DropDownListr */
export interface DropDownListProps {
  /** items to display in dropdown */
  readonly items: string[];
  /** currently selected item */
  readonly selectedItem: string;

  /** called when the selected item changes */
  readonly onSelect: (name: string) => void;
}

/**
 * Display a list of items in a dropdown, with a current item that the user can change
 */
export class DropDownList extends React.Component<DropDownListProps> {
  public render(): JSX.Element {
    const { selectedItem, items } = this.props;
    return (
      <span>
        <select value={selectedItem} onChange={e => this.handleChange(e)}>
          {items.map(item => (
            <option value={item} key={item}>
              {item}
            </option>
          ))}
        </select>
      </span>
    );
  }

  private handleChange = (event: any): void => {
    this.props.onSelect(event.target.value);
  };
}
