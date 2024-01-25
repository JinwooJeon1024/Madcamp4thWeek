import React, { useState } from 'react';
import './styles/Bubble.css';
import Draggable from 'react-draggable';
import "./App.css";
import PdfViewer from './components/PDFViewer/PDFViewer';

const App: React.FC = () => {

  return (

    <div className='main-page'>
        <div className='overlap-group'>
          <textarea className="rectangle1" value={transcript} onChange={() => { }} />
          <div onClick={() => { toggleListening(); modifyTranscript(); }}>
            <span>{listening 
            ? <img className="zondicons-mic" src={process.env.PUBLIC_URL+"/mic-on.png"}  />
            : <img className="zondicons-mic" src={process.env.PUBLIC_URL+"/mic-off.png"}  />
            }
            </span>
          </div>
          <div className="div1">
            <PdfViewer />
          </div>
        </div>
    </div>
  );
};

export default App;
