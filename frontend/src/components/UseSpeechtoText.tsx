import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface SpeechToTextHook {
  transcript: string;
  listening: boolean;
  toggleListening: () => void;
}

const useSpeechToText = (selectedOption: string): SpeechToTextHook => {
  const { transcript, listening } = useSpeechRecognition();

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      let language = 'en-US';
      if(selectedOption === 'korean') {
        language = 'ko-KR';
      }
      SpeechRecognition.startListening({ language, continuous: true });
    }
  };

  return { transcript, listening, toggleListening };
};

export default useSpeechToText;
