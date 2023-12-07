import { useState } from 'react';
import Wave from './pages/wave';
import './App.css';

const AppMain = () => {

  const [show, setShow] = useState(false);
  return (
    <div className='app-main'>
      <span className='fnt-400' onClick={()=>setShow(!show)}>Show</span>
      {show && <Wave close={()=>setShow(false)} show={show} />}
    </div>
  )
}

export default AppMain;