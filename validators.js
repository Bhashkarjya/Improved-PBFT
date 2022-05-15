// Import the wallet class
const Wallet = require("./wallet");
const ChainUtil = require("./chain-util");

class Validators {
  // constructor will take an argument which is the number of nodes in the network
  constructor(numberOfValidators) {
    this.list = this.generateAddresses(numberOfValidators);
    //for each validator in the list, find a Random1, S1, Random2 and S2
    this.nodeDetails = this.fillNodeDetails(numberOfValidators);
  }

  fillNodeDetails(numberOfValidators)
  {
    let nodeDetails = new Map();
    for( let i = 0; i < numberOfValidators;i++)
    {
      //generate random number random1
      const random1 = Math.floor(Math.random()*1000);
      //calculate the number of validation leaders
      const noOfVL = Math.floor(Math.random()*1000)%2 + 1;
      let list = [];
      //map the validation leaders for the particular node
      for( let j=0;j<noOfVL;j++)
      {
        let x = -1;
        while( x != i)
        {
          x = Math.floor(Math.random()*1000)%numberOfValidators;
        }
        list.push(x);
      }

      //generate S1
      let S1 = this.list[i];
      for(let j=0;j<list.length;j++)
      {
        S1 = S1 || this.list[list[j]];
      }

      S1 = ChainUtil.hash(S1);
      const Random2 = Math.floor(Math.random()*1000);
      const S2 = ChainUtil.hash(S1 || Random2);

      let obj = {random1: random1, S1: S1, Random2: Random2, S2: S2};
      nodeDetails.set(i, obj);
    }
    return nodeDetails;
  }
 
  // This function generates wallets and their public key
  // The secret key has been known for demonstration purposes
  // Secret will be passed from command line to generate the same wallet again
  // As a result the same public key will be generatedd
  generateAddresses(numberOfValidators) {
    let list = [];
    for (let i = 0; i < numberOfValidators; i++) {
      list.push(new Wallet("NODE" + i).getPublicKey());
    }
    return list;
  }

  // This function verfies if the passed public key is a known validator or not
  isValidValidator(validator) {
    return this.list.includes(validator);
  }
}
module.exports = Validators;
