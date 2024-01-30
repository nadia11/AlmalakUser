/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { LogBox } from 'react-native';
LogBox.ignoreAllLogs(true);
LogBox.ignoreLogs([ 'Remote debugger', 'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?' ]);

AppRegistry.registerComponent(appName, () => App);
