# Noted

![스크린샷 2024-01-25 203412](https://github.com/JinwooJeon1024/Madcamp4thWeek/assets/104386015/9a9c12f5-2200-44e3-97a0-11dcce9768a6)




## 프로젝트 소개
**대학생에게 필요한 모든 기능을 담은 노트필기 웹앱**

## 개발 기간
* 24.1.18일 - 24.01.25일

### 맴버구성
 - 이수민 (카이스트 전산학부 21학번)
 - 전진우 (카이스트 전산학부 21학번)

### 개발 환경
- **Front-end** : React, Typescript
- **Back-end** : Node.js, Express
- **OS** : Cross Platform
- **IDE** : Visual Studio Code

## 주요 기능
#### 음성 인식
<p align="center">
 <img width="40%" alt="edit에서 위젯 추가" src="https://github.com/JinwooJeon1024/Madcamp3rdWeek/assets/76899099/64806633-7a09-45dd-a1a7-2d59b0e66a04" style="margin-right:30px">
 <img width="40%" alt="편집 저장" src="https://github.com/JinwooJeon1024/Madcamp3rdWeek/assets/76899099/0f00810e-dd14-4885-9692-302c6d76347d">
</p>
<p align="center">
 <img width="40%" alt="위젯 이동" src="https://github.com/JinwooJeon1024/Madcamp3rdWeek/assets/76899099/26b5514b-478b-44a2-8e58-192c64adf79d" style="margin-right:30px">
 <img width="40%" alt="edit 메뉴바 이동 " src="https://github.com/JinwooJeon1024/Madcamp3rdWeek/assets/76899099/fdf5204c-d35f-4b22-b70d-62b9cfe5855d">
</p>

# Major Features

- **음성 인식 및 텍스트 변환**: Noted 웹애플리케이션은 강의나 회의 중 발화된 내용을 실시간으로 텍스트로 변환하는 음성 인식 기능을 제공합니다. 이 기능은 사용자가 강의 내용을 쉽게 기록하고, 필요한 정보를 빠르게 검색할 수 있도록 도와줍니다. 또한 만들어진 텍스트는 사용자가 원하는 내용으로 수정할 수 있습니다.

- **번역**: 영어 강의에 있어서 어려운 용어나 문장이 있다면 번역 기능을 이용해 한국어로 바꿀 수 있습니다.

- **PDF 변환**: 사용자는 텍스트로 변환된 내용과 밑줄 및 사각형을 포함한 렉쳐 노트를 PDF 파일로 저장할 수 있습니다.


## 기술 설명

- **React 및 Canvas 사용**: 이 애플리케이션은 React를 기반으로 구축되었으며, HTML5 Canvas를 사용하여 사용자가 직접 그림을 그릴 수 있는 기능을 제공합니다. 사용자는 직관적인 인터페이스를 통해 라인, 사각형 등 다양한 도형을 그리고 편집할 수 있습니다.

- **RoughJS 및 HTML2Canvas 라이브러리 활용**: RoughJS 라이브러리를 사용하여 자연스러운 스케치 스타일의 도형을 생성합니다. 또한, HTML2Canvas 라이브러리를 통해 Canvas에 그려진 내용을 이미지로 변환하여 PDF 파일로 저장할 수 있습니다.

- **PDF.js 활용**: PDF.js 라이브러리를 통해 사용자가 PDF 파일을 업로드하고, 페이지 별로 내용을 볼 수 있도록 지원합니다. 이를 통해 사용자는 PDF 문서에 직접 주석을 추가하거나 내용을 편집할 수 있습니다.

- **음성 인식 통합 및 번역**: 사용자는 음성 인식 기능을 활용하여 강의나 회의 내용을 자동으로 텍스트로 변환할 수 있습니다. 이 기능은 영어와 한국어를 지원하며, 사용자는 언어 설정을 통해 원하는 언어로 음성 인식을 사용할 수 있습니다. 또한, 네이버 파파고 API를 이용해서 영어로 되어있는 문장을 즉시 번역해줍니다.
 
