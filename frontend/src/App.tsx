// // src/App.tsx
// import React from 'react';
// import PdfViewer from './components/PDFViewer';
// import NoteEditor from './components/NoteEditor';
// import ExportButton from './components/ExportButton';

// const App: React.FC = () => {
//   const handleExport = () => {
//     alert('Exporting to PDF...');
//   };

//   return (
//     <div>
//       <PdfViewer pdfUrl="your-pdf-url.pdf" />
//       <NoteEditor />
//       <ExportButton onClick={handleExport} />
//     </div>
//   );
// };

// export default App;

import React from 'react';
import UseSpeechToText from './components/UseSpeechtoText';

const App: React.FC = () => {
  const { transcript, listening, toggleListening } = UseSpeechToText();

  return (
    <div>
      <h1>Web Speech API</h1>
      <textarea className="transcript" value={transcript} onChange={() => {}} />
      <button onClick={toggleListening}>
        {listening ? '음성인식 중지' : '음성인식 시작'}
      </button>
    </div>
  );
};

export default App;
