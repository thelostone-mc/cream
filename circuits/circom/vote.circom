include "merkleTree.circom";
include "hasher.circom"

// Verifies that commitment that corresponds to given secret and nullifier is included in the merkle tree of deposits
template Vote(levels) {
    // Input(s)
    signal input root;
    signal input nullifierHash;
    signal input recipient; // not taking part in any computations
    signal input relayer;   // not taking part in any computations
    signal input fee;       // not taking part in any computations

    signal private input nullifier;
    signal private input secret;
    signal private input path_elements[levels];
    signal private input path_index[levels];

    // Output: tree root
    signal output new_root;

    component hasher = Hasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    hasher.nullifierHash === nullifierHash;

    // Check if sender's inputs are valid and correctly update merkle tree root
    // expect to fail if sender's inputs are invalid
    component correctTxSender = LeafExists(levels);
    correctTxSender.leaf <== hasher.commitment;
    correctTxSender.root <== root;

    for (var i = 0; i < levels; i++) {
        correctTxSender.path_elements[i] <== path_elements[i];
        correctTxSender.path_index[i] <== path_index[i];
    }

    // output new_root hash
    new_root <== correctTxSender.root;
}