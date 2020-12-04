pragma solidity >=0.4.21 <0.7.0;

import "./Cream.sol";

contract CreamFactory is Ownable {
	// TODO: storeing voting info to ipfs is durable?
	mapping(address => string) public electionDetails;
	event CreamCreated(address indexed creamAddress, string ipfsHash);

	function createCream(
        IVerifier _verifier,
        SignUpToken _signUpToken,
        uint256 _denomination,
        uint32 _merkleTreeHeight,
        address[] memory _recipients,
        string memory _ipfsHash
    ) public onlyOwner {
	    address newCreamAddress = address(new Cream(_verifier, _signUpToken, _denomination, _merkleTreeHeight, _recipients));
		electionDetails[newCreamAddress] = _ipfsHash;
		emit CreamCreated(newCreamAddress, _ipfsHash);
	}
}
