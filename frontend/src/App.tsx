import React, { useEffect, useState } from 'react';
import UseSpeechToText from './components/UseSpeechtoText';
import './styles/Bubble.css';
import Draggable from 'react-draggable';
import PdfViewer from './components/PDFViewer';

const App: React.FC = () => {
  const { transcript, listening, toggleListening } = UseSpeechToText();
  const [modifiedLines, setModifiedLines] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [lastIndex, setLastIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("korean"); // Default option is Korean

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

  useEffect(() => {
    if (listening) {
      const newTranscript = transcript.slice(lastIndex);
      const sentences = newTranscript.split(/(?<=니다|냐|요|죠)\s/);
      if (sentences.length > 1) {
        setModifiedLines(prev => [...prev, ...sentences.slice(0, -1)]);
        setLastIndex(transcript.length - sentences[sentences.length - 1].length);
      }
    }
  }, [transcript, listening]);

  // Function to handle radio button selection
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div>
      <h1>Web Speech API</h1>
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
        <label>
          <input
            type="radio"
            value="translation"
            checked={selectedOption === "translation"}
            onChange={handleOptionChange}
          />
          English to Korean
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
            </div>
          </Draggable>
        ))}
      </div>
      <PdfViewer></PdfViewer>
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
