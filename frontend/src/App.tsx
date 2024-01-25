<<<<<<< HEAD
import React, { useState } from 'react';
import './styles/Bubble.css';
import PdfViewer from './components/PDFViewer/PDFViewer';

const App: React.FC = () => {
=======
import React, { useEffect, useState } from 'react';
import UseSpeechToText from './components/UseSpeechtoText';
import './styles/Bubble.css';
import Draggable from 'react-draggable';
import PdfViewer from './components/PDFViewer';
import { addNewlineForEnglish, addNewlineForKorean, translateText } from './utils/textUtils';

const App: React.FC = () => {
  const [modifiedLines, setModifiedLines] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [lastIndex, setLastIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("korean"); // Default option is Korean
  const { transcript, listening, toggleListening } = UseSpeechToText(selectedOption);

  const addNewline = async (input: string): Promise<string> => {
    if (selectedOption === 'korean') {
      return addNewlineForKorean(input);
    } else if (selectedOption === 'english') {
      return addNewlineForEnglish(input);
    }
    return input; // Handle other cases as needed
  };

  const modifyTranscript = async () => {
    const modified = addNewline(transcript);
    setModifiedLines((await modified).split('\n'));
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

  useEffect(() => {
    if (listening) {
      const newTranscript = transcript.slice(lastIndex);
      let sentences: string[] = [];

      if (selectedOption === 'english') {
        sentences = newTranscript.split(/(?<=[ ])\s+/);
      } else {
        sentences = newTranscript.split(/(?<=니다|냐|요|죠)\s/);
      }

      if (sentences.length > 1) {
        setModifiedLines(prev => [...prev, ...sentences.slice(0, -1)]);
        setLastIndex(transcript.length - sentences[sentences.length - 1].length);
      }
    }
  }, [transcript, listening, selectedOption]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleTranslateClick = async (index: number) => {
    const lineToTranslate = modifiedLines[index];
    const translatedLine = await translateText(lineToTranslate);
    const updatedLines = modifiedLines.map((line, idx) => idx === index ? translatedLine : line);
    setModifiedLines(updatedLines);
  }
>>>>>>> 33490e90bc4562744515ff5e5302dde978195955

  return (
    <div>
      <h1>Web Speech API</h1>
<<<<<<< HEAD
      <PdfViewer />
=======
      <div>
        <label>
          <input
            type="radio"
            value="english"
            checked={selectedOption === "english"}
            onChange={handleOptionChange}
          />
          English
        </label>
        <label>
          <input
            type="radio"
            value="korean"
            checked={selectedOption === "korean"}
            onChange={handleOptionChange}
          />
          한국어
        </label>
      </div>
      <textarea className="transcript" value={transcript} onChange={() => { }} />
      <button onClick={() => { toggleListening(); modifyTranscript(); }}>
        {listening ? '음성인식 중지' : '음성인식 시작'}
      </button>
      <div className="bubble-container">
        {modifiedLines.map((line, index) => (
          <Draggable key={index}>
            <div className="bubble" onDoubleClick={() => startEditing(index, line)}>
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={handleTextChange}
                  onBlur={stopEditing}
                  autoFocus
                />
              ) : (
                <span>{line}</span>
              )}
              <button onClick={() => handleTranslateClick(index)}>번역</button>
            </div>
          </Draggable>
        ))}
      </div>
      <PdfViewer></PdfViewer>
>>>>>>> 33490e90bc4562744515ff5e5302dde978195955
    </div>
  );
};

export default App;
