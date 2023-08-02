import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    polygonMumbai: {
      accounts: [PRIVATE_KEY!],
      url: MUMBAI_RPC_URL,
    },
  },
  gasReporter: {
    enabled: true,
    outputFile: "./gas-reporter.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: POLYGONSCAN_API_KEY!,
    },
  },
};

export default config;
