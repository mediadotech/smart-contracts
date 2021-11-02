import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, ufix64 } from "../__fixtures__/args"

const USER_1_ADDRESS = accounts["emulator-user-1"].address
const USER_2_ADDRESS = accounts["emulator-user-2"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-account').transactions('transactions/service/mint_flow_token.cdc', address(USER_1_ADDRESS), ufix64(100.0))
})

afterAll(() => {
    emulator?.terminate()
})

// ユーザーは他のユーザーにFLOW残高を転送できる
test('Users can transfer FLOW balances to other users', async () => {
    emulator.signer('emulator-user-1').transactions('transactions/service/transfer_flow_token.cdc', ufix64(5.0), address(USER_2_ADDRESS))
    expect(
        emulator.scripts('scripts/get_flow_token_balance.cdc', address(USER_2_ADDRESS))
    ).toEqual(ufix64("5.00100000"))
})
