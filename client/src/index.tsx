import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import SiteProvider from "./providers/SiteProvider";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <SiteProvider>
              <App />
          </SiteProvider>
      </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
