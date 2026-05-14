import {Appearance, Dimensions} from 'react-native';
import Stadox from './stadox';
import {setupComponentStyles} from './rnsuite_styles';
import {initTranslations} from './translations';
import ApplicationConfig from './application_config';
import LocalSettings from './local_settings';
const DEFAULT_STATE = {};

export default async function() {
   let started_at = new Date();

  // Init states
  Stadox.init(DEFAULT_STATE);

  // Init locale
  await initTranslations();

  // Setup components
  setupComponentStyles();

  // Add listener for dark mode switch
  Appearance.addChangeListener(preferences => {
    Stadox.set('color_scheme', preferences.colorScheme);
  });

  // Move local settings to stadox
  let {confirmation_code_request_at, user_id, api_token} = await LocalSettings.getAll(['confirmation_code_request_at', 'user_id', 'api_token']);
  Stadox.set('user_id', user_id);
  Stadox.set('api_token', api_token);
  Stadox.set('confirmation_code_request_at', +confirmation_code_request_at);

  // Get window dimensions
  Stadox.set('dimensions', getWindowDimensions())

  let {boot_delay} = ApplicationConfig.get();
  let delay = boot_delay - (new Date().getTime() - started_at.getTime());
  if (delay < 0) {
    Stadox.set('initialized', true);
  } else {
    setTimeout(e => Stadox.set('initialized', true), delay);
  }
}




function getWindowDimensions() {
  let dimensions = Dimensions.get('window');
  let width = Math.min(dimensions.width, dimensions.height);
  let height = Math.max(dimensions.width, dimensions.height);
  return {width, height};
}
