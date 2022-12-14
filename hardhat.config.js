require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require('hardhat-deploy');
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const MNEMONIC = process.env.MNEMONIC || 'sample-mnemonic'
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || 'etherscan-api-key'

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }
    }
  },
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    testnet: {
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      chainId: 97,
      gasPrice: 20000000000,
      accounts: { mnemonic: MNEMONIC }
    },
    mainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 20000000000,
      accounts: { mnemonic: MNEMONIC }
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: MNEMONIC,
      }
    }
  },
  mocha: {
    timeout: 20000
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY
  }
};
