jest.setTimeout(50000)
import { config } from 'cream-config'
import { MerkleTree } from 'cream-merkle-tree'
import { SnarkBigInt, rbigInt, bigInt } from 'libcream'
import {
    compileAndLoadCircuit,
    executeCircuit,
    CircuitInput,
    generateVote
} from '../'

const LEVELS: number = config.cream.merkleTrees.toString()
const ZERO_VALUE: number = config.cream.zeroValue
const relayer = config.cream.recipients[0]
const value = config.cream.denomination.toString()
const recipient = config.cream.recipients[1]
const fee = bigInt(value).shr(0)

describe("Vote circuits", () => {
    let tree, circuit

    beforeAll(async () => {
        circuit = await compileAndLoadCircuit("test/vote_test.circom")
        tree = new MerkleTree(
            LEVELS,
            ZERO_VALUE
        )
    })

    describe("Vote(4)", () => {
        it("should return correct root", async () => {
            for (let i = 0; i < 2 ** LEVELS; i++) {
                const input: CircuitInput = generateVote(tree, i, relayer, recipient, fee)
                const witness = await executeCircuit(circuit, input)
                const circuitRoot: SnarkBigInt = witness[circuit.symbols["main.new_root"].varIdx]
                expect(circuitRoot.toString()).toEqual(input.root.toString())
            }
        })

        it("should fail when sender sends invalid commitment (:nullifier)", async () => {
            let input = generateVote(tree, 0, relayer, recipient, fee)

            // Change nullifier value
            input.nullifier = rbigInt(31)

            try {
                await executeCircuit(circuit, input)
            } catch {
                expect(true).toBeTruthy()
            }
        })

        it("should fail when sender sends invalid commitment (:secret)", async () => {
            let input = generateVote(tree, 0, relayer, recipient, fee)

            // Change secret value
            input.secret = rbigInt(31)

            try {
                await executeCircuit(circuit, input)
            } catch {
                expect(true).toBeTruthy()
            }
        })

        it("should fail when sender sends invalid nullifierHash", async () => {
            let input = generateVote(tree, 0, relayer, recipient, fee)

            // Change nullifierHah value
            input.nullifierHash = rbigInt(31)

            try {
                await executeCircuit(circuit, input)
            } catch {
                expect(true).toBeTruthy()
            }
        })

        it("should fail when sender sends invalid root", async () => {
            let input = generateVote(tree, 0, relayer, recipient, fee)

            // Change root value
            input.root = rbigInt(31)

            try {
                await executeCircuit(circuit, input)
            } catch {
                expect(true).toBeTruthy()
            }
        })
    })
})
