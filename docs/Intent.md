# Intent

[[_TOC_]]

VAIL models *intent*, i.e., a description of what the user is intending to look for when exploring data.
The VAIL engine can convert this intent to *output* that the user can see or hear such as a visualization or text.
But importantly, the user edits the *intent model* rather than the *output*.
Multiple intents can be specified in the same overall intent model.

Here are common commands for working with intent:

```javascript
// clear the entire entire model
vail.doCommand({ command: 'clearIntent' });
// set a single type of intent, with intent-specific details
vail.doCommand({ command: 'setIntent', intent: { id, intentType, ... } });
// tell VAIL to infer missing or ambiguous properties in the intent model
vail.doCommand({ command: 'inferIntent' });
// tell VAIL to suggest output that describes the data using the intent model
vail.doCommand({ command: 'suggestOutput' });
```

Supported types of intent include *correlation*, *distribution*, *encoding*, *fields*, *focus*, and *trend*.
Each of these can contain properties specific to the intent type, like the fields to use.
Properties are typically optional, and many can be inferred based on the semantics of the current data source.

```javascript
// setting an under-specified intent
vail.doCommand({ command: 'setIntent',
  intent: { intentType: trend, id: 42 } });
// changing that same intent, referenced by the id
vail.doCommand({ command: 'setIntent',
  intent: { intentType: trend, id: 42, measure: 'Profit', time: 'Order Date' } });
// removing the previous intent
vail.doCommand({ command: 'removeIntent', id: 42 });
```

You can have all instances of one field swapped out for another field.
Captures the intent of, "Use Profit instead of Sales".

```javascript
vail.doCommand({ command: 'replaceField', old: 'Sales', new: 'Profit' });
```


---

## `VailIntentSpec`

`VailIntentSpec` holds everything describing the user's intent model, including the following:

* list of intents
* field variables
* fields from the various intents, including inferred fields

```javascript
interface VailIntentSpec {
  intents?:      IntentSpec[];
  fieldVars?:    FieldVars;
  intentFields?: FieldSpec[];
}
```

Field variables are used when the infer-intent engine finds multiple possible fields for an intent property.
In the following example, the *distribution* intents *binField* property can be either *points* or *price*.

```javascript
example1 = {
  intents: [
    { intentType: 'distribution', id: 1,
      binField: {varName: 'distribution_binField_1'} },
    { intentType: 'focus', id: 2, values: ['Merlot', 'Zinfandel']}
  ],
  fieldVars: {
    distribution_binField_1: ['points', 'price'],
  }
}
```

If multiple intent properties reference the same field variable, they are differentiated by specifying a different *index*.
This allows the two properties to share a field list where each property refers to a different item in the list.

```javascript
example2 = {
  intents: [
    { intentType: 'correlation', id: 1,
      field1: {varName: 'correlation_field1_1', index: 0},
      field2: {varName: 'correlation_field1_1', index: 1} }
  ],
  fieldVars: {
    correlation_field1_1: ['points', 'price']
  }
}
```


---

## `FieldSpec`

The intent model uses `FieldSpec` to describe references to fields.
This can be in the form of a `string`, `FieldDetails`, or `VariableFieldDetails`.

```javascript
type FieldSpec = string | FieldDetails | VariableFieldDetails;
```

`FieldDetails` contains the name plus optional information on how to use the field.
This can include a field derivation (an aggregation like sum, a date bin such as *the year the date belongs to*, or a date truncation such as *the year part of a date*) and bin size to use in conjunction with intents such as distribution.
See [FieldDerivation.ts](../src/api/spec/FieldDerivation.ts) for the full list of options.

```javascript
interface FieldDetails {
  field:       string;
  derivation?: FieldDerivation;
  binCount?:    number;
}

type FieldDerivation =
  // aggregation
  | 'sum' | 'average' | 'min' | ...
  // date bin
  | 'year' | 'quarter' | 'month' | ...
  // date truncation
  | 'truncYear' | 'truncQuarter' | ... ;

// examples
{ field: 'price' }
{ field: 'price', derivation: 'average' }
{ field: 'price', derivation: 'average', binCount: 10 }
```

