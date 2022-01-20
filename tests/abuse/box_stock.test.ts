import { address, array, dicaa, dicss, json, optional, resource, string, struct, uint32, uint64 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/user/init_account.cdc')
})

afterAll(() => {
    emulator?.terminate()
})

// ユーザーはbox stockを書き換えられない
test('Users cannot rewrite box stock', () => {
    const itemId = 'test-item-id-1'
    emulator.createItem({
        itemId, version: 1, limit: 10, metadata: {}
    })

    emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(MINTER_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-id-1'),
        dicss({}),
        uint32(1)
    )

    emulator.transactions(
        'transactions/abuse/inject_box_stock.cdc',
        string('test-item-id-1')
    )

    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(0), string('x' + 'o'.repeat(9) + 'x'.repeat(54))])
    )
})
