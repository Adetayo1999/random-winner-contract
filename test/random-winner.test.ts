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

    it("checks the game status", async () => {
      const gameStatus = await RandomWinnerGame.getGameStatus();
      expect(gameStatus).to.be.false;
    });

    it("checks the game ID", async () => {
      const gameID = await RandomWinnerGame.getGameId();
      expect(gameID).to.equal("0");
    });

    it("checks the game entry fee", async () => {
      const entryFee = await RandomWinnerGame.getEntryFee();
      expect(entryFee).to.equal("0");
    });
  });

  describe("startGame Tests", () => {
    it("reverts if an invalid entry fee is passed", async () => {
      await expect(
        RandomWinnerGame.startGame(0, 5)
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__InvalidEntryFee"
      );
    });

    it("reverts if an invalid max players number is passed", async () => {
      await expect(
        RandomWinnerGame.startGame("10000", 1)
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__InvalidMaxPlayers"
      );
    });
    it("reverts if the owner tries to start a game when another game is in progress", async () => {
      const startGameTx = await RandomWinnerGame.startGame("10000", 5);

      await startGameTx.wait();

      await expect(
        RandomWinnerGame.startGame("10000", 10)
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__GameInProgress"
      );
    });

    it("reverts if not the contract owner tries to start a game", async () => {
      const AnotherUserConnectedRandomWinner = RandomWinnerGame.connect(
        signers[3]
      );

      await expect(
        AnotherUserConnectedRandomWinner.startGame("10000", 10)
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__NotContractOwner"
      );
    });
  });

  describe("enterGame Tests", () => {
    it("reverts with custom error when user tries to enter game and there is no game in progress", async () => {
      await expect(RandomWinnerGame.enterGame()).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__NoGameInProgress"
      );
    });

    it("revert when a user tries to enter a game with invalid entry fee", async () => {
      const startGameTx = await RandomWinnerGame.startGame(10000, 5);
      await startGameTx.wait();

      await expect(
        RandomWinnerGame.enterGame({
          value: "10",
        })
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__InvalidEntryFee"
      );
    });

    it("reverts with a custom error if a user tries to join after max users limit", async () => {
      const startGameTx = await RandomWinnerGame.startGame(10000, 5);
      await startGameTx.wait();

      for (let i = 1; i <= 5; i++) {
        const otherUsersRandomWinnerGame = RandomWinnerGame.connect(signers[i]);

        await otherUsersRandomWinnerGame.enterGame({
          value: 10000,
        });
      }

      const LateUserRandomWinnerGame = RandomWinnerGame.connect(signers[6]);

      await expect(
        LateUserRandomWinnerGame.enterGame({
          value: 10000,
        })
      ).to.be.revertedWithCustomError(
        RandomWinnerGame,
        "RandomWinner__MaxPlayersCompleted"
      );
    });

    it("selects a random address after max players limit is met", async () => {
      const startGameTx = await RandomWinnerGame.startGame(10000, 5);
      await startGameTx.wait();

      for (let i = 1; i <= 4; i++) {
        const otherUsersRandomWinnerGame = RandomWinnerGame.connect(signers[i]);

        await otherUsersRandomWinnerGame.enterGame({
          value: 10000,
        });
      }

      const requestRandomWordsTx = await RandomWinnerGame.enterGame({
        value: 10000,
      });
      const requestRandomWordsTxReceipt = await requestRandomWordsTx.wait();
      const requestId = requestRandomWordsTxReceipt.events?.[1]?.args?.[1];
      const fulfillRandomWordsTx = await MockVRF.fulfillRandomWords(
        requestId,
        RandomWinnerGame.address
      );
      await fulfillRandomWordsTx.wait();

      return new Promise((resolve) => {
        RandomWinnerGame.on("GameEnded", (_, winner) => {
          expect(signers[2].address).to.equal(winner);
          resolve();
        });
      });
    });
  });

  describe("resetGame tests", () => {
    it("resets the state of the game", async () => {
      const startGameTx = await RandomWinnerGame.startGame(10000, 5);
      await startGameTx.wait();

      const resetGameTx = await RandomWinnerGame.resetGame();
      await resetGameTx.wait();
      const players = await RandomWinnerGame.getPlayers();
      const gameStatus = await RandomWinnerGame.getGameStatus();
      const entryFee = await RandomWinnerGame.getEntryFee();
      const maxPlayers = await RandomWinnerGame.getMaxPlayers();

      expect(players.length).to.equal(0);
      expect(gameStatus).to.be.false;
      expect(entryFee.toString()).to.equal("0");
      expect(maxPlayers.toString()).to.equal("0");
    });
  });
});
