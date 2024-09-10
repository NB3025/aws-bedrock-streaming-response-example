let socket;

function connect() {
    // WebSocket URL을 여기에 입력하세요
    const wsUrl = 'YOUR_WEBSOCKET_URL_HERE';
    socket = new WebSocket(wsUrl);

    socket.onopen = function(e) {
        addMessage("서버에 연결되었습니다.");
    };

    socket.onmessage = function(event) {
        addMessage(`서버로부터 메시지: ${event.data}`);
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            addMessage(`연결이 정상적으로 종료되었습니다, 코드=${event.code} 이유=${event.reason}`);
        } else {
            addMessage('연결이 종료되었습니다');
        }
    };

    socket.onerror = function(error) {
        addMessage(`에러: ${error.message}`);
    };
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    socket.send(message);
    addMessage(`보낸 메시지: ${message}`);
    messageInput.value = '';
}

function addMessage(message) {
    const output = document.getElementById('output');
    const p = document.createElement('p');
    p.textContent = message;
    output.appendChild(p);
}

connect();