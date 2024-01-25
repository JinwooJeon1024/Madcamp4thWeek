import spacy

# spaCy 모델 로드 (영어 모델 사용)
nlp = spacy.load("en_core_web_sm")

text = "This is a paragraph without any punctuation It contains multiple sentences without proper endings But it can still be split into sentences."

# spaCy를 사용하여 문장 분리
doc = nlp(text)

# 분리된 문장 출력
for sentence in doc.sents:
    print(sentence.text)
