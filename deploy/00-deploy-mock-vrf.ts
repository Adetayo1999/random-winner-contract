import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DEV_CHAINS } from "../utils/dev-chains";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployMockVRF: DeployFunction = async ({
  deployments,
  network,
  ethers,
}: HardhatRuntimeEnvironment) => {
  try {
    const { log, deploy } = deployments;
    const [deployer] = await ethers.getSigners();
    log(
      `**************************** Deploying VRFCoordinatorV2Mock On ${network.name} *************************`
    );

    const args = ["100000000000000000", "1000000000"];

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer.address,
      args: args,
      log: true,
      waitConfirmations: DEV_CHAINS.includes(network.name) ? 1 : 4,
    });
  } catch (error) {
    console.log(error);
  }
};

export default deployMockVRF;
deployMockVRF.tags = ["all", "mockVRF"];
