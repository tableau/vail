# Output

The VAIL engine can take the user intent model and provide suggestions for how to effectively present the results to communicate the intent.
Specifically, it takes a `VailIntentSpec` (user intent model) and a `DataSemantics` (data field semantics) and creates a `VailOutputSpec`.

```javascript
const outputs = engine.suggestOutput(intent, dataSemantics);
```

The output specification is designed to be implementation agnostic.
It could be converted to a visualization formalism such as [VizQL](https://www.tableau.com/products/technology) or [Vega Lite](https://vega.github.io/vega-lite/), or converted to text used from a chatbot.
As described below, you can also use VAIL's built-in converter to Vega Lite to create a visualization.

`VailOutputSpec` contains various collections of `OutputSpec` objects, which describe a single visualization or text output.
The first `OutputSpec` in the `sortedSpecs` property is often sufficient, but more advanced uses could examine the specifications in more detail and decide to display more than one.
`VailOutputSpec` contains the following properties:

* **sortedSpecs**: Every suggested output specification, sorted by weight so the most highly recommeded output comes first
* **idToOutput**: A map from intent id to `OutputSpec`, for each stand-alone intent (like correlation or trend)
* **fromFields**: A list of `OutputSpec`s generated from the full list of input fields rather than a specific intent
* **fieldVars**: *Field variables* used by the `OutputSpec` whenever there are multiple possible fields for a property

```javascript
interface VailOutputSpec {
  sortedSpecs: OutputSpec[];
  idToOutput: IdToOutput;
  fieldVars: FieldVars;
}
interface IdToOutput {
  [id: number]: OutputSpec[];
  intentIds: number[];
}


const outputs = engine.suggestOutput(intent, dataSemantics);
// get the most highly recommended output
outputs.sortedSpecs[0];
// get the outputs associated with a specific stand-alone intent
outputs.idToOutput[intent.id];
```


---
## `OutputSpec`

Each individual `OutputSpec` maps to a single presentation of a set of fields from the data source.
It contains the following information:

* **weight**: A number from 0 to 100, where higher numbers indicate a better fit for the user's intent.
* **intentIds**: A list of the ids for the intent specifications used to create this output specification.
* **encoding**: A visualization type and encoding-to-fields lists describing the output.

```javascript
interface OutputSpec {
  weight:     number;
  intentIds:  number[];
  dataShape?: DataShapeSpec;
  encoding:   EncodingSpec;
}

// example of a histogram of average points
{
  weight: 90,
  intentIds: [ 1 ],
  encoding: {
    vizType: "histogram",
    x: [ { field: "points", derivation: "average" } ]
  }
}
```


---
## `EncodingSpec`

The `EncodingSpec` contains a visualization type with lists of fields to use for each type of encoding.
A particular output implementation is free to choose the specific encodings to apply for `color`, `size`, and `shape`.
The `detail` indicates how the data should be broken down, but isn't otherwise encoded.

```javascript
interface EncodingSpec {
  vizType: VizType;
  x?:      FieldSpec[];
  y?:      FieldSpec[];
  text?:   FieldSpec[];
  color?:  FieldSpec[];
  size?:   FieldSpec[];
  shape?:  FieldSpec[];
  detail?: FieldSpec[];
}

type VizType = 'singleAnswer' | 'textTable' | 'scatterPlot' | 'bar' | 'line' | 'histogram';
```


---
## `DataShapeSpec`

`DataShapeSpec` describes additional data shaping that should happen before displaying the data.
This includes operations such as filtering, highlighting, or sorting.

```javascript
interface DataShapeSpec {
  sort?: SortSpec[];
  focus?: FocusSpec[];
}

/** e.g., filter or highlight a subset of the data */
interface FocusSpec {
  field: FieldSpec;
  values?: string[];
  adjective?: AdjectiveType;
  quantity?: number;
  strategy: FocusStrategy;
}

type AdjectiveType =
  'top' | 'bottom' |    // prefer a single value
  'high' | 'low';       // prefer multiple values
type FocusStrategy = 'filter' | 'highlight' | string;

/** apply a sort */
interface SortSpec {
  field: FieldSpec;
  sortBy: FieldSpec;
  sortType: SortType;
}

type SortType = 'ascending' | 'descending';
```


---
## Handling multiple output alternatives

VAIL attempts to resolve as much ambiguity as it can and rank its suggestions so that the first option is the best one based on the user input.
But `VailOutputSpec` often contains multiple outputs, and a client may choose to show multiple options to give the user a better idea of the different ways their input could be interpreted so they can choose the one they are most interested in.

There might be multiple possible outputs because the input included multiple stand-alone intents, because infer-intent found multiple possible fields for a single property, and/or because there were multiple recommended outputs for the overall field list. The following sections will go into more detail on these three cases.

### Multiple stand-alone intents

VAIL categorizes the various intent types as either *stand-alone* (like correlation, distribution, fields, or trend) or a *modifier* (like focus or encode). One or more separate `OutputSpec` objects are generated for each stand-alone intent, while modifier intents modify all the other `OutputSpec`s.

```javascript
const outputs = engine.suggestOutput(intent, dataSemantics);
if (outputs.idToOutput.ids.length > 1) {
  // there are multiple stand-alone intents that generated output
  const firstSet = outputs.idToOutput[outputs.idToOutput.intentIds[0]];
}
```

### Multiple possible fields

When VAIL attempts to fill in a missing field property in an intent, it may find multiple possible fields.
If so, it will create a *field variable* to hold all the possibilities and put a reference to that variable in the intent property.
An `OutputSpec` converter is free to use any of the values, choosing the first item in the variable list by default because it's the most highly recommended.
The client can use `FieldResolver` to tell an output converter which field to pick.

```javascript
// example of an OutputSpec referencing a field variable
const output = {
  encoding: {
    vizType: "histogram",
    x: [ { varName: "distribution_binField_1" } ]
  }
}
const fieldVars: {
  distribution_binField_1: [
    { field: "Age" },
    { field: "Fare" }
  ]
}

// indicate that you want to use item 1 (Fare) rather than 0 (Age)
const resolver = new FieldResolver(fieldVars);
resolver.set('distribution_binField_1', 1);
// this is how an output converter uses the resolver
const x0 = output.encoding.x[0];
const xField = resolver.getField(x0);
// xField now contains { field: "Fare" }
```

It's also possible for multiple intent properties to reference a single field variable.
In this case, each reference will have its own index to make it simpler to have each reference resolve to a different item in the variable list.

Consider the *correlation* intent, which is used to see the correlation between two fields.
Since both intent properties are fields of the same type (a *measure*), if you don't specify either of them, the infer-intent engine will assign the same variable to both correlation properties.

```javascript
const intent = engine.inferIntent({ intentType: 'correlation' });
const output = engine.suggestOutput(intent, dataSemantics);
// output might look something like this...
{
  sortedSpecs: [{
    encoding: {
      vizType: "scatterPlot",
      x: [{ varName: "correlation_field_1", index: 0 }],
      y: [{ varName: "correlation_field_1", index: 1 }]
    }
  }],
  fieldVars: {
    correlation_field_1: [
      { field: "points" }, { field: "price" }, { field: "value" }
    ]
  }}
```

By default, `FieldResolver` will use `index` to figure out which value in the `correlation_field_1` array to use.
Thus `x` will resolve to *points* and `y` will resolve to *price*.

There are a couple ways you can tell `FieldResolver` to pick different items from the list.

```javascript
const fieldResolver = new FieldResolver(output.fieldVars);
// tell it to offset its picks by 2 so x will be 'value' and y will be 'points'
fieldResolver.set('correlation_field_1', 2);
// tell it to use item 1 for x (price) and item 2 for y (value)
fieldResolver.set('correlation_field_1', [1, 2]);
```

### Multiple outputs from the overall field list

VAIL gathers up all the explicitly listed fields (from `{command: 'addFields'}`) and all the fields contained in all the intents, and recommends output based on the overall field list.
These are contained in `VailOutputSpec.fromFields`.
Since they are also part of `sortedSpecs`, it's less likely that you'll decide to leverage this list, but it can be useful when differentiating between outputs generated from explicit intents versus ones generated from the list of input fields.


---
## Vega Lite converter

You can use [VegaLite](https://vega.github.io/vega-lite/) to display the first recommendation as a visualization with the following code:

```javascript
const output = vail.getOutput();
const resolver = new FieldResolver(intent.fieldVars);
const vegalite = convertToVegaLite(output[0], resolver, vail.getDataSource(), data);
const results = VL.compile(vegalite);
embed('#vegaLiteViz', results.spec);
```


---
## Query

`OutputSpec` contains a list of fields, some of which may specify derivations such as `sum of` or `year of`.
It may also include data shaping operations such as filtering and sorting.
In many cases, this requires processing the raw data table by aggregating, filtering, and sorting it.
While, this isn't a core part of VAIL, it does offer utility functions to help you shape your data.

To reshape your data based on a particular `OutputSpec`, you can do the following:

```javascript
const output = vail.getOutput();
const resolver = new FieldResolver(intent.fieldVars);
const data = queryData(output[0], resolver, vail.getDataSource(), data);
```

If you just want to generate the appropriate SQL query without running it, you can make the following call instead:

```javascript
const data = getQueryString(output[0], resolver, vail.getDataSource());
```

Several notes about `queryData` and `getQueryString`:

* In the returned result set, aggregated fields include the aggregation in their name, e.g. `average price`. This makes it so a single field can have multiple aggregations. Call `getFieldLabel` to figure out the name for a given `FieldSpec`.
* It currently supports a limited set of aggregations.
* It currently supports aggregation and sorting, but not filtering or binning.

