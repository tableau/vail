/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { FieldVars } from '../../../api/spec/FieldVars';
import { fieldAPI, FieldResolver } from '../../../api/spec/FieldAPI';

describe('FieldAPI.resolveDetails', () => {
  it('should return a string', () => {
    const results = fieldAPI('simple string').resolveDetails({});
    expect(results.length).toBe(1);
    expect(results[0].field).toBe('simple string');
  });

  it('should return FieldDetails', () => {
    const results = fieldAPI({ field: 'some name', derivation: 'max' }).resolveDetails({});
    expect(results.length).toBe(1);
    expect(results[0].field).toBe('some name');
    expect(results[0].derivation).toBe('max');
  });

  it('should look up variables', () => {
    const fieldVars: FieldVars = {
      var1: ['a', 'b'],
      var42: ['X', { field: 'Y', derivation: 'count' }],
      var3: ['m', 'n'],
    };
    const results = fieldAPI({ varName: 'var42' }).resolveDetails(fieldVars);
    expect(results.length).toBe(2);
    expect(results[0].field).toBe('X');
    expect(results[0].derivation).toBeUndefined();
    expect(results[1].field).toBe('Y');
    expect(results[1].derivation).toBe('count');
  });
});

describe('FieldAPI.resolveNames', () => {
  it('should work with a string', () => {
    const results = fieldAPI('simple string').resolveNames({});
    expect(results.length).toBe(1);
    expect(results[0]).toBe('simple string');
  });

  it('should work with FieldDetails', () => {
    const results = fieldAPI({ field: 'some name', derivation: 'max' }).resolveNames({});
    expect(results.length).toBe(1);
    expect(results[0]).toBe('some name');
  });

  it('should look up variables', () => {
    const fieldVars: FieldVars = {
      var1: ['a', 'b'],
      var42: ['X', { field: 'Y', derivation: 'count' }],
      var3: ['m', 'n'],
    };
    const results = fieldAPI({ varName: 'var42' }).resolveNames(fieldVars);
    expect(results.length).toBe(2);
    expect(results[0]).toBe('X');
    expect(results[1]).toBe('Y');
  });
});

describe('FieldResolver', () => {
  it('should support picking an index', () => {
    const fieldVars: FieldVars = { var: ['a', 'b', 'c'] };
    const resolver = new FieldResolver(fieldVars);

    expect(resolver.getField({ varName: 'var' }).field).toBe('a');
    resolver.set('var', 2);
    expect(resolver.getField({ varName: 'var' }).field).toBe('c');
    resolver.set('var', 4);
    expect(resolver.getField({ varName: 'var' }).field).toBe('b');
  });

  it('should support multiple refs to the same variable', () => {
    const fieldVars: FieldVars = { var: ['a', 'b', 'c'] };
    const resolver = new FieldResolver(fieldVars);

    // just setting an index on the resolver
    expect(resolver.getField({ varName: 'var', index: 1 }).field).toBe('b');
    resolver.set('var', 2);
    expect(resolver.getField({ varName: 'var', index: 1 }).field).toBe('a');
    resolver.set('var', 4);
    expect(resolver.getField({ varName: 'var', index: 1 }).field).toBe('c');

    // setting the index for each reference
    resolver.set('var', [0, 2]); // this means that index:1 should use field at array index 2
    expect(resolver.getField({ varName: 'var', index: 1 }).field).toBe('c');
  });
});
