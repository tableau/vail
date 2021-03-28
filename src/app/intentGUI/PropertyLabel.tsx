/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as React from 'react';
import styles from './Intent.module.css';

export interface PropertyLabelProps {
  /** text to display */
  readonly text: string;
  /** name of associated property if not the same as text.toLowerCase */
  readonly prop?: string;
  /** list of inferred properties - if 'text' is in the list, highlight it */
  readonly inferred?: string[];
}

/**
 * Show the label for an intent property; highlight it if it's inferred
 */
export const PropertyLabel = (props: PropertyLabelProps): JSX.Element => {
  const text = props.text + ':';
  const propName = props.prop ? props.prop : props.text.toLowerCase();
  const isInferred = props.inferred && props.inferred.includes(propName);

  return <span className={isInferred ? styles.inferred : styles.explicit}>{text}</span>;
};
