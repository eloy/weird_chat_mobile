import DevAppConfig from '../app_dev.json';
import ProdAppConfig from '../app_prod.json';

export default {
  get() {
    if (process.env.NODE_ENV === 'production') {
      return ProdAppConfig;
    } else {
      return DevAppConfig;
    }
  }
}
