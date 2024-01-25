import React, { useState } from 'react';
import UseSpeechToText from './components/UseSpeechtoText';
import './styles/Bubble.css';
import "./App.css";

import PdfViewer from './components/PDFViewer/PDFViewer';

const App: React.FC = () => {
  const [language, setLanguage] = useState<string>('en-US');
  const { transcript, listening, toggleListening } = UseSpeechToText(language);
  const [modifiedLines, setModifiedLines] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const modifyTranscript = () => {
    const modified = addNewlineAtWordEnd(transcript);
    setModifiedLines(modified.split('\n'));
  };

  const startEditing = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const stopEditing = () => {
    const updatedLines = modifiedLines.map((line, index) =>
      index === editingIndex ? editingText : line
    );
    setModifiedLines(updatedLines);
    setEditingIndex(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

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

function addNewlineAtWordEnd(input: string): string {
  const words = input.split(' ');
  const resultArray: string[] = [];

  for (const word of words) {
    if (word.endsWith("니다") || word.endsWith("냐") || word.endsWith("요") || word.endsWith("죠")) {
      const modifiedWord = word + '\n';
      resultArray.push(modifiedWord);
    } else {
      resultArray.push(word);
    }
  }

  const result = resultArray.join(' ');
  return result;
}