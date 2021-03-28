/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { VailIntentSpec } from '../../api/spec/VailIntentSpec';
import { IdToOutput, VailOutputSpec } from '../../api/spec/VailOutputSpec';
import { intentToOutput } from './IntentToOutput';
import { fieldsToOutput } from './FieldsToOutput';
import { OutputSpec } from '../../api/spec/OutputSpec';
import { modifyFromIntents } from './ModifyFromIntents';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';
import { FieldVars } from '../../api/spec/FieldVars';

/** use the intent spec + data source metadata to suggest effective output */
export function suggestOutput(allIntents: VailIntentSpec, dataSemantics: DataSemantics): VailOutputSpec {
  const { create, fields, modify } = classifyIntents(allIntents);
  const [created1, idToOutput1] = createFromFields(allIntents, fields, dataSemantics);
  const [created2, idToOutput2] = createFromIntents(create, dataSemantics);

  const allOutput = created1.concat(created2);
  const modifiedSpecs = modifyFromIntents(modify, allOutput);

  const sortedSpecs = modifiedSpecs.sort((a, b) => {
    return a.weight > b.weight ? -1 : 1;
  });
  const idToOutput = merge(idToOutput1, idToOutput2);
  const fieldVars: FieldVars = allIntents.fieldVars ? allIntents.fieldVars : {};
  return { sortedSpecs, idToOutput, fieldVars };
}

function merge(a: IdToOutput, b: IdToOutput): IdToOutput {
  const intentIds = a.intentIds.concat(b.intentIds);
  return { ...a, ...b, intentIds };
}

/** create from IntentFields and the associated data semantics */
function createFromFields(allIntents: VailIntentSpec, fields: IntentSpec[], dataSemantics: DataSemantics): [OutputSpec[], IdToOutput] {
  const outputSpecs: OutputSpec[] = [];
  const idToOutput: { [id: number]: OutputSpec[] } = {};
  const ids: number[] = [];

  fields.forEach(intent => {
    if (intent.intentType === 'fields') {
      const results = fieldsToOutput(intent, dataSemantics, allIntents.intentFields, allIntents.fieldVars);
      results.forEach(output => outputSpecs.push(output));
      if (intent.id) {
        idToOutput[intent.id] = results;
        ids.push(intent.id);
      }
    }
  });
  return [outputSpecs, { ...idToOutput, intentIds: ids }];
}

/** create an output spec for each intent */
function createFromIntents(create: IntentSpec[], dataSemantics: DataSemantics): [OutputSpec[], IdToOutput] {
  const outputSpecs: OutputSpec[] = [];
  const idToOutput: { [id: number]: OutputSpec[] } = {};
  const ids: number[] = [];

  create.forEach((intent, i) => {
    // rank output that comes from explicit intent higher than other output
    // & prefer the last specified intent over everything else
    const weight = i === create.length - 1 ? 91 : 90;
    const newOutput = intentToOutput(intent, weight);
    if (newOutput) {
      outputSpecs.push(newOutput);
      if (intent.id) {
        idToOutput[intent.id] = [newOutput];
        ids.push(intent.id);
      }
    }
  });
  return [outputSpecs, { ...idToOutput, intentIds: ids }];
}

/** figure out which intents are used for creating a new OutputSpec versus modifying existing ones */
function classifyIntents(intent: VailIntentSpec): { create: IntentSpec[]; fields: IntentSpec[]; modify: IntentSpec[] } {
  const intents = intent.intents;
  if (!intents) {
    return { create: [], fields: [], modify: [] };
  }
  let create: IntentSpec[] = intents.filter(i => getIntentMetadata(i).outputType === 'create');
  let fields: IntentSpec[] = intents.filter(i => getIntentMetadata(i).outputType === 'fields');
  let modify: IntentSpec[] = intents.filter(i => getIntentMetadata(i).outputType === 'modify');
  const depends: IntentSpec[] = intents.filter(i => getIntentMetadata(i).outputType === 'depends');

  // if there are no 'create' or 'fields' intents, use the 'depends' intents, else add 'depends' to 'modify'
  if (create.length === 0 && fields.length === 0) {
    create = depends;
  } else {
    modify = modify.concat(depends);
  }
  // if there are still no create intents, but some fields have been specified,
  // create a dummy 'fields' intent with those fields in it
  if (create.length === 0 && fields.length === 0 && intent.intentFields && intent.intentFields.length > 0) {
    fields = [{ intentType: 'fields', fields: intent.intentFields }];
  }
  return { create, fields, modify };
}
