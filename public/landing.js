var socket = io('/');

var form = document.getElementById('text-and-button');
var input = document.getElementById('message-input');
const roomContainer = document.getElementById('room-container')
var scrollMessageCont = document.getElementById("scroll-messages");
var messageReceived = document.getElementById("audio");
var callConnected = document.getElementById("connect");

if (input != null) {
    const name = prompt('What is your name?')
    appendMessage('You joined')
    socket.emit('new-user', roomName, name)


    //sent message
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('send-chat-message', roomName, input.value);
            var allMessages = document.getElementById("scroll-messages");
            var myMessage = document.createElement('div');
            myMessage.id = "message-color";
            myMessage.style.background = "rgb(106, 165, 216)";
            myMessage.textContent = `Sent: ${input.value}`;
            allMessages.appendChild(myMessage);
            input.value = '';
        }
    })
};

socket.on('room-created', room => {
    const roomElement = document.createElement('div')
    roomElement.innerText = room
    const roomLink = document.createElement('a')
    roomLink.href = `/${room}`
    roomLink.innerText = 'join'
    roomContainer.append(roomElement)
    roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
    // appendMessage(`${data.name}: ${data.message}`)
    var allMessages = document.getElementById("scroll-messages");
    var myMessage = document.createElement('div');
    myMessage.id = "message-color";

    myMessage.style.background = "rgb(1, 224, 157)";
    myMessage.style.setProperty('--borderBeforeCol', 'rgb(1, 224, 157)');
    myMessage.style.setProperty('--messageTail', '0');
    myMessage.style.setProperty('--otherTail', '100%');
    myMessage.style.setProperty('--borderRightBef', 'none');
    myMessage.style.setProperty('--borderLeftBef', '26px');

    myMessage.textContent = `${data.name}: ${data.message}`;
    allMessages.appendChild(myMessage);
    playSound(messageReceived);

})

socket.on('user-connected', name => {
    appendMessage(`${name} connected`)
})

socket.on('user-disconnected', name => {
    appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageElement.style.color = 'grey';
    scrollMessageCont.append(messageElement)

}

function playSound(sound) {
    sound.play();
}