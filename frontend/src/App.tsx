import React, { useState } from 'react';
import UseSpeechToText from './components/UseSpeechtoText';
import './styles/Bubble.css';
import Draggable from 'react-draggable';

const App: React.FC = () => {
  const { transcript, listening, toggleListening } = UseSpeechToText();
  const [modifiedLines, setModifiedLines] = useState<string[]>([]);

  const modifyTranscript = () => {
    const modified = addNewlineAtWordEnd(transcript);
    setModifiedLines(modified.split('\n')); // 줄바꿈을 기준으로 배열 생성
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
            <div className="bubble">
              {line}
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
};

function addNewlineAtWordEnd(input: string): string {
  const words = input.split(' '); // 입력 문자열을 공백을 기준으로 나눕니다.
  const resultArray: string[] = [];

  for (const word of words) {
    if (word.endsWith("니다") || word.endsWith("냐") || word.endsWith("요") || word.endsWith("죠")) {
      // 단어의 끝 음절이 "다", "냐", "요", 또는 "죠"인 경우
      const modifiedWord = word + '\n'; // 단어 뒤에 줄바꿈 문자를 추가합니다.
      resultArray.push(modifiedWord);
    } else {
      resultArray.push(word); // 해당 음절로 끝나지 않는 경우 단어를 그대로 추가합니다.
    }
  }

  const result = resultArray.join(' '); // 수정된 단어들을 다시 공백으로 연결하여 문자열을 생성합니다.
  return result;
}

export default App;
