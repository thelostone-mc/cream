jest.setTimeout(50000)
import { config } from 'cream-config'
import { MerkleTree } from 'cream-merkle-tree'
import { SnarkBigInt, bigInt } from 'libcream'
import {
    compileAndLoadCircuit,
    executeCircuit,
    CircuitInput,
    ProcessVoteAccumulator,
    copyObject,
    generateVote,
    processVote
} from '../'

const LEVELS: number = config.cream.merkleTrees.toString()
const ZERO_VALUE: number = config.cream.zeroValue
const relayer = config.cream.recipients[0]
const value = config.cream.denomination.toString()
const recipient = config.cream.recipients[1]
const fee = bigInt(value).shr(0)

const arrayBatchSize = [0, 1]

describe("BatchVote circuits", () => {
    let tree, circuit

    beforeAll(async () => {
        circuit = await compileAndLoadCircuit("test/batchVote_test.circom")
        tree = new MerkleTree(
            LEVELS,
            ZERO_VALUE
        )
    })

  describe("BatchVote(4, 2)", () => {
    it("should workd correctly", async () => {
        const processedVotes: ProcessVoteAccumulator[] = arrayBatchSize.reduce(
            (acc: ProcessVoteAccumulator[], index) => {
                if (acc.length === 0) {
                    const input: CircuitInput = generateVote(tree, index, relayer, recipient, fee)
                    const processedVote = processVote({
                        input,
                        tree
                    })
                    acc.push(processedVote)
                } else {
                    // Get last pushed object
                    const lastAcc: ProcessVoteAccumulator = acc.slice(-1)[0]
                    const input: CircuitInput = generateVote(lastAcc.tree, index, relayer, recipient, fee)
                    const processedVote = processVote({
                        input,
                        tree: lastAcc.tree
                    })
                    acc.push(processedVote)
                }
                return acc
            }, [])

        // Construct circuit inputs
        const inputs = processedVotes.reduce(
            (acc, curProcessedTx: ProcessVoteAccumulator) => {
                const { input, tree } = curProcessedTx

                Object.keys(acc).forEach(k => {
                    acc[k].push(input[k])
                })

                return acc
            },
            {
                root: [],
                nullifierHash: [],
                nullifier: [],
                relayer: [],
                recipient: [],
                fee: [],
                secret: [],
                path_elements: [],
                path_index: []
            }
        )

        const witness = await executeCircuit(circuit, inputs)
        const circuitRoot: SnarkBigInt = witness[circuit.symbols["main.new_root"].varIdx]
        expect(circuitRoot.toString()).toEqual(tree.root.toString())
    })
  })
})
