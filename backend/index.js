const express = require('express');
const cors = require('cors');
const Routes = require('./api/routes'); // 사용자 정의 라우트
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(cors());

// body-parser 대신 express의 내장 미들웨어 사용
app.use(express.json()); // JSON 데이터를 파싱하기 위함
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 데이터 파싱을 위함

// 라우트 설정
app.use('/', Routes);

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
