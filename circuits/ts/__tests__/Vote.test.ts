jest.setTimeout(50000)
import { config } from 'cream-config'
import { MerkleTree } from 'cream-merkle-tree'
import { bigInt } from 'libcream'
import {
  SnarkBigInt,
  compileAndLoadCircuit,
  executeCircuit,
  Deposit,
  CircuitInput,
  generateVote
} from '../'

const LEVELS:number = config.cream.merkleTrees.toString()
const ZERO_VALUE:number = config.cream.zeroValue
const relayer = config.cream.recipients[0]
const value = config.cream.denomination.toString()
const recipient = config.cream.recipients[1]
const fee = bigInt(value).shr(0)

describe("Vote circuits", () => {
  let tree, circuit

  beforeAll(() => {
    tree = new MerkleTree(
      LEVELS,
      ZERO_VALUE
    )
  })

  describe("Vote(4)", () => {
    it("should return correct root", async () => {
      circuit = await compileAndLoadCircuit("test/vote_test.circom")

      for (let i = 0; i < 2**LEVELS; i++) {
	const input: CircuitInput = generateVote(tree, i, relayer, recipient, fee)
	const witness = await executeCircuit(circuit, input)
	const circuitRoot: SnarkBigInt = witness[circuit.symbols["main.new_root"].varIdx]
 	expect(circuitRoot.toString()).toEqual(input.root.toString())
      }
    })
  })
})
