// import { ethers } from "hardhat";
// import {
//   RandomWinner__factory,
//   VRFCoordinatorV2Mock__factory,
// } from "../typechain-types";
// import { BigNumber } from "ethers";

const main = async () => {
  //   const VRFMockFactory: VRFCoordinatorV2Mock__factory =
  //     await ethers.getContractFactory("VRFCoordinatorV2Mock");
  //   const VRFMock = await VRFMockFactory.deploy(
  //     "100000000000000000",
  //     "1000000000"
  //   );
  //   await VRFMock.deployed();
  //   const tx = await VRFMock.createSubscription();
  //   const txResponse = await tx.wait();
  //   const subscriptionId: BigNumber = txResponse.events?.[0]?.args?.[0];
  //   const fundTx = await VRFMock.fundSubscription(
  //     subscriptionId,
  //     "1000000000000000000"
  //   );
  //   await fundTx.wait();
  //   const RandomWinnerFactory: RandomWinner__factory =
  //     await ethers.getContractFactory("RandomWinner");
  //   const RandomWinner = await RandomWinnerFactory.deploy(
  //     VRFMock.address,
  //     "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
  //     100000,
  //     subscriptionId
  //   );
  //   await RandomWinner.deployed();
  //   const addConsumerTx = await VRFMock.addConsumer(
  //     subscriptionId,
  //     RandomWinner.address
  //   );
  //   await addConsumerTx.wait();
  //   const requestRandomWordsTx = await RandomWinner.requestRandomWords();
  //   const requestRandomWordsTxReceipt = await requestRandomWordsTx.wait();
  //   const requestId = requestRandomWordsTxReceipt.events?.[1]?.args?.[2];
  //   const fulfillRandomWordsTx = await VRFMock.fulfillRandomWords(
  //     requestId,
  //     RandomWinner.address
  //   );
  //   await fulfillRandomWordsTx.wait();
};

// main().catch((error) => {
//   console.log(error);
//   process.exit(1);
// });
