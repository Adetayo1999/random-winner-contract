import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DEV_CHAINS } from "../utils/dev-chains";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { BigNumber } from "ethers";

const deployRandomWinnerGame: DeployFunction = async ({
  deployments,
  network,
  ethers,
  run,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const [deployer] = await ethers.getSigners();

  let args: any[];

  if (DEV_CHAINS.includes(network.name)) {
    const VRFMock: VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );

    const tx = await VRFMock.createSubscription();
    const txResponse = await tx.wait();
    const subscriptionId: BigNumber = txResponse.events?.[0]?.args?.[0];
    const fundTx = await VRFMock.fundSubscription(
      subscriptionId,
      "1000000000000000000"
    );
    await fundTx.wait();

    args = [
      VRFMock.address,
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
      "100000",
      subscriptionId,
    ];
    const RandomWinner = await deploy("RandomWinner", {
      from: deployer.address,
      args,
      log: true,
      waitConfirmations: 1,
    });
    const addConsumerTx = await VRFMock.addConsumer(
      subscriptionId,
      RandomWinner.address
    );
    await addConsumerTx.wait();
  } else {
    const args = [
      "0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed",
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
      "100000",
      "5486",
    ];

    const RandomWinner = await deploy("RandomWinner", {
      from: deployer.address,
      args,
      log: true,
      waitConfirmations: 5,
    });

    log(
      `**************** Verifying ${RandomWinner.address} on ${network.name} ********************`
    );

    // verify contract
    await run("verify:verify", {
      constructorArguments: args,
      address: RandomWinner.address,
    });
  }
};

export default deployRandomWinnerGame;
deployRandomWinnerGame.tags = ["all", "randomWinnerGame"];
