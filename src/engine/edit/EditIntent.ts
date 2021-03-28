/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { VailIntentSpec } from '../../api/spec/VailIntentSpec';
import { EditCommands, ReplaceField, SetIntent, RemoveIntent } from '../../api/command/EditCommands';
import { fieldAPI } from '../../api/spec/FieldAPI';
import { getIntentMetadata } from '../../api/spec/IntentMetadata';
import { IntentSpec } from '../../api/spec/IntentSpec';
import { FieldSpec } from '../../api/spec/FieldSpec';

/** generate a new intent spec based on a command for modifying an old intent spec */
export function editIntent(input: VailIntentSpec, command: EditCommands): VailIntentSpec {
  switch (command.command) {
    case 'setIntent':
      return setIntent(input, command);
    case 'removeIntent':
      return removeIntent(input, command);
    case 'replaceField':
      return replaceField(input, command);
  }
  return input;
}

function replaceField(input: VailIntentSpec, command: ReplaceField): VailIntentSpec {
  const check = fieldAPI(command.old);
  // replace in the intents list
  if (input.intents) {
    const intents: IntentSpec[] = [];
    for (const intent of input.intents) {
      const newIntent = { ...intent };
      const allFields = getIntentMetadata(intent).allFields;
      for (const prop of allFields) {
        // examine an intent property, replacing any old field spec
        const value = (intent as any)[prop];
        // the intent property could be a field or array of fields
        if (Array.isArray(value)) {
          const newFields = value.map(f => (check.areEqual(f as FieldSpec) ? command.new : (f as FieldSpec)));
          (newIntent as any)[prop] = newFields;
        } else if (check.areEqual(value as FieldSpec)) {
          (newIntent as any)[prop] = command.new;
        }
      }
      intents.push(newIntent);
    }
    input = { ...input, intents };
  }
  return input;
}

function setIntent(input: VailIntentSpec, command: SetIntent): VailIntentSpec {
  if (command.intent.id && input.intents) {
    // if it has an id that matches an existing intent, replace it
    let found: number | null = null;
    input.intents.forEach((intent, i) => {
      if (intent.id === command.intent.id) {
        found = i;
      }
    });
    if (found !== null) {
      const intents = [...input.intents];
      intents[found] = command.intent;
      return { ...input, intents };
    }
  }
  // add a new intent
  const intents = input.intents ? input.intents.concat(command.intent) : [command.intent];
  return { ...input, intents };
}

function removeIntent(input: VailIntentSpec, command: RemoveIntent): VailIntentSpec {
  if (!input.intents) {
    return input;
  }
  const intents = input.intents.filter(intent => intent.id !== command.id);
  return { ...input, intents };
}
