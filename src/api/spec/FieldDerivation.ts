/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

/** Field modifiers */
export type FieldDerivation =
  // aggregation
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | 'stdev'
  | 'stdevP'
  | 'var'
  | 'varP'
  | 'count'
  | 'countD'
  | 'median'
  | 'sumXSqr'
  | 'percentile'

  // date bin
  | 'year'
  | 'quarter'
  | 'month'
  | 'day'
  | 'hour'
  | 'minute'
  | 'second'
  | 'week'
  | 'weekday'
  | 'monthYear'
  | 'mdy'
  | 'isoYear'
  | 'isoQuarter'
  | 'isoWeek'
  | 'isoWeekday'

  // date truncation
  | 'truncYear'
  | 'truncQuarter'
  | 'truncMonth'
  | 'truncDay'
  | 'truncHour'
  | 'truncMinute'
  | 'truncSecond'
  | 'truncWeek'
  | 'truncIsoYear'
  | 'truncIsoQuarter'
  | 'truncIsoWeek'
  | 'truncIsoWeekday';
