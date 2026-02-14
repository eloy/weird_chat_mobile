import {AppRegistry} from 'react-native';
import App from './src/components/app';
import boot from './src/boot';
import {name as appName} from './app.json';



function initialize() {
  console.log("Initializing app", appName);
  boot();
  return App;
}

AppRegistry.registerComponent(appName, initialize);
