# AWS WebSocket Lambda 서버리스

WebSocket API와 Lambda를 사용하여 Amazon Bedrock의 스트리밍 응답을 처리하는 서버리스 애플리케이션 예시입니다. 

이 프로젝트는 Bedrock 요청에 대한 스트리밍 응답을 받고 실시간으로 클라이언트에 전달하는 방법을 보여줍니다.

## 프로젝트 구조

```
aws-bedrock-streaming-response-example/
│
├── backend/
│   ├── websocket-lambda-stack.yaml
│   ├── lambda_function.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   └── script.js
│
└── README.md
```

## 사전 요구 사항

- AWS CLI 설치 및 구성 완료
- Lambda 함수 코드를 저장할 S3 버킷
- Python 3.12 설치 (로컬 개발용)

## 배포 지침

1. 이 리포지토리를 클론합니다:
   ```
   git clone https://github.com/NB3025/aws-bedrock-streaming-response-example.git
   cd aws-bedrock-streaming-response-example
   ```

2. Lambda 함수를 패키징합니다:
   ```
   cd ws-lambda
   zip -r lambda-function.zip lambda_function.py requirements.txt
   ```

3. S3 버킷을 만들고 Lambda 함수를 S3 버킷에 업로드합니다:
   **your-lambda-code-bucket을 새롭게 만든 S3 버킷의 이름으로 변경하세요.**
   ```
   aws s3 mb s3://your-lambda-code-bucket/
   aws s3 cp lambda-function.zip s3://your-lambda-code-bucket/
   ```

5. CloudFormation 스택을 배포합니다:
   **your-lambda-code-bucket을 새롭게 만든 S3 버킷의 이름으로 변경하세요.**
   ```
   cd ~/aws-bedrock-streaming-response-example
   aws cloudformation create-stack \
     --stack-name my-websocket-lambda-stack \
     --template-body file://backend/WebSocketLambdaStack.yaml \
     --parameters ParameterKey=LambdaCodeBucket,ParameterValue=your-lambda-code-bucket \
     --capabilities CAPABILITY_IAM
   ```

7. 스택 생성이 완료될 때까지 기다립니다:
   ```
   aws cloudformation wait stack-create-complete --stack-name my-websocket-lambda-stack
   ```

8. WebSocket URL을 확인합니다:
   ```
   aws cloudformation describe-stacks \
     --stack-name my-websocket-lambda-stack \
     --query "Stacks.Outputs[?OutputKey=='WebSocketURI'].OutputValue" \
     --output text
   ```

## 사용 방법

WebSocket URL을 사용하여 API에 연결합니다. 이 API는 다음 라우트를 지원합니다:

- `$connect`: 새로운 WebSocket 연결 처리
- `$disconnect`: WebSocket 연결 해제 처리
- `$default`: 기타 모든 메시지 처리 (Lambda 함수에서 처리)

## 웹 프론트엔드 테스트 페이지

이 프로젝트는 WebSocket API를 테스트하기 위한 간단한 웹 프론트엔드 페이지를 포함하고 있습니다.

### 설정 및 실행 방법

1. CloudFormation 스택을 배포하고 WebSocket URL을 얻습니다.

2. `frontend/script.js` 파일을 열고 `YOUR_WEBSOCKET_URL_HERE`를 실제 WebSocket URL로 교체합니다.

3. 프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 프론트엔드 디렉토리로 이동합니다:
   ```
   cd frontend
   ```

4. 간단한 웹 서버를 실행합니다. Python을 사용한다면:
   ```
   python -m http.server 8000
   ```

5. 웹 브라우저에서 `http://localhost:8000`으로 접속합니다.

6. 웹 페이지에서 메시지를 입력하고 "전송" 버튼을 클릭하여 WebSocket을 통해 메시지를 보낼 수 있습니다.

7. 서버로부터의 응답과 연결 상태 변경 등이 페이지에 표시됩니다.

이 테스트 페이지를 통해 WebSocket API의 기능을 쉽게 확인할 수 있습니다.


## 정리

이 스택으로 생성된 모든 리소스를 삭제하려면:

```
aws cloudformation delete-stack --stack-name my-websocket-lambda-stack
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
