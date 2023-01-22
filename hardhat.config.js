require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

const ALCHEMY_KEY = process.env.ALCHEMY_KEYALCHEMY_KEY;

module.exports = {
  solidity: "0.8.9",
  networks: {
    tenderly: {
      url: `https://rpc.tenderly.co/fork/d7e7a8d9-d5eb-4ad4-961c-2d1afc0a7214`,
    },
  }
}