import { address, dicss, int, string, uint32 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// boxをsize:10,000,000で生成できる
test('Boxes can be generated with size:10,000,000', async () => {
    const itemId = 'test-item-id-edge-1'
    emulator.createItem({ itemId, version: 1, limit: 10000000, metadata: {} })

    const result = emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(10000000)
    )

    expect(result.events[0].values.value.fields[2]).toEqual({
        name: 'serialNumber', value: uint32(10000000)
    })

    const result2 = emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(1)
    )

    expect(result2.events[0].values.value.fields[2]).toEqual({
        name: 'serialNumber', value: uint32(1)
    })

    expect(emulator.scripts('scripts/get_box_stock_size.cdc', string(itemId))).toEqual(int(156250))
})
