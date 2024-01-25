import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface SpeechToTextHook {
  transcript: string;
  listening: boolean;
  toggleListening: () => void;
}

const useSpeechToText = (language: string): SpeechToTextHook => {
  const { transcript, listening } = useSpeechRecognition();

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ language: language, continuous: true });
    }
  };

  return { transcript, listening, toggleListening };
};

export default useSpeechToText;
