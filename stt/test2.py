import pyaudio
pa = pyaudio.PyAudio()
# 사용 가능한 오디오 장치 목록 출력
for index in range(pa.get_device_count()):
    info = pa.get_device_info_by_index(index)
    print(info['index'], info['name'])
device_index=8
try:
    stream = pa.open(format=pyaudio.paInt16, channels=1, rate=48000, input=True, input_device_index= device_index)
    # 오디오 스트리밍 처리...
except IOError as e:
    print("오류 발생:", e)
print(pa.get_default_input_device_info)
print(pa.get_default_output_device_info)
pyaudio.pa.__file__