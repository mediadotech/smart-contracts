import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, ufix64 } from "../__fixtures__/args"

const USER_1_ADDRESS = accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// サービスアカウント(emulator-account)はFLOWを発行できる
test('Service account can mint FLOW', async () => {
    emulator.signer('emulator-account').transactions('transactions/service/mint_flow_token.cdc', address(USER_1_ADDRESS), ufix64(10.0))
    expect(
        emulator.scripts('scripts/get_flow_token_balance.cdc', address(USER_1_ADDRESS))
    ).toEqual(ufix64("10.00100000"))
})
