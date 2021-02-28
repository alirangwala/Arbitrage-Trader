const Web3 = require('web3');
require('dotenv').config();
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))

web3.eth.subscribe('newBlockHeaders')
  .on('data', async block => {
    console.log(`New block receiver. Block # ${block.number}`);
  })
  .on('error', error => {
    console.log(error)
  })