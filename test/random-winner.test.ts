import { deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { RandomWinner, VRFCoordinatorV2Mock } from "../typechain-types";
import { expect } from "chai";

describe("Random Winner Contract", () => {
  let signers: SignerWithAddress[],
    MockVRF: VRFCoordinatorV2Mock,
    RandomWinnerGame: RandomWinner;

  beforeEach(async () => {
    await deployments.fixture(["all"]);
    MockVRF = await ethers.getContract("VRFCoordinatorV2Mock");
    RandomWinnerGame = await ethers.getContract("RandomWinner");
    signers = await ethers.getSigners();
  });

  describe("Constructor Tests", () => {
    it(" expects contract owner to be the deployer", async () => {
      const owner = await RandomWinnerGame.getOwner();
      expect(owner).to.equal(signers[0].address);
    });
  });
});
