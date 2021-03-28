# Data Semantics

The VAIL engine requires information about the data source the user wants to explore in order to operate.
When VAIL infers intent or suggests output based on that intent, it uses information about the semantics of fields in a table to do its reasoning.

Consider data about wines stored in a table that looks like this:

| variety | price | points | name |
| ---     | ---   | ---    | ---  |
| Cabernet Sauvignon | 45 | 92 | Silverado 2006 Cabernet Sauvignon |
| Cabernet Sauvignon | 78 | 91 | Clark-Clauden 2007 Cabernet Sauvignon |
| etc. |

VAIL can take an intent like "most expensive wines" and deduce that it refers to the *price* field if it knows that that field refers to money.

Therefore, the fist step in preparing the VAIL engine is to pass it information about the fields.
For the wine data set above, this might look like this:

```javascript
// give VAIL information about the fields to reason about
const fieldInfo = {
  points: { type: 'Qd', derivation: 'average',
    stats: { dataType: 'numeric', domain: [] } },
  price: { type: 'CCurrency', derivation: 'average',
    stats: { dataType: 'numeric', domain: [] } },
  variety: { type: 'Cat',
    stats: { dataType: 'text', domain: ['Cabernet Sauvignon', ...] } },
  name: { type: 'Cat',
    stats: { dataType: 'text', domain: ['Silverado 2006 Cabernet Sauvignon', ...] } },
};
vail.doCommand({ command: 'setDataSemantics', fieldInfo });
```

In this example, *derivation* is used to tell VAIL to default to *average* points and price.

Note that VAIL prioritizes fields that are listed earlier when it tries to infer missing intent, which gives you the ability to tell VAIL which fields to choose first.
In the above example, this means that *variety* would be suggested before *name*.

VAIL may look at a field's domain when inferring missing intent.
For example, if the user says, "Focus on Cabernet Sauvignon", VAIL can search the domains of all the fields to find that the *variety* field contains that value.
Therefore, it can guess that the user was probably referring to that field.
Leaving off a field's domain simply means that VAIL can't infer the missing field in this case.

Optionally, you can call `computeFieldStats` to have the domain computed for you.
Note that VAIL doesn't otherwise look at the data, which is useful for large data sets because the engine doesn't need to load or query the full data.

```javascript
// describe information about the fields
const rawFieldInfo = {
  points: { type: 'Qd', derivation: 'average',
    stats: { dataType: 'numeric', domain: [] } },
  price: { type: 'CCurrency', derivation: 'average',
    stats: { dataType: 'numeric', domain: [] } },
  variety: { type: 'Cat',
    stats: { dataType: 'text', domain: [] } },
  name: { type: 'Cat' },
    stats: { dataType: 'text', domain: [] } },
};
// compute the field stats
const wineData = {
  {
    points: 92,
    price: 45,
    name: 'Silverado 2006 Cabernet Sauvignon',
    variety: 'Cabernet Sauvignon',
  },
  {
    points: 91,
    price: 78,
    name: 'Clark-Clauden 2007 Cabernet Sauvignon',
    variety: 'Cabernet Sauvignon',
  },
  ...
};
const fieldInfo = computeFieldStats(rawFieldInfo, wineData);
// have VAIL use the results
vail.doCommand({ command: 'setDataSemantics', fieldInfo });
```

## FieldInfo

`FieldInfo` describes the semantics of a single field and can be hand curated to give VAIL more information as it tries to help the user explore their data.

```javascript
interface FieldInfo {
  type: FieldType;
  derivation?: FieldDerivation;
  binCount?: number;
  stats: FieldStats;
}
```

The `type` property can be one of the following:

| class | `type` value | description |
| ---   | ---          | --- |
| categorical  | 'Cat' | general categorical field |
|              | 'CTime' | date or time |
|              | 'CGeo' | geographic field |
|              | 'CCurrency' | currency |
| quantitative | 'Qd' | dependent measure |
|              | 'Qi' | independent dimension |
|              | 'QLat' | latitude |
|              | 'QLon' | longitude |

The `derivation` property describes the default method of interpreting a field.
It can be an aggregation (e.g., *sum*, *average*, *min*, or *stdev*), date bin (e.g., *year*, *quarter*, *day*), or date truncation (e.g., *truncYear*, *truncQuarter*).
By default, a quantitative field is aggregated as a sum.
By specifying `derivation` you can tailor the default to something useful for the given field, e.g., showing *average* points instead of *sum*.

The `binCount` property can be set to specify the default when binning the values in the field, e.g., when displaying a histogram of the data distribution.
It is a hint to the output implementation for how many bins to create.


## FieldStats

`FieldStats` are primarily used to list a categorical field's domain.
For example, VAIL can take a statement like "focus on Washington and California" and figure out which field(s) the user wants by checking the domains of each field to see if those values are present.
