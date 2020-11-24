include "./vote.circom";

template BatchVote(levels, batch_size) {
    // Inputs
    signal input root[batch_size];
    signal input nullifierHash[batch_size];
    signal input recipient[batch_size]; // not taking part in any computations
    signal input relayer[batch_size];   // not taking part in any computations
    signal input fee[batch_size];       // not taking part in any computations

    signal private input nullifier[batch_size];
    signal private input secret[batch_size];
    signal private input path_elements[batch_size][levels];
    signal private input path_index[batch_size][levels];

    // Output
    signal output new_root;

    component vote[batch_size];
    for (var i = 0; i < batch_size; i++) {
    	vote[i] = Vote(levels);
        vote[i].root <== root[i];
        vote[i].nullifierHash <== nullifierHash[i];
        vote[i].nullifier <== nullifier[i];
        vote[i].recipient <== recipient[i];
        vote[i].relayer <== relayer[i];
        vote[i].fee <== fee[i];
        vote[i].secret <== secret[i];

        for (var j = 0; j < levels; j++) {
            vote[i].path_elements[j] <== path_elements[i][j];
            vote[i].path_index[j] <== path_index[i][j];
        }
    }

    // Output: new root hash
    new_root <== vote[batch_size - 1].new_root;
}