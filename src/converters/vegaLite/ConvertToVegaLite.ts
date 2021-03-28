/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import * as VL from 'vega-lite';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { EncodingSpec, OutputSpec } from '../../api/spec/OutputSpec';
import { convertFieldType, convertVizType } from './Translators';
import { FieldResolver } from '../../api/spec/FieldAPI';
import { addFocus } from './AddFocus';

/** convert VAIL output spec to a vega-lite spec */
export function convertToVegaLite(
  outputSpec: OutputSpec,
  fieldResolver: FieldResolver,
  dataSemantics: DataSemantics,
  data: object[]
): VL.TopLevelSpec {
  let vlspec = createBasicViz(outputSpec, fieldResolver, dataSemantics, data);
  if (outputSpec.encoding.vizType === 'histogram') {
    vlspec = addHistogram(vlspec, fieldResolver, outputSpec.encoding);
  }
  vlspec = addFocus(vlspec, outputSpec, fieldResolver, data);
  return vlspec;
}

/** create the basics of a simple, default viz */
function createBasicViz(
  outputSpec: OutputSpec,
  fieldResolver: FieldResolver,
  dataSemantics: DataSemantics,
  data: object[]
): VL.TopLevelSpec {
  const mark = convertVizType(outputSpec.encoding.vizType);
  const x = outputSpec.encoding.x ? convertFieldType(outputSpec.encoding.x[0], outputSpec, dataSemantics, fieldResolver) : {};
  const y = outputSpec.encoding.y ? convertFieldType(outputSpec.encoding.y[0], outputSpec, dataSemantics, fieldResolver) : {};
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    description: 'Created from a VAIL OutputSpec',
    data: { values: data },
    mark,
    encoding: { x, y },
  };
}

/** add encodings for a histogram */
function addHistogram(current: VL.TopLevelSpec, fieldResolver: FieldResolver, encoding: EncodingSpec): VL.TopLevelSpec {
  if (!encoding.x || !encoding.x[0]) {
    return current;
  }
  // Use the binCount from the field's details if available, else default to 10.
  const fd = fieldResolver.getField(encoding.x[0]);
  const binCount = fd && fd.binCount ? fd.binCount : 10;
  return {
    ...current,
    encoding: {
      x: {
        bin: { maxbins: binCount },
        field: fd.field,
        type: 'quantitative',
      },
      y: {
        aggregate: 'count',
        type: 'quantitative',
      },
    },
  };
}
