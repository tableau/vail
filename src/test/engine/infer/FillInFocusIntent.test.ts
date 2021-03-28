/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../../api/dataSemantics/DataSemantics';
import { fillInFocusIntent } from '../../../engine/infer/FillInFocusIntent';
import { IntentFocus } from '../../../api/spec/IntentSpec';
import { FieldDetails, VariableFieldDetails } from '../../../api/spec/FieldSpec';
import { trackIntentFields } from '../../../engine/infer/TrackFields';
import { fieldAPI } from '../../../api/spec/FieldAPI';

describe('fillInFocusIntent', () => {
  const dataSemantics: DataSemantics = {
    somethingNumeric: { type: 'Qd', stats: { dataType: 'numeric', domain: [] } },
    somethingText: { type: 'Cat', stats: { dataType: 'text', domain: ['a', 'b', 'c'] } },
    somethingBiggerText: { type: 'Cat', stats: { dataType: 'text', domain: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] } },
    money: { type: 'CCurrency', stats: { dataType: 'text', domain: [] } },
  };
  const allFields: FieldDetails[] = [{ field: 'somethingNumeric' }, { field: 'somethingText' }, { field: 'somethingBiggerText' }];
  const withMoney: FieldDetails[] = [
    { field: 'somethingNumeric' },
    { field: 'somethingText' },
    { field: 'somethingBiggerText' },
    { field: 'money' },
  ];

  it('should fill in missing field when it has quantity', () => {
    const intent: IntentFocus = {
      intentType: 'focus',
      adjective: 'top',
      quantity: 5,
      strategy: 'highlight',
    };
    const [newIntent] = fillInFocusIntent(intent, allFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('focus');
    expect(newIntent.inferred ? newIntent.inferred[0] : '').toBe('field');
    // intent shouldn't reference a new field variable because there's only 1 option
    expect(newIntent.field ? fieldAPI(newIntent.field).getName() : '').toBe('somethingBiggerText');

    const trackFields = trackIntentFields(newIntent);
    const fieldDetails = trackFields.get()[0] as FieldDetails;
    expect(fieldDetails.field).toBe('somethingBiggerText');
    expect(trackFields.get().length).toBe(2); // 2 because a field for sortBy was also inferred
  });

  it('should fill in missing field with adjective but not quantity', () => {
    const intent: IntentFocus = {
      intentType: 'focus',
      adjective: 'top',
      strategy: 'highlight',
    };
    const [newIntent, newVars] = fillInFocusIntent(intent, allFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('focus');
    expect(newIntent.inferred ? newIntent.inferred[0] : '').toBe('field');
    expect(Object.getOwnPropertyNames(newVars).length).toBe(1);
    // intent should reference a new field variable
    const fieldVar = newIntent.field ? (newIntent.field as VariableFieldDetails) : { varName: '' };
    const lookup = newVars[fieldVar.varName];
    expect(lookup.length).toBe(2);
    const one = fieldAPI(lookup[0]).getName();
    expect(one).toBe('somethingText');
    const two = fieldAPI(lookup[1]).getName();
    expect(two).toBe('somethingBiggerText');
  });

  it('should fill in missing field with values by looking at field domains', () => {
    const intent: IntentFocus = {
      intentType: 'focus',
      values: ['c', 'f'], // 'f' is only part of 'somethingBiggerText'
    };
    const [newIntent] = fillInFocusIntent(intent, allFields, {}, dataSemantics);

    expect(newIntent.intentType).toBe('focus');
    expect(newIntent.inferred ? newIntent.inferred[0] : '').toBe('field');
    expect(newIntent.field ? (newIntent.field as FieldDetails).field : '').toBe('somethingBiggerText');
  });

  it('should fill in missing sortBy', () => {
    const intent: IntentFocus = {
      intentType: 'focus',
      field: 'somethingText',
      adjective: 'top',
    };
    const [newIntent] = fillInFocusIntent(intent, [{ field: 'somethingNumeric' }, { field: 'somethingText' }], {}, dataSemantics);

    expect(newIntent.intentType).toBe('focus');
    const sortBy = newIntent.sortBy ? (newIntent.sortBy as FieldDetails) : { field: '' };
    expect(sortBy.field).toBe('somethingNumeric');
    expect(newIntent.inferred ? newIntent.inferred[0] : '').toBe('sortBy');
  });

  it('should grab currency, or fallback if no currency', () => {
    const intent: IntentFocus = { intentType: 'focus', field: 'somethingText', adjective: 'cheap' };

    const [money] = fillInFocusIntent(intent, withMoney, {}, dataSemantics);
    expect(money.intentType).toBe('focus');
    expect(money.sortBy ? fieldAPI(money.sortBy).getName() : '').toBe('money');
    expect(money.inferred ? money.inferred[0] : '').toBe('sortBy');

    const [nomoney] = fillInFocusIntent(intent, allFields, {}, dataSemantics);
    expect(nomoney.intentType).toBe('focus');
    expect(nomoney.sortBy ? fieldAPI(nomoney.sortBy).getName() : '').toBe('somethingNumeric');
    expect(nomoney.inferred ? nomoney.inferred[0] : '').toBe('sortBy');
  });

  it('should fill in missing strategy', () => {
    const intent: IntentFocus = {
      intentType: 'focus',
      field: 'categoricalField',
    };
    const [newIntent] = fillInFocusIntent(intent, [], {}, dataSemantics);

    expect(newIntent.intentType).toBe('focus');
    expect(newIntent.strategy).toBe('highlight');
    expect(newIntent.inferred ? newIntent.inferred[0] : '').toBe('strategy');
  });
});
