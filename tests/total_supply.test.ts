import { createEmulator, FlowEmulator } from "./__fixtures__/emulator"
import { uint64 } from "./__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

test('initial totalSupply is 18652', () => {
    expect(
        emulator.scripts('scripts/get_total_supply.cdc')
    ).toEqual(uint64(18652))
})
