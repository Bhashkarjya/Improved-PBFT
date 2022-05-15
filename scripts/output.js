const fs = require('fs');
const QRCode = require('../products/qrcode');

// fs.truncate('msgOutput.txt', 0,function(){
//     console.log("File cleared");
// });

// fs.createReadStream("output_TOT.csv",{encoding : "utf-8"})
//     .on('data', (chunk) => {
//         // console.log(chunk);
//         const arr = chunk.split(',').map(element => 
//             {return Number(element);
//         });
//         const avg = arr => arr.reduce((total,num) => total+num,0)/arr.length;
//         const avg_value = Math.round(avg(arr).toFixed(2));
//         const str = `Average of total number of messages exchanged by one node ${avg_value} \n`;
//         fs.appendFile("msgOutput.txt",str,err=>{
//             if(err)
//                 console.error(err);
//         });
//     })
//     .on("error",(error) => {
//         console.log(error);
//     });

// fs.createReadStream("output_PPM.csv",{encoding : "utf-8"})
//     .on('data', (chunk) => {
//         // console.log(chunk);
//         const arr = chunk.split(',').map(element => 
//             {return Number(element);
//         });
//         const avg = arr => arr.reduce((total,num) => total+num,0)/arr.length;
//         const avg_value = Math.round(avg(arr).toFixed(2));
//         const str = `Average of pre-prepare messages exchanged by one node ${avg_value} \n`;
//         fs.appendFile("msgOutput.txt",str,err=>{
//             if(err)
//                 console.error(err);
//         });
//     })
//     .on("error",(error) => {
//         console.log(error);
//     });

// fs.createReadStream("output_PM.csv",{encoding : "utf-8"})
//     .on('data', (chunk) => {
//         // console.log(chunk);
//         const arr = chunk.split(',').map(element => 
//             {return Number(element);
//         });
//         const avg = arr => arr.reduce((total,num) => total+num,0)/arr.length;
//         const avg_value = Math.round(avg(arr).toFixed(2));
//         const str = `Average of prepare messages exchanged by one node ${avg_value} \n`;
//         fs.appendFile("msgOutput.txt",str,err=>{
//             if(err)
//                 console.error(err);
//         });
//     })
//     .on("error",(error) => {
//         console.log(error);
//     });

// fs.createReadStream("output_CM.csv",{encoding : "utf-8"})
//     .on('data', (chunk) => {
//         // console.log(chunk);
//         const arr = chunk.split(',').map(element => 
//             {return Number(element);
//         });
//         const avg = arr => arr.reduce((total,num) => total+num,0)/arr.length;
//         const avg_value = Math.round(avg(arr).toFixed(2));
//         const str = `Average of commit messages exchanged by one node ${avg_value} \n`;
//         fs.appendFile("msgOutput.txt",str,err=>{
//             if(err)
//                 console.error(err);
//         });
//     })
//     .on("error",(error) => {
//         console.log(error);
//     });

let content = '';

for(let i=0;i<50;i++)
{
    content+='./test.sh; ';
}

fs.writeFile('test.txt', content,err => {
    if(err)
    console.error(err);
});