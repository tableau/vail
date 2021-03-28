# Adding new intent types

If the intent types that VAIL comes with aren't sufficient, you can add new intent types.
This consists of three stesp:

1. Define the intent specification.
1. Define the rules for inferring ambiguous or missing portions of the intent specification.
1. Define the rules for creating effective output from the intent specification.

## Defining the intent specification

The first step is to define the properties that capture the intent you are trying to model.
This typiclly involves one or more fields that have specific roles in your intent.
It may also involve properties such as numbers or flags of various sorts.

Let's say you wanted to create a new *time* intent that can model concepts such as "show me 2021" or "show shipments from January".
This is similar to the *focus* intent, but we'll use this example to add some additional, time-specific logic.
For simplicity, we'll limit it to just absolute years and months, though you can imagine extending this to relative times ("show me last year") and other units of time.

We want to allow the user to specify any of the field representing time, the unit of time, and/or a list of values.
Since we want the system to be able to infer the missing information, we make each of those properties optional.
We put our new intent definition in [IntentSpec.ts](../src/api/spec/IntentSpec.ts) and add it to the list of options for `IntentSpec`.

```javascript
export type IntentSpec = IntentCorrelation | ... | IntentTime;

export interface IntentTime {
  readonly intentType: 'time';
  // id & inferred are common to all intent types
  readonly id?: number;
  readonly inferred?: string[];

  // properties specific to a time intent
  readonly timeField?: FieldSpec;
  readonly timeUnit?: 'year' | 'month';
  readonly timeValues?: number[] | string[];
}
```

Next, we need to give some additional metadata about `IntentTime` so it can do some bookkeeping behind the scenes.
We need to tell it which properties represent fields, which of those can be inferred, which other properties can be inferred, and its `outputType`.

This last piece of information indicates whether the intent is used to create a new output specification (such as a line chart) or if it modifies other output (such as a filter).
For our new intent, we're going to have it modify other output.
This would let someone express something such as "show me the trend from 2019" by combining the treand intent (which creates a line chart) and our new time intent.
We put our intent metadata in [IntentMetadata.ts](../src/api/spec/IntentMetadata.ts).

```javascript
const timeMetadata: IntentMetadata = {
  allFields: ['timeField'],
  inferrableFields: ['timeField'],
  inferrableProperties: ['timeUnit', 'timeValues'],
  outputType: 'modify',
};

export function getIntentMetadata(intent: IntentSpec): IntentMetadata {
  ...
    case 'time':
      return timeMetadata;
  ...
}
```


## Defining rules for inferring intent

Next, we define rules for inferring ambiguous or missing information.
Here are some examples of what we might want to support:

* If `timeField` is missing but `timeUnit` is present, grab all fields where `type` is `'Ctime'`.
* If `timeField` is missing but `timeValues` is present, look through the domains of all `Ctime` fields to find possible fields.
* If `timeUnit` is missing but `timeValues` is present, use the values to figure out the unit type.
* If `timeUnit` is present and `timeField` doesn't have a derivation, use the appropriate derivation based on the time unit.

We create a new `FillInTime.ts` file and put it in [engine/infer](../src/engine/infer).
We add a hook to our new function in `fillInInent` in [InferIntent.ts](../src/engine/infer/InferIntent.ts).

```javascript
/** fill in ambiguous or missing information in a time intent */
export function fillInTimeIntent(intent: IntentTime, fields: FieldDetails[],
  fieldVars: FieldVars, dataSemantics: DataSemantics
): [IntentTime, FieldVars] {
  [intent, fieldVars] = fillInTimeField(intent, fields, fieldVars, dataSemantics);
  [intent, fieldVars] = fillInTimeUnit(intent, fields, fieldVars, dataSemantics);
  [intent, fieldVars] = fillInTimeDerivation(intent, fields, fieldVars, dataSemantics);
  return [intent, fieldVars];
}

function fillInTimeField(intent: IntentTime, fields: FieldDetails[],
  fieldVars: FieldVars, dataSemantics: DataSemantics
): [IntentTime, FieldVars] {
  if (!intent.timeField && intent.timeUnit) {
    // grab all time fields
    const allTimeFields = fields.filter(field => dataSemantics[field.field].type === 'CTime');
    const [newIntent, newFieldVars] = putFieldsInProperty(intent, 'time', allTimeFields, fieldVars);
    return [newIntent as IntentTime, newFieldVars];
  } else if (!intent.timeField && intent.timeValues) {
    // grab all time fields whose domains include the specified values
    ...
  }

  return [intent, fieldVars];
}

// define fillInTimeUnit & fillInTimeDerivation
```


## Defining rules for suggesting output

Finally, you define the rules for turning your new intent specification into an output specification.

If your intent is `outputType:'create'`, you will add to [IntentToOutput.ts](../src/engine/output/IntentToOutput.ts).

```javascript
export function intentToOutput(intent: IntentSpec, weight: number): OutputSpec | null {
  ...
    case 'time':
      if (intent.timeField) {
        return { weight, intentIds, encoding: { vizType: 'histogram', x: [intent.timeField] } };
      }
      break;
  ...
```

But, in our case, we have decided on `outputType:'modify'`, so our new rule is added to [ModifyFromIntents.ts](../src/engine/output/ModifyFromIntents.ts) so that it can modify an existing `OutputSpec`.

```javascript
function modifyOneFromIntents(intents: IntentSpec[], outputSpec: OutputSpec): OutputSpec {
  ...
    case 'time':
        outputSpec = modifyFromTime(outputSpec, intent);
  ...

function modifyFromTime(outputSpec: OutputSpec, focus: IntentTime): OutputSpec {
  // modify 'outputSpec' using the 'focus' specifiation
  ...
}
```


## Adding custom UI

The VAIL prototype includes sample UI for creating and modifying various intent types.
If you wish to add UI for your new intent, the code can be found in [app/intentGUI](../src/app/intentGUI).
The UI for specific intents has hooks in [IntentWidgets.ts](../src/app/intentGUI/IntentWidgets.ts).
You can follow the patterns for some of the other intent types to implement your own.
