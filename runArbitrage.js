require('dotenv').config();
const Web3 = require('web3');
const { ChainId, TokenAmount, Fetcher } = require('@uniswap/sdk')
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.INFURA_URL))
const abis = require('./abis')
const { mainnet: addresses } = require('./addresses')

web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const kyber = new web3.eth.Contract(
  abis.kyber.kyberNetworkProxy,
  addresses.kyber.kyberNetworkProxy
)

const AMOUNT_ETH = 100;
const RECENT_ETH_PRICE = 1500;
const AMOUNT_ETH_TO_WEI = web3.utils.toWei(AMOUNT_ETH.toString());
const AMOUNT_DAI_TO_WEI = web3.utils.toWei((AMOUNT_ETH * RECENT_ETH_PRICE).toString());

const init = async () => {
  const [dai, weth] = await Promise.all(
    [addresses.tokens.dai, addresses.tokens.weth].map(tokenAddress => (
      Fetcher.fetchTokenData(
        ChainId.MAINNET,
        tokenAddress
      )
    )));
  const daiWeth = await Fetcher.fetchPairData(
    dai,
    weth
  )

  web3.eth.subscribe('newBlockHeaders')
    .on('data', async block => {
      console.log(`New block receiver. Block # ${block.number}`);

      const kyberResults = await Promise.all([
        kyber.methods.getExpectedRate(
          addresses.tokens.dai,
          '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          AMOUNT_DAI_TO_WEI).call(),
        kyber.methods.getExpectedRate(
          '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          addresses.tokens.dai,
          AMOUNT_ETH_TO_WEI).call()
      ])
      const kyberRates = {
        buy: parseFloat(1 / (kyberResults[0].expectedRate / (10 ** 18))),
        sell: parseFloat(kyberResults[1].expectedRate / (10 ** 18))
      }
      console.log('Kyber ETH/DAI')
      console.log(kyberRates)
      const uniswapResults = await Promise.all([
        daiWeth.getOutputAmount(new TokenAmount(dai, AMOUNT_DAI_TO_WEI)),
        daiWeth.getOutputAmount(new TokenAmount(dai, AMOUNT_ETH_TO_WEI)),
      ]);

      const uniswapRates = {
        buy: parseFloat(AMOUNT_DAI_TO_WEI / (uniswapResults[0][0].toExact() * 10 ** 18)),
        sell: parseFloat(uniswapResults[1][0].toExact() / AMOUNT_ETH)
      }
      console.log('Uniswap ETH DAI')
      console.log(uniswapRates)

      const gasPrice = await web3.eth.getGasPrice();
      const txCost = 200000 * parseInt(gasPrice);
      const currentEthPrice = (uniswap.buy + uniswap.sell) / 2;
      // sell on uniswap and buy on kyber
      const profit1 = parseInt(AMOUNT_ETH_TO_WEI / 10 ** 18) * (uniswapRates.sell - kyberRates.buy) - (txCost / 10 ** 18) * currentEthPrice;
      // sell on kyber and buy on uniswap
      const profit2 = parseInt(AMOUNT_ETH_TO_WEI / 10 ** 18) * (kyberRates.sell - uniswapRates.buy) - (txCost / 10 ** 18) * currentEthPrice;

      if (profit1 > 0) {
        console.log('Arbitrage opportunity found!')
        console.log('sell on uniswap and buy on kyber')
        console.log(`Expected Profit: ${profit1}`)
      } else if (profit2 > 0) {
        console.log('Arbitrage opportunity found!')
        console.log('sell on kyber and buy on uniswap')
        console.log(`Expected Profit: ${profit2}`)
      }
    })
    .on('error', error => {
      console.log(error)
    })
};
init();
