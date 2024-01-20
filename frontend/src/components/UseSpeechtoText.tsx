import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface SpeechToTextHook {
  transcript: string;
  listening: boolean;
  toggleListening: () => void;
}

const useSpeechToText = (): SpeechToTextHook => {
  const { transcript, listening } = useSpeechRecognition();

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ language: 'ko-KR', continuous: true });
    }
  };

  return { transcript, listening, toggleListening };
};

export default useSpeechToText;
