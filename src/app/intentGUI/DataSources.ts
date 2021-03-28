/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { DataSemantics } from '../../api/dataSemantics/DataSemantics';
import { covidDatasource, covidData } from '../../examples/Covid19Data';
import { gapminderDatasource, gapminderData } from '../../examples/GapminderData';
import { titanicDatasource, titanicData } from '../../examples/TitanicData';
import { wineDatasource, wineData } from '../../examples/WineData';

/** list of available data sources that can be used for an intent specification */
export const dataSources: DataSources = {
  gapminder: { info: gapminderDatasource, data: gapminderData },
  wine: { info: wineDatasource, data: wineData },
  covid: { info: covidDatasource, data: covidData },
  titanic: { info: titanicDatasource, data: titanicData },
};

export interface DataSource {
  /** metadata about the fields in this data source */
  readonly info: DataSemantics;
  /** rows in the data source */
  readonly data: object[];
}

export interface DataSources {
  [name: string]: DataSource;
}
