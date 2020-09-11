const request = require("request");
const config = require("./config.js");
const fs = require("fs");
const cheerio = require('cheerio');
const { html } = require("cheerio");

let acquireData = (config) => {
  return new Promise((resolve, reject) => {
    request.get(config.rankingURL, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        console.log(config.rankingURL, "Status Code", res.statusCode);
        resolve(body);
      }
    });
  });
};

let writeFile = (content) => {
  fs.writeFile("ishgardRanking.html", content, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
  });
};

let compare = (a, b) => {
    if (a > b) return 1;
    if (b > a) return -1;
  
    return 0;
  }
let compareValues = (key, order = 'asc') => {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }
  
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];
  
      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }
let extractData = (htmlBody,callback) => {
    $ = cheerio.load(htmlBody)
    let rankingData = $('.ranking-list__item')
    // let names = $('.ranking-list__item .ranking-name p:first-child')
    // let scores = $('.ranking-list__item .ranking-score p')
    // let scoresDelta = $('.ranking-list__item .ranking-score span')
    let rankingDataArray = rankingData.toArray()
    let rankingDataParsedArray = []
    rankingDataArray.forEach((element,index)=>{
        let ranking = cheerio.load(element)
        let name = ranking('.ranking-name p:first-child').text().trim()
        let score = ranking('.ranking-score p').text().trim()
        let scoreDelta = ranking('.ranking-score span').text().trim()
        let rankingObject = {
            name : name,
            score : parseInt(score),
            scoreDelta : parseInt(scoreDelta)
        }
        rankingDataParsedArray.push(rankingObject)
        // console.log(name,score,scoreDelta,index+1,'位')
        // debugger
    })
    fs.writeFile(`./data/${new Date().toDateString()} Ranking.json`,JSON.stringify(rankingDataParsedArray),err=>{
        if(err){
            throw(err)
        } else {
            // readHistoryDataFilesContent().then(data=>{
            //     console.log(data,'history file')
            // })
            // readHistoryDataFiles().then(files=>{
            //     let historyDatas=[]
            //     files.forEach(file=>{
            //         fs.readFile(`./data/${file}`,(err,data)=>{
            //             if(err){
            //                 throw err
            //             } else {
            //                 let jsonData = JSON.parse(data)
            //                 let historyDataObject = {
            //                     fileName:file,
            //                     data:jsonData
            //                 }
            //                 historyDatas.push(historyDataObject)
            //             }
            //         })
            //     })
            // })
        }
    })
    fs.writeFile(`./data/${new Date().toDateString()} Ranking Order By Delta.json`,JSON.stringify([...rankingDataParsedArray].sort(compareValues('scoreDelta','desc'))),err=>{
        if(err){
            throw(err)
        }
    })
    fs.writeFile(`./data/${new Date().toDateString()} Ranking Order By Total.json`,JSON.stringify([...rankingDataParsedArray].sort(compareValues('score','desc'))),err=>{
        if(err){
            throw(err)
        }
    })

    // console.log(names.text(),'names')
    // console.log(data.length)
    // console.log(data)
}

let readHistoryDataFiles = () => {
    return new Promise((resolve,reject)=>{
        fs.readdir('./data',(err,files)=>{
            if(err){
                reject(err)
            }
            if(files.length>0){
                resolve(files)
            } else {
                reject ('no history data')
            }
        })
    })
}
// async function readHistoryDataFilesContent () {
//     let files = await readHistoryDataFiles()
//     let historyContentArray = []
//     await Promise.all(files.map(async (file)=>{

//         let content = await fs.readFile(file)
//         let jsonData = JSON.parse(content)
//         let historyDataObject = {
//             fileName:file,
//             data:jsonData
//         }
//         historyContentArray.push(historyDataObject)
//     }))
//     return historyContentArray
// }

acquireData(config).then((body) => {
//   console.log(body);
  writeFile(body)
  extractData(body)
});