When the VAIL engine tries to infer missing intent information and finds multiple possible fields, it puts the list of fields in a *field variable* and references that list from a `VariableFieldDetails` object.

```javascript
interface VariableFieldDetails {
  // name of the variable
  varName: string;
  // [optional] if multiple intent properties reference the same variable, each gets a unique index
  index?: number;
}

// examples
{ varName: 'focus_field_3' }
{ varName: 'focus_field_3', index: 2 }
```


---

## Specific intent types

`IntentSpec` is the general interface for an *intent specification*.
All intent specifications include `intentType` and an optional `id` for tracking the intent across edits and output.
After the VAIL engine has filled in missing or ambiguous details in an intent specification, the `inferred` property may contain a list of inferred intent properties that were added.

```javascript
// the various built-in intent specifications
type IntentSpec = IntentCorrelation | IntentDistribution
  | IntentEncoding | IntentField | IntentFocus | IntentTrend;

{ // common properties for all intent specifications
  intentType: string;
  id?:        number;
  inferred?:  string[];
}
```


### Correlation

Models wanting to see the correlation between two fields.

```javascript
interface IntentCorrelation {
  intentType: 'correlation';
  field1?:    FieldSpec;
  field2?:    FieldSpec;
}

// "What's the correlation in the current data set?"
{ intentType: 'correlation' }
// "How are price and points correlated?"
{ intentType: 'correlation', field1: 'price', field2: 'points' }
```

### Distribution

Models wanting to see the distribution of values for a field.

```javascript
interface IntentDistribution {
  intentType: 'distribution';
  binField?:  FieldSpec;
}

// "What's the distribution in the current data set?"
{ intentType: 'distribution' }
// "What's the distribution  of price?"
{ intentType: 'distribution', binField: 'price' }
```

### Encoding

Models wanting to explicitly specify how the values of a field are encoded.
See [Output](Outout.md) for more information about `EncodingSpec`.

```javascript
interface IntentEncoding {
  intentType: 'encoding';
  encoding:   EncodingSpec;
}

// "I want the chart colored based on the variety"
{ intentType: 'encoding', encoding: { color: ['variety'] } }
```

### Fields

Models wanting to capture the vague notion of being interested in fields without saying why.

```javascript
interface IntentField {
  intentType: 'fields';
  fields:     FieldSpec[];
}

// "I'm interested in Sales and Product"
{ intentType: 'fields', fields: ['Sales', 'Product'] }
```

### Focus

Models wanting to focus on particular values or a range of values for a field.

```javascript
interface IntentFocus {
  intentType: 'focus';
  field?:     FieldSpec;
  values?:    string[];
  sortBy?:    FieldSpec;
  adjective?: FocusAdjective;
  quantity?:  number;
  strategy?:  FocusStrategy;
}
type FocusAdjective =
  'top' | 'bottom' | 'best' | 'worst' | 'high' | 'low' |
  'cheapest' | 'most expensive' | 'cheap' | 'expensive';
type FocusStrategy = 'filter' | 'highlight' | string;

// "Focus on Washington and California"
{ intentType: 'focus', values: ['Washington', 'California'] }
// "Focus on the best ones"
{ intentType: 'focus', adjective: 'best' }
// "Focus on the best varieties"
{ intentType: 'focus', adjective: 'best', field: 'variety' }
// "Only show the top 5 most expensive varieties"
{ intentType: 'focus', adjective: 'most expensive',
  field: 'variety', sortBy: 'price', strategy: 'filter' }
```

### Trend

Models wanting to see the trend of a field over time.

```javascript
interface IntentTrend {
  intentType: 'trend';
  measure?:   FieldSpec;
  time?:      FieldSpec;
}

// "What's the trend in the current data set?"
{ intentType: 'trend' }
// "Show me the trend of Sales by Order Date"
{ intentType: 'trend', measure: 'Sales', time: 'Order Date' }
```
