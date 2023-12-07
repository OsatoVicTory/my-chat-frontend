import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { statusActions } from './state';
import './App.css';
import CallsPage from './pages/Call';
 
function App() {
  const dispatch = useDispatch();
  const { setStatusData } = bindActionCreators(statusActions, dispatch);
  const socket = {
    on:() => null, emit:() => null, disconnect: () => null
  };
  const closePage = () => null;
  const data = {
    type: 'audio', callerId:'123', 
    receiverId: '456', receiverName: 'Tory', 
    image: '', signal: '', callerName: 'Osato' 
  }; 

  return (
    <div className='App'>
      <CallsPage data={data} socket={socket} closePage={closePage} />
    </div>
  )
};

export default App;