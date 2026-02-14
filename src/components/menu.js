import Stadox from '../stadox';
import LocalSettings from '../local_settings';
import I18n from '../i18n'

export default [
  {label: I18n.t('menu.sign_out'), fn: closeSession }
]


function closeSession() {
    LocalSettings.set('api_token', null).then(() => Stadox.set('api_token', null))
  }
