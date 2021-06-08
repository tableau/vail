import { fieldAPI } from '../../api/spec/FieldAPI';
import { FieldSpec } from '../../api/spec/FieldSpec';

/** create a name that uniquely identifies the field by name & derivation */
export function getFieldLabel(field: FieldSpec): string {
  const details = fieldAPI(field).asDetails();
  if (details === null || details.derivation === undefined) {
    return fieldAPI(field).getName();
  }
  return details.derivation + ' ' + details.field;
}
