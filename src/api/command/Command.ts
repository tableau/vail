/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * For full license text, see the LICENSE file in the repo root
 */

import { EditCommands } from './EditCommands';
import { ManagerCommands } from './ManagerCommands';

export type VailCommands = VailCommand[];
export type VailCommand = ManagerCommands | EditCommands;
