import React, { useState } from 'react';
import UseSpeechToText from './components/UseSpeechtoText';
import './styles/Bubble.css';
import Draggable from 'react-draggable';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PdfViewer from './components/PDFViewer/PDFViewer';

const App: React.FC = () => {
  const { transcript, listening, toggleListening } = UseSpeechToText();
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
    <div>
      <h1>Web Speech API</h1>
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
            </div>
          </Draggable>
        ))}
      </div>
      <DndProvider backend={HTML5Backend}>
        <PdfViewer />
      </DndProvider>
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