/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as VL from 'vega-lite';
import { FieldResolver } from '../../api/spec/FieldAPI';
import { FocusSpec, OutputSpec } from '../../api/spec/OutputSpec';
import { sortData } from './SortData';

const highlightColor = '#ff5e13';

/** add in focus specs if present */
export function addFocus(vlspec: VL.TopLevelSpec, outputSpec: OutputSpec, fieldResolver: FieldResolver, data: object[]): VL.TopLevelSpec {
  if (outputSpec.dataShape && outputSpec.dataShape.focus) {
    const focusSpecs = outputSpec.dataShape.focus;
    const sortSpecs = outputSpec.dataShape.sort;
    for (const focusSpec of focusSpecs) {
      if (sortSpecs) {
        // While there might be multiple possibilities, we'll take the first sortBy field for now
        const descending = focusSpec.adjective === 'top' || focusSpec.adjective === 'high';
        const [sortByName, res] = sortData(sortSpecs[0], fieldResolver, data, descending);
        // add sorted data and instructions for focus
        vlspec = { ...vlspec, data: { values: res } };
        vlspec = addFocusWithSort(vlspec, focusSpec, res, sortByName);
      } else {
        vlspec = addFocusNoSort(vlspec, focusSpec, fieldResolver);
      }
    }
  }
  return vlspec;
}

/** add info from a focus spec without any sorting */
function addFocusNoSort(current: VL.TopLevelSpec, focus: FocusSpec, fieldResolver: FieldResolver): VL.TopLevelSpec {
  if (focus.values && focus.field) {
    // TODO: handle highlighting
    const field = fieldResolver.getField(focus.field).field;
    const transforms = current.transform ? current.transform : [];
    return {
      ...current,
      transform: transforms.concat({ filter: { field, oneOf: focus.values } }),
    };
  }
  return current;
}

/**
 * add info from a focus spec into the vega-lite spec
 * @param current spec to modify
 * @param focus focus spec to examine
 * @param data source data, optinally needed for computing limits
 * @param sortByName field we're sorting by
 */
function addFocusWithSort(current: VL.TopLevelSpec, focus: FocusSpec, data: object[], sortByName: string): VL.TopLevelSpec {
  if (focus.values) {
    // TODO: handle highlighting
    const transforms = current.transform ? current.transform : [];
    return {
      ...current,
      transform: transforms.concat({ filter: { field: sortByName, oneOf: focus.values } }),
    };
  } else {
    const descending = focus.adjective === 'top' || focus.adjective === 'high';
    const op = descending ? ' >= ' : ' <= ';
    const focusLimit = getFocusLimit(sortByName, data, focus.adjective, focus.quantity);
    switch (focus.strategy) {
      case 'highlight':
        const currentEncoding = (current as any)['encoding'];
        const encoding = {
          ...currentEncoding,
          color: {
            condition: {
              test: "datum['" + sortByName + "']" + op + focusLimit,
              value: highlightColor,
            },
          },
        };
        return { ...current, encoding };
      case 'filter':
        const transforms = current.transform ? current.transform : [];
        return {
          ...current,
          transform: transforms.concat({ filter: "datum['" + sortByName + "']" + op + focusLimit }),
        };
    }
  }
  return current;
}

/** Get focus limit for either highlighting or filtering */
function getFocusLimit(sortByField: string, data: any[], adj?: string, quantity?: number): number {
  if (adj === 'top' || adj === 'high') {
    data.sort((a: any, b: any) => (b[sortByField] > a[sortByField] ? 1 : -1));
  } else if (adj === 'bottom' || adj === 'low') {
    data.sort((a: any, b: any) => (a[sortByField] > b[sortByField] ? 1 : -1));
  }

  const numValues = data.reduce((a: any, o: any) => {
    a.push(o[sortByField]);
    return a;
  }, []);
  if (adj === 'high' || adj === 'low') {
    const sd = getSD(numValues);
    const avg = getMean(numValues);
    return Math.abs(avg - sd);
  }
  if (quantity) {
    return numValues[quantity - 1];
  } else return numValues[0];
}

// Arithmetic mean
function getMean(data: any[]) {
  return (
    data.reduce(function(a, b) {
      return Number(a) + Number(b);
    }) / data.length
  );
}

// Standard deviation
function getSD(data: any[]) {
  let m = getMean(data);
  return Math.sqrt(
    data.reduce(function(sq, n) {
      return sq + Math.pow(n - m, 2);
    }, 0) /
      (data.length - 1)
  );
}
