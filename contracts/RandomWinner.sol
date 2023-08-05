// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

import "hardhat/console.sol";

// custom errors
error RandomWinner__NotContractOwner();
error RandomWinner__GameInProgress();
error RandomWinner__InvalidEntryFee();
error RandomWinner__InvalidMaxPlayers();
error RandomWinner__NoGameInProgress();
error RandomWinner__MaxPlayersCompleted();
error RandomWinner__WinnerPayoutFailed();

contract RandomWinner is VRFConsumerBaseV2 {
    bytes32 immutable keyHash;
    uint32 immutable callbackGasLimit;
    uint64 immutable s_subscriptionId;
    uint16 constant requestConfirmations = 3;
    uint32 constant numWords = 1;
    address immutable owner;
    VRFCoordinatorV2Interface COORDINATOR;

    uint256 max_players;
    bool private gameStarted;
    uint256 private entryFee;
    address[] private players;
    uint256 private gameId;

    event GameStarted(
        uint256 indexed gameId,
        uint256 maxPlayers,
        uint256 entryFee,
        uint256 time
    );

    event PlayerJoined(uint256 indexed gameId, address player, uint256 time);

    event GameEnded(
        uint256 indexed gameId,
        address winner,
        uint256 maxPlayers,
        uint256 requestId
    );

    event RandomWordRequested(
        uint256 indexed gameId,
        uint256 requestId,
        uint256 time
    );

    constructor(
        address _vrfCoordinatorAddress,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinatorAddress) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinatorAddress);
        s_subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert RandomWinner__NotContractOwner();
        }
        _;
    }

    function startGame(
        uint256 _entryFee,
        uint256 _maxPlayers
    ) external onlyOwner {
        if (gameStarted) {
            revert RandomWinner__GameInProgress();
        }

        if (_entryFee <= 0) {
            revert RandomWinner__InvalidEntryFee();
        }

        if (_maxPlayers < 2) {
            revert RandomWinner__InvalidMaxPlayers();
        }

        delete players;
        gameStarted = true;
        max_players = _maxPlayers;
        entryFee = _entryFee;
        gameId++;

        emit GameStarted(gameId, max_players, entryFee, block.timestamp);
    }

    function enterGame() external payable {
        if (!gameStarted) {
            revert RandomWinner__NoGameInProgress();
        }

        if (players.length == max_players) {
            revert RandomWinner__MaxPlayersCompleted();
        }

        if (msg.value < entryFee) {
            revert RandomWinner__InvalidEntryFee();
        }
        players.push(msg.sender);

        if (players.length == max_players) {
            uint256 requestId = requestRandomWords();

            emit RandomWordRequested(gameId, requestId, block.timestamp);
        }

        emit PlayerJoined(gameId, msg.sender, block.timestamp);
    }

    function requestRandomWords() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        uint256 randomIndex = _randomWords[0] % max_players;
        address randomWinner = players[randomIndex];
        gameStarted = false;

        (bool success, ) = payable(randomWinner).call{
            value: address(this).balance
        }("");

        if (!success) {
            revert RandomWinner__WinnerPayoutFailed();
        }

        emit GameEnded(gameId, randomWinner, max_players, _requestId);
    }

    function getOwner() external view returns (address) {
        return owner;
    }

    function getGameStatus() external view returns (bool) {
        return gameStarted;
    }

    function getEntryFee() external view returns (uint256) {
        return entryFee;
    }

    function getGameId() external view returns (uint256) {
        return gameId;
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function getMaxPlayers() external view returns (uint256) {
        return max_players;
    }

    function resetGame() external {
        delete players;
        gameStarted = false;
        entryFee = 0;
        max_players = 0;
    }
}
