pragma solidity >=0.4.24 <0.6.0;

import "../contracts/MerkleTreeWithHistory.sol";

contract MerkleTreeWithHistoryMock is MerkleTreeWithHistory {
    constructor(uint32 _treeLevels) MerkleTreeWithHistory(_treeLevels) public {}
    function insert(bytes32 _leaf) public {
        _insert(_leaf);
    }
}