import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppMain from "./AppMain";
import LogInPage from "./pages/login/login"; 
import SignUpPage from './pages/signup/signup';
import VerifyAccount from './pages/verifyAccount';
// import LandingPage from './pages/landingpage/landingPage';
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import Alerter from "./components/alerter";
import { statusMessageActions } from './state';
 
function App() {

  const { statusMessage } = useSelector(state => state);
  const dispatch = useDispatch();
  const{ setStatusMessage } = bindActionCreators(statusMessageActions, dispatch);
  
  useEffect(() => {
    if(statusMessage?.type) {
      setTimeout(() => {
        setStatusMessage({});
      }, 3000);
    }
  }, [JSON.stringify(statusMessage)])

  
  return (
    <BrowserRouter>
      <div className='app'>
        <Alerter data={statusMessage} />
        <Routes>
          {/* <Route path="/" element={<LandingPage />} /> */}
          <Route path="/login" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-account/:token" element={<VerifyAccount />} />
          <Route path="/app/*" element={<AppMain />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
