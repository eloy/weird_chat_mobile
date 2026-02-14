
import AsyncStorage from '@react-native-async-storage/async-storage';
export default class LocalSetting  {
  static set(key, value) {
    return AsyncStorage.setItem(key, ""+value);
  }

  static get(key) {
    return AsyncStorage.getItem(key);
  }

  static getAll(keys) {
    return AsyncStorage.multiGet(keys);
  }
}
