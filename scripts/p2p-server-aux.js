// import the ws module
const WebSocket = require("ws");

// import the min approval constant which will be used to compare the count the messages
const { MIN_APPROVALS } = require("../config");
const ChainUtil = require("../chain-util");
const LocalAuthentication = require("../products/localAuthentication");
const { default: axios } = require("axios");

// decalre a p2p server port on which it would listen for messages
// we will pass the port through command line
const P2P_PORT = process.env.P2P_PORT || 5001;

// the neighbouring nodes socket addresses will be passed in command line
// this statemet splits them into an array
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

// message types used to avoid typing messages
// also used in swtich statement in message handlers
const MESSAGE_TYPE = {
  transaction: "TRANSACTION",
  prepare: "PREPARE",
  pre_prepare: "PRE-PREPARE",
  commit: "COMMIT",
  round_change: "ROUND_CHANGE",
  secret_key: 'SECRET_KEY',
  product: "PRODUCT"
};

class P2pserverAux {
  constructor(
    blockchain,
    transactionPool,
    wallet,
    blockPool,
    preparePool,
    commitPool,
    messagePool,
    validators,
    messageCount
  ) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockPool = blockPool;
    this.preparePool = preparePool;
    this.commitPool = commitPool;
    this.messagePool = messagePool;
    this.validators = validators;
    this.messageCount = messageCount;
  }

  // Creates a server on a given port
  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT });
    server.on("connection", socket => {
      console.log("new connection");
      this.connectSocket(socket);
    });
    this.connectToPeers();
    console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
  }

  // connects to a given socket and registers the message handler on it
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("Socket connected");
    this.messageHandler(socket);
  }

  // connects to the peers passed in command line
  connectToPeers() {
    peers.forEach(peer => {
      const socket = new WebSocket(peer);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  // broadcasts transactions
  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => {
      this.sendTransaction(socket, transaction); 
    });
  }

  // sends transactions to a perticular socket
  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction: transaction
      })
    );
  }

  // broadcasts preprepare
  broadcastPrePrepare(block) {
    this.sockets.forEach(socket => {
      this.sendPrePrepare(socket, block);
    });
  }

  // sends preprepare to a particular socket
  sendPrePrepare(socket, block) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.pre_prepare,
        block: block
      })
    );
  }

  // broadcast prepare
  broadcastPrepare(prepare) {
    this.sockets.forEach(socket => {
      this.sendPrepare(socket, prepare);
    });
  }

  // sends prepare to a particular socket
  sendPrepare(socket, prepare) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.prepare,
        prepare: prepare
      })
    );
  }

  // broadcasts commit
  broadcastCommit(commit) {
    this.sockets.forEach(socket => {
      this.sendCommit(socket, commit);
    });
  }

  // sends commit to a particular socket
  sendCommit(socket, commit) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.commit,
        commit: commit
      })
    );
  }

  // broacasts round change
  broadcastRoundChange(message) {
    this.sockets.forEach(socket => {
      this.sendRoundChange(socket, message);
    });
  }

  // sends round change message to a particular socket
  sendRoundChange(socket, message) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.round_change,
        message: message
      })
    );
  }

  broadcastProduct(message){
    this.sockets.forEach(socket => {
      this.sendProduct(socket,message);
    });
  }

  sendProduct(socket, message) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.product,
        message: message
      })
    );
  }

  broadcastSecretKey(S1) {
    const S2 = this.validators.nodeDetails.get(this.wallet.getPublicKey()).S2;
    const Random2 = this.validators.nodeDetails.get(this.wallet.getPublicKey()).Random2;
    //check if it is the validation leader
    if(JSON.stringify(S2) == JSON.stringify(ChainUtil.hash(S1 || Random2)))
    {
        console.log("validation leader found");
        const len = this.validators.length;
        //Now the validation leader will select the number of validators to take part in the consensus protocol
        const num = Math.floor(this.validators.calculateNumberOfValidators()*len);

        //the validation leader now selects the validators to take part in the consensus
        const validators_list = this.validators.selectValidators(num);
        this.validators.consensusNodes = this.validators.fillPublicWallets(validators_list);
    }
  }

  sendSecretKey(socket,message){
      socket.send(
          JSON.stringify({
              type: MESSAGE_TYPE.round_change,
              message: message
          })
      )
  }

  // handles any message sent to the current node
  messageHandler(socket) {
    // registers message handler
    socket.on("message", message => {
      const data = JSON.parse(message);
      // select a perticular message handler
      switch (data.type) {
        case MESSAGE_TYPE.transaction:
            this.messageCount.msgCount++;
          // check if transactions is valid
          if (
            !this.transactionPool.transactionExists(data.transaction) &&
            this.transactionPool.verifyTransaction(data.transaction) &&
            this.validators.isValidValidator(data.transaction.from)
          ) {
            let thresholdReached = this.transactionPool.addTransaction(
              data.transaction
            );
            // send transactions to other nodes
            this.broadcastTransaction(data.transaction);

            // check if limit reached
            if (thresholdReached) {
              console.log("THRESHOLD REACHED");
              // check the current node is the proposer
              if(data.transaction.input.data.recipient == undefined)
              {
                if (this.blockchain.getProposer() == this.wallet.getPublicKey()) {
                  console.log("PROPOSING BLOCK");
                  //broadcast secret key to all the other nodes
                  const S1 = this.validators.nodeDetails.get(this.blockchain.getProposer()).S1;
                  this.broadcastSecretKey(S1);
                  
                  let block = this.blockchain.createBlock(
                    this.transactionPool.transactions,
                    this.wallet
                  );
                  this.broadcastPrePrepare(block);
                }
                else{
                  return;
                }
              }
              else{
                console.log("shipping product");
                if(data.transaction.input.data.recipient == this.wallet.getPublicKey()){
                  console.log("PROPOSING BLOCK");
                  //broadcast secret key to all the other nodes
                  const S1 = this.validators.nodeDetails.get(this.blockchain.getProposer()).S1;
                  this.broadcastSecretKey(S1);
  
                  // perform local Authentication in this part
  
                  const product = data.transaction.input.data;
                  axios.get(product.qrCode.readUrl)
                    .then(response => {
                      product.qrCode.readCounter++;
                      const res = JSON.parse(response.data[0].symbol[0].data);
                      const pDetails = res.pDetails;
                      const signedPDetails = res.signedPDetails;
                      
                      // The proposer performs local Authentication
                      const localAuthentication = new LocalAuthentication({blockchain: this.blockchain, product: product, wallet: this.wallet, pDetails: pDetails, signedPDetails: signedPDetails});
                      if(!localAuthentication.authenticate()){
                        console.log("The product is a fraudulent product.");
                        this.transactionPool.clear();
                        return;
                      }

                      //It gets a green signal from the proposer and now it constructs the block and moves ahead with
                      //global authentication

                      data.transaction.input.data.pId = res.pDetails.pId;
                      data.transaction.input.data.pName = res.pDetails.pName;
                      data.transaction.input.data.price = res.pDetails.price;
                      data.transaction.input.data.pOwner = res.pDetails.pOwner;
                      data.transaction.input.data.source = res.pDetails.source;
                      data.transaction.input.data.qrCode.readCounter = product.qrCode.readCounter;
                      let block = this.blockchain.createBlock(
                        this.transactionPool.transactions,
                        this.wallet
                      );
                      this.broadcastPrePrepare(block);
                    });
                }
              }
            } else {
              console.log("Transaction Added");
            }
          }
          break;
        case MESSAGE_TYPE.pre_prepare:
          // check if block is valid
          this.messageCount.msgCount++;
          this.messageCount.prePrepareMsgCount++;
          if (
            !this.blockPool.exisitingBlock(data.block) &&
            this.blockchain.isValidBlock(data.block)
          ) {
            // add block to pool
            this.blockPool.addBlock(data.block);

            // send to other nodes
            this.broadcastPrePrepare(data.block);

            // create and broadcast a prepare message
            let prepare = this.preparePool.prepare(data.block, this.wallet);
            this.broadcastPrepare(prepare);
          }
          break;
        case MESSAGE_TYPE.prepare:
          this.messageCount.msgCount++;
          this.messageCount.prepareMsgCount++;
          // check if the prepare message is valid
          if (
            !this.preparePool.existingPrepare(data.prepare) &&
            this.preparePool.isValidPrepare(data.prepare, this.wallet) &&
            this.validators.isValidValidator(data.prepare.publicKey)
          ) {
            // add prepare message to the pool
            this.preparePool.addPrepare(data.prepare);

            // send to other nodes
            this.broadcastPrepare(data.prepare);

            // if no of prepare messages reaches minimum required
            // send commit message

            // const min_approvals = (2*this.validators.consensusNodes.length)/3 + 1;
            if (
              this.preparePool.list[data.prepare.blockHash].length >=
              MIN_APPROVALS
            ) {
              let commit = this.commitPool.commit(data.prepare, this.wallet);
              this.broadcastCommit(commit);
            }
          }
          break;
        case MESSAGE_TYPE.commit:
            this.messageCount.msgCount++;
            this.messageCount.commitMsgCount++;
          // check the validity commit messages
          if (
            !this.commitPool.existingCommit(data.commit) &&
            this.commitPool.isValidCommit(data.commit) &&
            this.validators.isValidValidator(data.commit.publicKey)
          ) {
            // add to pool
            this.commitPool.addCommit(data.commit);

            // send to other nodes
            this.broadcastCommit(data.commit);

            // if no of commit messages reaches minimum required
            // add updated block to chain
            // const min_approvals = (2*this.validators.consensusNodes.length)/3 + 1;
            if (
              this.commitPool.list[data.commit.blockHash].length >=
                MIN_APPROVALS
            ) {
              this.blockchain.addUpdatedBlock(
                data.commit.blockHash,
                this.blockPool,
                this.preparePool,
                this.commitPool
              );  
             }
            // Send a round change message to nodes
            let message = this.messagePool.createMessage(
              this.blockchain.chain[this.blockchain.chain.length - 1].hash,
              this.wallet
            );
            this.broadcastRoundChange(message);
          }
          break;

        case MESSAGE_TYPE.round_change:
          // check the validity of the round change message
          if (
            !this.messagePool.existingMessage(data.message) &&
            this.messagePool.isValidMessage(data.message) &&
            this.validators.isValidValidator(data.message.publicKey)
          ) {
            // add to pool
            this.messagePool.addMessage(data.message);

            // send to other nodes
            this.broadcastRoundChange(data.message);

            // if enough messages are received, clear the pools
            if (
              this.messagePool.list[data.message.blockHash].length >=
              MIN_APPROVALS
            ) {
              this.transactionPool.clear();
            }
          }
          break;

        case MESSAGE_TYPE.secret_key:
            this.messageCount.msgCount++;
            let block = this.blockchain.createBlock(
                this.transactionPool.transactions,
                this.wallet
            );
            this.broadcastPrePrepare(block);
            break;

        case MESSAGE_TYPE.product:

      }
    });
  }
}

module.exports = P2pserverAux;
