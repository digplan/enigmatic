import {createServer, Socket} from 'net'

class TCP_SERVER {

    server

    constructor () { }

    listen (port = 8080) {
        let server = createServer (port)
        server.maxConnections = 10
        server.on('close', this.serverClose)
        server.on('connection', this.serverConnected)
        server.listen (port)
    }

    onClosed () {
        console.log ('Server closed')
    }

    onConnected (socket) {
        socket.on('data', this.serverData)
        socket.on('error', this.serverSocketError)
        socket.on('timeout', this.serverTimeout)
        socket.on('end', this.serverEnd)
        socket.on('close', this.serverClose)

        socket.setTimeout (40000, () => {
            console.log ('socket timed out')
        })
        console.log('Buffer size : ' + socket.bufferSize);
        console.log('---------server details -----------------');
        var address = this.server.address();
        var port = address.port;
        var family = address.family;
        var ipaddr = address.address;
        console.log('Server is listening at port' + port);
        console.log('Server ip :' + ipaddr);
        console.log('Server is IP4/IP6 : ' + family);
      
        var lport = socket.localPort;
        var laddr = socket.localAddress;
        console.log('Server is listening at LOCAL port' + lport);
        console.log('Server LOCAL ip :' + laddr);
        console.log('------------remote client info --------------');
        var rport = socket.remotePort;
        var raddr = socket.remoteAddress;
        var rfamily = socket.remoteFamily;
        console.log('REMOTE Socket is listening at port' + rport);
        console.log('REMOTE Socket ip :' + raddr);
        console.log('REMOTE Socket is IP4/IP6 : ' + rfamily);
        console.log('--------------------------------------------')
    }

    onData () {
        var bread = socket.bytesRead;
        var bwrite = socket.bytesWritten;
        console.log('Bytes read : ' + bread);
        console.log('Bytes written : ' + bwrite);
        console.log('Data sent to server : ' + data);
      
        //echo data
        var is_kernel_buffer_full = socket.write('Data ::' + data);
        if(is_kernel_buffer_full){
          console.log('Data was flushed successfully from kernel buffer i.e written successfully!');
        }else{
          socket.pause();
        }
    }

    onError (error) {
        console.log(`Error: ${error}`)
    }

    onSocketTimeout (){
        console.log('Socket timed out !');
        socket.end('Timed out!');       
    }

    onSocketEnd (data) {
        console.log('Socket ended from other end!');
        console.log('End data : ' + data);       
    }

    onSocketClosed (error) {
        var bread = socket.bytesRead;
        var bwrite = socket.bytesWritten;
        console.log('Bytes read : ' + bread);
        console.log('Bytes written : ' + bwrite);
        console.log('Socket closed!');
        if(error){
          console.log('Socket was closed coz of transmission error');
        }       
    }

    isServerListening () {
        return this.server.listening
    }

}

class TCP_CLIENT {

    client

    connect (port = 8080) {
        this.client = new Socket()
        this.client.connect({port})
        this.client.setEncoding('utf8')
    }

    clientConnect () {
        console.log('Client: connection established with server');
        console.log('---------client details -----------------');
        var address = client.address();
        var port = address.port;
        var family = address.family;
        var ipaddr = address.address;
        console.log('Client is listening at port' + port);
        console.log('Client ip :' + ipaddr);
        console.log('Client is IP4/IP6 : ' + family);       
    }

    clientSend (s) {
        this.client.write(s)
    }

    clientData (s) {
        console.log('Data from server:' + data)
    }

    clientEnd () {
        this.client.end()
    }

}

exports.TCP_CLIENT = TCP_CLIENT
exports.TCP_SERVER = TCP_SERVER

/*****************
       Tests  
******************/

if (process.argv[1].match('tcp.mjs'))
    tests()

tests = () => {
    import * from './tcp.mjs'
    const server = new TCP_SERVER()
    server.listen (8080)
}
