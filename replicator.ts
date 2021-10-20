class NODE {
    IP_ADDRESS: string
    PUBLIC: string
    HEAD: string
    UPTIME: string
}

class REPLICATOR {
    me: NODE
    private: string
    peers: NODE[] = []

    constructor (arr: string[]) {

        setTimeout(() => this.me.UPTIME = new Date().toISOString())
    }

    sendTx (tx: string) {

    }

    sendNewNodeAlert () {

    }

    fetch (fromTx: string) {

    }

    acceptConnection () {

    }
}

/*
  connects to list of nodes provided
  retrieves head from all including unspecified peers
  sends tx - if majority respond ok, commit
  accept connections and send new node alert
*/