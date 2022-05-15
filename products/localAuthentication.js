const ChainUtil = require("../chain-util");
const axios = require('axios');

class LocalAuthentication{
    constructor({blockchain, product, wallet, pDetails, signedPDetails})
    {
        this.blockchain = blockchain;
        this.product = product;
        this.wallet = wallet;

        this.pDetails = pDetails;
        this.signedPDetails = signedPDetails;
    }

    clearProductDetails()
    {
        this.pDetails = {};
        this.signedPDetails = '';
    }

    detectProductTampering()
    {
        const output =  ChainUtil.verifySignature(this.pDetails.source, this.signedPDetails, this.pDetails);
        const previousDetails = this.blockchain.chain[this.blockchain.chain.length-1].data[0].input.data;
        const previousPDetails = {pId: previousDetails.pId, pName: previousDetails.pName, price: previousDetails.price, pOwner: previousDetails.pOwner, source: previousDetails.source};
        if(JSON.stringify(this.pDetails) == JSON.stringify(previousPDetails))
            return true && output;
        return false;
    }

    detectCloning()
    {
        const productQRID = this.product.qrCode.qrid;
        const previousQRID = this.blockchain.chain[this.blockchain.chain.length-1].data[0].input.data.qrCode.qrid;

        if(JSON.stringify(productQRID) == JSON.stringify(previousQRID))
            return true;
        return false;
    }

    detectTagReapplication()
    {
        const readingsOnBlock = this.blockchain.chain[this.blockchain.chain.length-1].data[0].input.data.qrCode.readCounter;
        const currentReadCounter = this.product.qrCode.readCounter;

        return ((currentReadCounter-1) == readingsOnBlock);
    }

    authenticate()
    {
        const a = this.detectProductTampering();
        if(!a){
            console.log("The product has been tampered");
        }
        const b = this.detectCloning();
        if(!b){
            console.log("The product has been cloned");
        }
        const c = this.detectTagReapplication();
        if(!c){
            console.log("Tag reapplication detected");
        }
        return a && b && c;
    }
}

module.exports = LocalAuthentication;