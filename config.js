let rankingURL = process.env.URL || 'https://jp.finalfantasyxiv.com/lodestone/ishgardian_restoration/ranking/miner?worldname=Typhon&dcgroup=Elemental#ranking'
let characterName = process.env.CHAR || 'Visual Studio'
module.exports = {
    charName:characterName,
    rankingURL:rankingURL
}