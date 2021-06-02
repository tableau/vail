/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { fieldAPI, FieldResolver } from './FieldAPI';
import { FieldSpec } from './FieldSpec';
import { OutputSpec } from './OutputSpec';

/** Find all the fields in use for a particular OutputSpec & FieldResolver, which resolves field variables */
export function getOutputFields(output: OutputSpec, resolver: FieldResolver): FieldSpec[] {
  let fields: FieldSpec[] = [];

  fields = fields.concat(
    resolveMembers(resolver, (output.encoding as unknown) as Any, ['x', 'y', 'text', 'color', 'size', 'shape', 'detail'])
  );

  if (output.dataShape) {
    if (output.dataShape.focus) {
      const newFields = output.dataShape.focus.map(focus => resolver.getField(focus.field));
      fields = fields.concat(newFields);
    }
    if (output.dataShape.sort) {
      const f1 = output.dataShape.sort.map(focus => resolver.getField(focus.field));
      const f2 = output.dataShape.sort.map(focus => resolver.getField(focus.sortBy));
      fields = fields.concat(f1.concat(f2));
    }
  }

  fields = removeDupes(fields);
  return fields;
}

/** Resolve each object[member] */
function resolveMembers(resolver: FieldResolver, object: Any, members: string[]): FieldSpec[] {
  let fields: FieldSpec[] = [];
  if (object === undefined) {
    return fields;
  }
  for (const member of members) {
    if (object[member] !== undefined) {
      if (Array.isArray(object[member])) {
        const result = resolveList(resolver, object[member] as FieldSpec[]);
        fields = fields.concat(result);
      } else {
        const field = resolver.getField(object[member] as FieldSpec);
        fields.push(field);
      }
    }
  }
  return fields;
}

interface Any {
  [key: string]: object;
}

/** Resolve a list of fields */
function resolveList(resolver: FieldResolver, fields?: FieldSpec[]): FieldSpec[] {
  return fields ? fields.map(field => resolver.getField(field)) : [];
}

/** Remove duplicate fields */
function removeDupes(fields: FieldSpec[]): FieldSpec[] {
  const newList: FieldSpec[] = [];
  fields.forEach(field => {
    const api = fieldAPI(field);
    if (!newList.some(other => api.areEqual(other))) {
      newList.push(field);
    }
  });
  return newList;
}
