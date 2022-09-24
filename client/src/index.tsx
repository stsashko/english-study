import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import SiteProvider from "./providers/SiteProvider";
import AuthProvider from "./providers/AuthProvider";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <SiteProvider>
                  <App />
              </SiteProvider>
          </AuthProvider>
      </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
