require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-waffle");
// require("hardhat-deploy");

const GANACHE_RPC_URL = "HTTP://127.0.0.1:7545";
const PRIVATE_KEY =
  "0x2e84483c0cdefe671a20453fcd18cda3ac9d6f627107af94383aeefdf881e630";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const networkConfig = {
  31337: {
    name: "localhost",
  },
};

const developmentChains = ["hardhat", "localhost"];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // localhost: {
    //   url: "http://127.0.0.1:8545/",
    //   accounts: [
    //     "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    //     "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    //     "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    //   ],
    // },
    ganache: {
      url: GANACHE_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1337,
    },
  },
  solidity: "0.8.17",
  networkConfig,
  developmentChains,
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
