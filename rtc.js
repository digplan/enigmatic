let conn = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
})
let conn2 = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
})
let dc = conn.createDataChannel('name')
dc.onmessage = console.log.bind(console)
dc.onopen = function () {
    console.log('open')
    dc.send('okay')
}

let offer = await conn.createOffer()

function answer(description) {
    conn2.setLocalDescription(description, () => {
        conn1.setRemoteDescription(description, () => {
            var port1 = Date.now();
            var port2 = port1 + 1;
            console.log(port1, port2)
            conn1.connectDataConnection(port1, port2);
            conn2.connectDataConnection(port2, port1);
        });
    });
}

conn.setLocalDescription(offer, function () {
    conn2.setRemoteDescription(offer, () => {
        conn2.createAnswer(answer);
    });
})
