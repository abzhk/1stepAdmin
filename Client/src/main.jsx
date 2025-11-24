import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom';
import {GoogleOAuthProvider} from '@react-oauth/google';
import "./index.css";
import { Provider } from 'react-redux';
import store from './redux/store.js'

const CLIENT_ID = "520033051080-9ir497kbivhpgfvlm3j14nacej08do1j.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}> 
      <BrowserRouter> 
  <GoogleOAuthProvider clientId={CLIENT_ID}>
       <App />
       </GoogleOAuthProvider>
       </BrowserRouter>
        </Provider>
  </StrictMode>,
)
