import { ethers } from "hardhat";

const main = async () => {
  const signers = await ethers.getSigners();

  const value = "10";

  console.log(ethers.utils.parseEther(value));
};

main();
