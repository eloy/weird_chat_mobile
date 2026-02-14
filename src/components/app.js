import React, {useEffect} from 'react';
import type {Node} from 'react';
import "../css/global.css"

import {Router} from './navigator';

const App: () => Node = () => {
  return (
    <Router />
  );
};
export default App;
