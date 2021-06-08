/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { collectFieldTypes } from './CollectFieldTypes';
import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { FieldSpec } from '../../api/spec/FieldSpec';
import { FieldVars } from '../../api/spec/FieldVars';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { OutputSpec } from '../../api/spec/OutputSpec';
import { IntentFields } from '../../api/spec/IntentSpec';
import { createScatterPlot } from './CreateScatterPlot';

/**
 * Generate one or more output specs from a list of fields
 * @param fields fields to use in output
 * @param dataSemantics field metadata
 * @param intentFields list of fields from the intent specs
 * @param fieldVars [optional] field variables referenced from `fields`
 */
export function fieldsToOutput(
  intent: IntentFields,
  dataSemantics: DataSemantics,
  intentFields?: FieldSpec[],
  fieldVars?: FieldVars
): OutputSpec[] {
  const outputs: OutputSpec[] = [];
  const allFields = combine(intent.fields, intentFields, fieldVars);
  const fieldTypes = collectFieldTypes(allFields, dataSemantics, fieldVars);
  const intentIds = intent.id ? [intent.id] : [];

  // create a line chart if there is one time field and at least one measure
  if (fieldTypes.catTime.length >= 1 && fieldTypes.quantMeasure.length >= 1) {
    const x = fieldTypes.catTime[0];
    const y = fieldTypes.quantMeasure[0];
    outputs.push({ weight: 80, intentIds, encoding: { vizType: 'line', x: [x], y: [y] } });
  }

  // create a bar chart if there is one categorical field and one measure
  if (fieldTypes.catAll.length >= 1 && fieldTypes.quantMeasure.length >= 1) {
    const x = fieldTypes.quantMeasure[0];
    const y = fieldTypes.catAll[0];
    outputs.push({ weight: 70, intentIds, encoding: { vizType: 'bar', x: [x], y: [y] } });
  }

  // create a scatter plot if there are at least two measures
  if (fieldTypes.quantMeasure.length >= 2) {
    const x = fieldTypes.quantMeasure[0];
    const y = fieldTypes.quantMeasure[1];
    const details = fieldTypes.catAll;
    const output = createScatterPlot(x, y, details, 60, intentIds, dataSemantics);
    outputs.push(output);
  }

  // if there's nothing but a single categorical field, show a text list
  if (allFields.length === 1 && fieldTypes.catAll.length === 1) {
    const y = fieldTypes.catAll[0];
    outputs.push({ weight: 20, intentIds, encoding: { vizType: 'textTable', y: [y] } });
  }

  // if there's nothing but a single measure, show a histogram
  if (allFields.length === 1 && fieldTypes.quantAll.length === 1) {
    const x = removeDerivation(fieldTypes.quantAll[0]);
    outputs.push({ weight: 20, intentIds, encoding: { vizType: 'histogram', x: [x] } });
  }

  return outputs;
}

/** put all the unique fields from the two lists into one list */
function combine(fields: FieldSpec[], intentFields?: FieldSpec[], fieldVars?: FieldVars): FieldSpec[] {
  if (!intentFields || !fieldVars) {
    return fields;
  }
  const allFields = [...fields];
  intentFields.forEach(field1 => {
    if (!allFields.some(field2 => fieldAPI(field1).areEqual(field2))) {
      allFields.push(field1);
    }
  });
  return allFields;
}

function removeDerivation(f: FieldSpec): FieldSpec {
  const details = fieldAPI(f).asDetails();
  if (details === null || details.derivation === undefined) {
    return f;
  }
  return details.binCount ? { field: details.field, binCount: details.binCount } : { field: details.field };
}
