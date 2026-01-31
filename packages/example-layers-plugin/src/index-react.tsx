import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './main';
import '@bubblydoo/uxp-polyfills';
import './bolt-uxp-ws-listener';

import './app.css';

// console.clear(); // Clear logs on each reload

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
