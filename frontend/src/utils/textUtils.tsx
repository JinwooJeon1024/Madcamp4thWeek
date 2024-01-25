import axios from 'axios';

// translateText 함수: 백엔드 서버를 통해 번역 요청을 보내는 함수
export const translateText = async (text: string): Promise<string> => {
  try {
    const response = await axios.post('http://localhost:5000/translate', { text });
    return response.data.translatedText;
  } catch (error) {
    console.error('Error during translation request:', error);
    return '';
  }
};

export function addNewlineForEnglish(input: string): string {
  const words = input.split(' '); 
  const wordCountThreshold = 10;
  let resultSentence = '';
  let currentSentence = '';

  for (const word of words) {
    currentSentence += word + ' '; 

    if (currentSentence.split(' ').length >= wordCountThreshold) {
      resultSentence += currentSentence.trim() + '\n';
      currentSentence = '';
    }
  }

  return resultSentence.trim();
}


export function addNewlineForKorean(input: string): string {
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