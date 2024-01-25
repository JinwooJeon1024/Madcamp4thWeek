import React from 'react';
import './styles/Bubble.css';
import PdfViewer from './components/PDFViewer/PDFViewer';

const App: React.FC = () => {

  return (
    <div>
      <h1>Web Speech API</h1>
      <PdfViewer />
    </div>
  );
};

export default App;
