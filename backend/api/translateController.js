const axios = require('axios');

const CLIENT_ID = 'DidTGufkkkqrgowjuNcV'; 
const CLIENT_SECRET = 'EQVY8L8XJd'; 

exports.translate = async (req, res) => {
  try {
    const response = await axios.post('https://openapi.naver.com/v1/papago/n2mt', {
      source: 'en',
      target: 'ko',
      text: req.body.text
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      }
    });

    console.log(response.data.message.result.translatedText);
    res.json({ translatedText: response.data.message.result.translatedText });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error occurred while translating');
  }
};
