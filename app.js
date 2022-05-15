// Import all required modeles
const express = require("express");
const Wallet = require("./wallet");
const bodyParser = require("body-parser");
const TransactionPool = require("./transaction-pool");
const P2pserver = require("./p2p-server");
// const P2pserverAux = require("./scripts/p2p-server-aux");
const Validators = require("./scripts/validator");
const Blockchain = require("./blockchain");
const BlockPool = require("./block-pool");
const CommitPool = require("./commit-pool");
const PreparePool = require("./prepare-pool");
const MessagePool = require("./message-pool");
const MessageCount = require('./scripts/msg_count');
const QRCode = require("./products/qrcode");
const { NUMBER_OF_NODES } = require("./config");
const ProductList = require("./products");
const HTTP_PORT = process.env.HTTP_PORT || 3001;

// Instantiate all objects
const app = express();
app.use(bodyParser.json());

const wallet = new Wallet(process.env.SECRET);
const transactionPool = new TransactionPool();
const validators = new Validators(NUMBER_OF_NODES);
const blockchain = new Blockchain(validators);
const blockPool = new BlockPool();
const preparePool = new PreparePool();
const commitPool = new CommitPool();
const messagePool = new MessagePool();
const msgCount = new MessageCount();
const productList = new ProductList();

const p2pserver = new P2pserver( 
  blockchain,
  transactionPool,
  wallet,
  blockPool,
  preparePool,
  commitPool,
  messagePool,
  validators,
  msgCount
);

// sends all transactions in the transaction pool to the user
app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

// sends the entire chain to the user
app.get("/blocks", (req, res) => {
  res.json(blockchain.chain); 
});

app.get("/timings", (req,res) => {
  blockchain.calculateTime();
  res.json({"message": "times calculated"});
});

app.get('/messageCount', (req,res) => {
  msgCount.printMsgCount();
  msgCount.printPrePrepareMsgCount();
  msgCount.printPrepareMsgCount();
  msgCount.printCommitMsgCount();
  res.json({"message": "Counting messsages"});
});

// creates transactions for the sent data
app.post("/transact", (req, res) => {
  const { data } = req.body;
  const transaction = wallet.createTransaction(data);
  transactionPool.addTransaction(transaction);
  p2pserver.broadcastTransaction(transaction);
  res.json({"message": "success"});
});

app.post("/addProduct", (req,res) => {
  let product = req.body;
  product.source = wallet.publicKey;
  let pDetails = {pId: req.body.pId, pName: req.body.pName, price: req.body.price, pOwner: req.body.pOwner, source: wallet.publicKey};
  const signedPDetails = wallet.sign(pDetails);
  product.signedPDetails = signedPDetails;

  const qrData = JSON.stringify({pDetails,signedPDetails});
  const newQR = new QRCode();
  newQR.generateQR({data: qrData} );
  product.qrCode = newQR;

  const data = product;
  productList.addProduct(product.pId,product);

  const transaction = wallet.createTransaction(data);
  transactionPool.addTransaction(transaction);
  p2pserver.broadcastTransaction(transaction);
  res.json({"message": "Product added to the blockchain"});

});

app.post("/shipProduct", (req,res) => {
  let data = req.body;
  const transaction = wallet.createTransaction(data);
  transactionPool.addTransaction(transaction);
  p2pserver.broadcastTransaction(transaction);
  res.json({"message": "success"});
});

//api call to get the public addresses of all the nodes in the blockchain network
app.get("/nodes",(req,res) => {
  res.json(blockchain.validatorList);
});

// starts the app server
app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});

// starts the p2p server
p2pserver.listen();
