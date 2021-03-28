/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { IntentSpec, IntentFocus, IntentEncoding } from '../../api/spec/IntentSpec';
import { AdjectiveType, FocusSpec, OutputSpec, SortType } from '../../api/spec/OutputSpec';

/** modify every output spec based on every modifier intent */
export function modifyFromIntents(modify: IntentSpec[], outputSpecs: OutputSpec[]): OutputSpec[] {
  const modifiedList: OutputSpec[] = [];
  for (const outputSpec of outputSpecs) {
    modifiedList.push(modifyOneFromIntents(modify, outputSpec));
  }
  return modifiedList;
}

/** run through each modifier intent type, modifying the given output */
function modifyOneFromIntents(intents: IntentSpec[], outputSpec: OutputSpec): OutputSpec {
  for (const intent of intents) {
    switch (intent.intentType) {
      case 'focus':
        outputSpec = modifyFromFocus(outputSpec, intent);
        break;
      case 'encoding':
        outputSpec = modifyFromEncoding(outputSpec, intent);
        break;
    }
  }
  return outputSpec;
}

/** modify an output spec using information in a focus intent */
function modifyFromFocus(outputSpec: OutputSpec, focus: IntentFocus): OutputSpec {
  const intentIds = focus.id ? outputSpec.intentIds.concat(focus.id) : outputSpec.intentIds;

  const foci: FocusSpec[] = outputSpec.dataShape && outputSpec.dataShape.focus ? outputSpec.dataShape.focus : [];
  if (focus.field && focus.sortBy) {
    let sortType: SortType = 'descending';
    let adjective: AdjectiveType = 'top';
    switch (focus.adjective) {
      case 'top':
      case 'best':
      case 'most expensive':
        sortType = 'descending';
        adjective = 'top';
        break;
      case 'high':
      case 'expensive':
        sortType = 'descending';
        adjective = 'high';
        break;
      case 'bottom':
      case 'worst':
      case 'cheapest':
        sortType = 'ascending';
        adjective = 'bottom';
        break;
      case 'low':
      case 'cheap':
        sortType = 'ascending';
        adjective = 'low';
        break;
    }

    const sortSpec = [{ field: focus.field, sortBy: focus.sortBy, sortType }];
    let focusSpec;
    if (focus.values) {
      focusSpec = foci.concat({ field: focus.field, adjective, values: focus.values, strategy: focus.strategy! });
    } else {
      focusSpec = foci.concat({ field: focus.field, adjective, quantity: focus.quantity, strategy: focus.strategy! });
    }
    outputSpec = { ...outputSpec, intentIds, dataShape: { sort: sortSpec, focus: focusSpec } };
  } else if (focus.field && focus.values) {
    const focusSpec = foci.concat({ field: focus.field, values: focus.values, strategy: focus.strategy! });
    outputSpec = { ...outputSpec, intentIds, dataShape: { focus: focusSpec } };
  }

  return outputSpec;
}

/** modify an output spec using information in an encoding intent */
function modifyFromEncoding(outputSpec: OutputSpec, intent: IntentEncoding): OutputSpec {
  const encoding = { ...outputSpec.encoding, ...intent.encoding };
  const intentIds = intent.id ? outputSpec.intentIds.concat(intent.id) : outputSpec.intentIds;
  return { ...outputSpec, intentIds, encoding };
}
