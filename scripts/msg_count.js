const fs = require('fs');
class MessageCount{
    constructor()
    {
        this.msgCount = 0;
        this.prePrepareMsgCount = 0;
        this.prepareMsgCount = 0;
        this.commitMsgCount = 0;

        fs.truncate('./scripts/output_TOT.csv',0,() => {});
        fs.truncate('./scripts/output_PPM.csv',0,() => {});
        fs.truncate('./scripts/output_PM.csv',0,() => {});
        fs.truncate('./scripts/output_CM.csv',0,() => {});
    }
    printMsgCount()
    {
        fs.appendFile('./scripts/output_TOT.csv',this.msgCount.toString() + ',',err => 
        {
            if(err)
                console.error(err);
        });
    }
    printPrePrepareMsgCount()
    {
        fs.appendFile('./scripts/output_PPM.csv',this.prePrepareMsgCount.toString() + ',',err => 
        {
            if(err)
                console.error(err);
        });
    }
    printPrepareMsgCount()
    {
        fs.appendFile('./scripts/output_PM.csv',this.prepareMsgCount.toString() + ',',err => 
        {
            if(err)
                console.error(err);
        });
    }
    printCommitMsgCount()
    {
        fs.appendFile('./scripts/output_CM.csv',this.commitMsgCount.toString() + ',',err => 
        {
            if(err)
                console.error(err);
        });
    }
}

module.exports = MessageCount;