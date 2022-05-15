const fs = require('fs');

class Times{
    constructor()
    {
        this.list = [];
        this.average = [];
    }

    print()
    {   
        this.runningAverage();
        for(let i=0;i<this.list.length;i++)
        {
            let content = `${i+1},${this.list[i]}, ${this.average[i]} \n`
            // let content = `${this.list[i]}, \n`
            // console.log(content);
            fs.appendFile('output2.csv',content,err => {
                if(err)
                    console.error(err);
            });
        }
    }

    runningAverage()
    {
        let avg,sum = 0;
        for(let i=0;i<this.list.length;i++)
        {   
            sum += this.list[i];
            this.average.push(sum/(i+1)); 
        }
    }

}


module.exports = Times; 