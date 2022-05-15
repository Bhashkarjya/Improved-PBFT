// Import the wallet class
const Wallet = require("../wallet");
const ChainUtil = require("../chain-util");

const e = 2.71;

class Validators {
  // constructor will take an argument which is the number of nodes in the network
  constructor(numberOfValidators) {
    this.list = this.generateAddresses(numberOfValidators);
    //for each validator in the list, find a Random1, S1, Random2 and S2
    this.nodeDetails = this.fillNodeDetails(numberOfValidators);
    this.consensusNodes = [];
  }

  fillNodeDetails(numberOfValidators)
  {
    let nodeDetails = new Map();
    for( let i = 0; i < numberOfValidators;i++)
    {
      //generate random number random1
      const Random1 = Math.floor(Math.random()*1000);
      const Reputation = 3;
      //calculate the number of validation leaders
    //    const noOfVL = Math.floor(Math.random()*1000)%2 + 1;
       const noOfVL = 1;
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

      let obj = {Random1: Random1, S1: S1, Random2: Random2, S2: S2, Reputation: Reputation};
      nodeDetails.set(this.list[i], obj);
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

  isValidConsensusNodes(node){
      return this.consensusNodes.includes(node);
  }

  calculateNumberOfValidators(Reputation)
  {
    const activation = Math.pow(e,(-1)*Reputation)/(1+Math.pow(e,(-1)*Reputation));
    const S = Math.max(0.25, activation);
    return S;
  }

  //function to select the validators from the pool of validators
  selectValidators(num)
  {
      let validators_list = [], it = num;
      let len = this.list.length;

      while(it)
      {
        let x = Math.floor(Math.random()*len);
        console.log(x);
        if(validators_list.length==0 || validators_list.find(element => element == x) == undefined)
        {
            validators_list.push(x);
            it--;
        }
      }
      return validators_list;
  }

  fillPublicWallets(validators_list)
  {
      let arr = [];
      for(let i=0;i<validators_list.length;i++)
      {
        arr.push(this.list[validators_list[i]]);
      }
      return arr;
  }
}
module.exports = Validators;

// console.log(V.list);

// for(let i=0;i<3;i++)
// {
//     const S1 = V.nodeDetails.get(V.list[0]).S1;
//     for(let j=0;j<3;j++)
//     {
//         if(j!=i)
//         {
//             const S2 = V.nodeDetails.get(V.list[j]).S2;
//             const Random2 = V.nodeDetails.get(V.list[j]).Random2;
//             if(JSON.stringify(S2) == JSON.stringify(ChainUtil.hash(S1 || Random2)))
//             console.log(true);
//         }
//     }
// }

// const validators = V.selectValidators(3);
// const consensusNodes = V.fillPublicWallets(validators);
// console.log(consensusNodes);

