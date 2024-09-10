let socket;
let currentStreamingMessage = '';

function connect() {
    const wsUrl = 'YOUR_WEBSOCKET_URL_HERE';
    console.log('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = function(e) {
        console.log('WebSocket connection opened:', e);
        addMessage("서버에 연결되었습니다.");
    };

    socket.onmessage = function(event) {
        console.log('Received message:', event.data);
        try {
            const data = JSON.parse(event.data);
            console.log('Parsed JSON data:', data);
            if (data.type === 'content_block_delta' && data.delta && data.delta.type === 'text_delta') {
                currentStreamingMessage += data.delta.text;
                updateStreamingOutput();
            } else {
                console.log('Unexpected JSON structure:', data);
            }
        } catch (error) {
            console.log('Failed to parse JSON, treating as text:', error);
            currentStreamingMessage += event.data;
            updateStreamingOutput();
        }
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed:', event);
        if (event.wasClean) {
            addMessage(`연결이 정상적으로 종료되었습니다, 코드=${event.code} 이유=${event.reason}`);
        } else {
            addMessage('연결이 종료되었습니다');
        }
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
        addMessage(`에러: ${error.message}`);
    };
}
function addMessage(message, isUser = false) {
    console.log('Adding message to output:', message);
    const output = document.getElementById('output');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    output.appendChild(messageElement);
    output.scrollTop = output.scrollHeight;
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    if (message.trim() === '') return;  // 빈 메시지 방지
    
    const formattedMessage = JSON.stringify({ "client": message });
    console.log('Sending message:', formattedMessage);
    socket.send(formattedMessage);
    addMessage(`나: ${message}`, true);
    messageInput.value = '';
    
    // 새 메시지를 보낼 때 이전 스트리밍 메시지 초기화
    currentStreamingMessage = '';
    document.getElementById('streamingOutput').innerHTML = '';
}

function updateStreamingOutput() {
    console.log('Updating streaming output:', currentStreamingMessage);
    const streamingOutput = document.getElementById('streamingOutput');
    streamingOutput.innerHTML = `<div class="message ai-message">AI: ${currentStreamingMessage}</div>`;
    streamingOutput.scrollTop = streamingOutput.scrollHeight;
}

connect();