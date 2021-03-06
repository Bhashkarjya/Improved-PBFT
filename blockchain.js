const fs = require('fs');

// Import total number of nodes used to create validators list
const { NUMBER_OF_NODES } = require("./config");

// Used to verify block
const Block = require("./block");
const { verifyProposer } = require('./block');

class Blockchain {
  // the constructor takes an argument validators class object
  // this is used to create a list of validators
  constructor(validators) {
    this.validatorList = validators.generateAddresses(NUMBER_OF_NODES);
    this.chain = [Block.genesis()];
  }

  // pushes confirmed blocks into the chain
  addBlock(block) {
    this.chain.push(block);
    console.log("NEW BLOCK ADDED TO CHAIN");
    return block;
  }

  // wrapper function to create blocks
  createBlock(transactions, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      transactions,
      wallet
    );
    return block;
  }

  calculateTime()
  {
    let timeDiff,average;
    const times = [];
    for(let i=2;i<this.chain.length;i++)
    {
        timeDiff = this.chain[i].timestamp - this.chain[i-1].timestamp;
        times.push(timeDiff);

        average = times.reduce((total, num) => (total+num)/times.length);
        let content = `${i-1},${timeDiff} \n`;
        fs.appendFile('output0.csv',content,err => {
          if(err)
              console.error(err);
      });
    }
  }

  // calculates the next propsers by calculating a random index of the validators list
  // index is calculated using the hash of the latest block
  getProposer() {
    let index = 0;
    while(index == 0)
    {
      index = Math.floor(Math.random()*(NUMBER_OF_NODES-1));
    }
    index = 1;
    return this.validatorList[index];
  }

  // checks if the received block is valid
  isValidBlock(block) {
    const lastBlock = this.chain[this.chain.length - 1];
    if (
      lastBlock.sequenceNo + 1 == block.sequenceNo &&
      block.lastHash === lastBlock.hash &&
      block.hash === Block.blockHash(block) &&
      Block.verifyBlock(block) 
    ) {
      console.log("BLOCK VALID");
      return true;
    } else {
      console.log("BLOCK INVALID");
      return false;
    }
  }

  // updates the block by appending the prepare and commit messages to the block
  addUpdatedBlock(hash, blockPool, preparePool, commitPool) {
    let block = blockPool.getBlock(hash);
    block.prepareMessages = preparePool.list[hash];
    block.commitMessages = commitPool.list[hash];
    this.addBlock(block);
  }
}
module.exports = Blockchain;
