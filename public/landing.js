
var socket = io('/');
// const videoGrid = document.getElementById('video-call-div');
// const myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001'
// })


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

// video functionality

// display local vid

function getLocalVideo(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    var constraints = {
        audio: true,
        video: true
    }
    navigator.getUserMedia(constraints, callbacks.success, callbacks.error)
}

function receiveStream(stream, elementId) {
    var video = document.getElementById(elementId);
    video.srcObject = stream;
    //global reference to stream so can access outside
    window.peer_stream = stream
}

getLocalVideo({
    success: function (stream) {
        window.local_stream = stream,
            receiveStream(stream, 'local-video');
    },
    error: function (err) {
        alert("Unable to access camera");
        console.log(err);
    }
})

var conn;
var peer_id;


// create peer conn

var peer = new Peer();
// display peer id for connecting
peer.on('open', function () {
    document.getElementById("display-own-id").innerHTML = `Your connection id is: <b> ${peer.id} </b>. Share it to start a call!`;
})

peer.on('connection', function (connection) {
    conn = connection;
    peer_id = connection.peer;

    document.getElementById('connId').value = peer_id;
})

peer.on('error', function (err) {
    alert('uh oh ' + err);
    console.log(err);
})

// onclick connection button (send relevant info to other client)
document.getElementById('conn-button').addEventListener('click', function () {
    peer_id = document.getElementById('connId').value;

    if (peer_id) {
        conn = peer.connect(peer_id);
    }
    else {
        alert('Enter an Id');
        return false;
    }
})

// call button, start call
peer.on('call', function (call) {
    var acceptCall = confirm("Answer call?");

    if (acceptCall) {
        call.answer(window.localstream);

        call.on('stream', function (stream) {
            //store stream are global variable
            window.peer_stream = stream;

            receiveStream(stream, 'remote-video');
        })
        call.on('close', function () {
            alert('Call ended');
        })
    } else {
        console.log("Call denied");
    }

})

// request to start call

document.getElementById('call-button').addEventListener('click', function () {
    console.log("calling peer " + peer_id)
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

function endCall() {
    localStream.getVideoTracks()[0].stop();
    window.location.reload();
}