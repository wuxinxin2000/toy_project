require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-waffle");
// require("hardhat-deploy");

const GANACHE_RPC_URL = "HTTP://127.0.0.1:7545";
const PRIVATE_KEY_1 =
  "0x2e84483c0cdefe671a20453fcd18cda3ac9d6f627107af94383aeefdf881e630";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// const networkConfig = {
//   31337: {
//     name: "localhost",
//   },
// };

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
      accounts: [
        "0x43410c24b18525e0c3b5fc77df170a702c330f9324de74dd2fc78b8467e7ad15",
        "0xdb80783e2dc328300c7f84cdf243bb4504e3b4bc8f0d94ad612b881562382008",
        "0x6710235661015e81ccd589cb2db95f3ff3f169103490083f7d79a7f0191e181a",
        "0x83694db5e8bb614a1aae7d0d85800123b4c5961494a51808c3e1c8a8265464fa",
      ],
      chainId: 1337,
    },
  },
  solidity: "0.8.17",
  // networkConfig,
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
