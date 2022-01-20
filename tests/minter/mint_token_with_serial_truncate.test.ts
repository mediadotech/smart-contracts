import { address, array, dicss, string, uint32 } from "../__fixtures__/args"
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

// box stockの取得済みの先頭不要な部分がtruncateされる
test('Picked head of stock is truncated', async () => {
    const itemId = 'test-item-id-stock-1'
    emulator.createItem({ itemId, version: 1, limit: 65, metadata: {} })

    emulator.transactions('transactions/test/put_box.cdc', string(itemId))
    emulator.withOptions('--gas-limit', '9999').transactions(
        'transactions/test/fill_box.cdc',
        string(itemId),
        uint32(1),
        uint32(63)
    )
    emulator.withOptions('--gas-limit', '9999').transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(64)
    )

    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(1), string('o' + 'x'.repeat(63))])
    )
})

// 一度にtruncateされるのは1つまで
test('Only one stock is truncate per mint', () => {
    const itemId = 'test-item-id-stock-2'
    emulator.createItem({ itemId, version: 1, limit: 65, metadata: {} })
    emulator.transactions('transactions/test/put_box.cdc', string(itemId))

    emulator.withOptions('--gas-limit', '9999').transactions(
        'transactions/test/fill_box.cdc',
        string(itemId),
        uint32(1),
        uint32(63)
    )

    emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(64)
    )

    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(1), string('o' + 'x'.repeat(63))])
    )
})
