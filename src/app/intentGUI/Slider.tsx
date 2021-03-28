/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';

/** properties for ToggleList */
export interface SliderProps {
  /** items to display in dropdown */
  readonly min: number;
  readonly max: number;
  readonly value: number;

  /** called when the selected item changes */
  // readonly setSlide: (name: string) => void;
}

/**
 * Display a list of items that can be toggled on/off
 */
export class Slider extends React.Component<SliderProps> {
  public render(): JSX.Element {
    const { min, max, value } = this.props;
    return (
      <span>
        <input type="range" value={value} min={min} max={max} onChange={this.handleChange} />
      </span>
    );
  }

  private handleChange = (event: any): void => {
    console.log(event.target.value);
  };
}
