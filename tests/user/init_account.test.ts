import { createEmulator, FlowEmulator } from "../utils/emulator"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

test('init emulator-user-1', async () => {
    expect(
        emulator.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-1')
    ).toBeTruthy()
})
