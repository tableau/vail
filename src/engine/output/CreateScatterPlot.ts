/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { getCountDistinct } from '../../api/dataSemantics/FieldStats';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { OutputSpec } from '../../api/spec/OutputSpec';

/** create a scatterplot */
export function createScatterPlot(
  x: FieldSpec,
  y: FieldSpec,
  details: FieldSpec[],
  weight: number,
  intentIds: number[],
  dataSemantics: DataSemantics
): OutputSpec {
  if (details.length === 0) {
    return { weight, intentIds, encoding: { vizType: 'scatterPlot', x: [x], y: [y] } };
  }

  // sort categorical fields by domain size
  const catToSize: { [name: string]: number } = {};
  details.forEach(field => {
    const name = fieldAPI(field).getName();
    const countD = getCountDistinct(dataSemantics[name].stats);
    const size = countD === 'unknown' ? Number.MAX_VALUE : countD;
    catToSize[name] = size;
  });
  const sorted = details.sort((aField: FieldSpec, bField: FieldSpec) => {
    const aName = fieldAPI(aField).getName();
    const bName = fieldAPI(bField).getName();
    return catToSize[aName] > catToSize[bName] ? 1 : -1;
  });
  // if first one is small enough, use it for color & the rest for detail
  let color: FieldSpec[] | undefined = undefined;
  let detail: FieldSpec[] | undefined = undefined;
  const firstSize = catToSize[fieldAPI(sorted[0]).getName()];
  if (firstSize <= 20) {
    color = [sorted[0]];
    if (sorted.length > 1) {
      detail = sorted.slice(1);
    }
  } else {
    detail = sorted;
  }
  return { weight, intentIds, encoding: { vizType: 'scatterPlot', x: [x], y: [y], color, detail } };
}
