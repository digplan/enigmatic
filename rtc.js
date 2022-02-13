let conn = new RTCPeerConnection()
let conn2 = new RTCPeerConnection()
let dc = conn.createDataChannel('name')
dc.onmessage = console.log.bind(console)
dc.onopen = console.log.bind(console)

let offer = await conn.createOffer()

function answer(description) {
    conn2.setLocalDescription(description, () => {
        conn1.setRemoteDescription(description, () => {
            var port1 = Date.now();
            var port2 = port1 + 1;
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
