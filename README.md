# Arbitrage-Trader

## What is this magic?

I recently learned about [flashloans](https://finematics.com/flash-loans-explained/). In a nutshell flashloans allow you to borrow certain coins without collateral and use them for a transaction.
I've noticed that the crypto space is full of arbitrage opportunities so I decided to create a bot that looks for these opportunities, borrows money (from DyDx), and executes trades.
This specific bot scans the Kyber and Uniswap exchanges of the price of DAI and executes a trade when an arbitrage opportunity is found using a flashloan from DyDx.

## Navigating the repo:

- [runArbitrage.js](https://github.com/alirangwala/Arbitrage-Trader/blob/main/runArbitrage.js): This script scans both the Kyber and Uniswap exchanges for the price of DAI. Then upon a discrepancy that exceeds the transaction costs it executes a transaction.

- [Flashloan.sol](https://github.com/alirangwala/Arbitrage-Trader/blob/main/contracts/FlashLoan.sol): This is the smart contract that allows you to withdraw coins from DyDx, run the arbitrage logic, return the borrowed token amount once the transaction is complete, and withdraw the profits. Here is the [documentation](https://money-legos.studydefi.com/#/dydx?id=flashloans-on-dydx) for using flashloans on DyDx.

- [IUniswapV2Router02.sol](https://github.com/alirangwala/Arbitrage-Trader/blob/main/contracts/IUniswapV2Router02.sol): Interface for Uniswap's smart contract. This inherits from the original version so we need both contracts.

## Next steps:

I plan to deploy this and track its progress with charts. Then I will expand the bot to use other coins and exchanges that are traded on/with high enough volume.
