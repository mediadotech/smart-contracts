import { address, array, dicss, int, string, uint32 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// Operatorはboxをtruncateできる
test('Items that are not active cannot be mint', async () => {
    const itemId = 'test-item-id-1'
    emulator.createItem({itemId, version: 1, limit: 102})

    emulator.transactions('transactions/minter/mint_token_with_serial.cdc',
        address(MINTER_ADDRESS),
        string('test-ref-id-1'),
        string(itemId),
        dicss({}),
        uint32(2)
    )
    emulator.transactions(
        'transactions/test/fill_box.cdc',
        string(itemId),
        uint32(3),
        uint32(50)
    )
    emulator.transactions(
        'transactions/test/fill_box.cdc',
        string(itemId),
        uint32(51),
        uint32(102)
    )

    emulator.transactions('transactions/minter/mint_token_with_serial.cdc',
        address(MINTER_ADDRESS),
        string('test-ref-id-1'),
        string(itemId),
        dicss({}),
        uint32(1)
    )
    emulator.transactions('transactions/operator/truncate_serial_box.cdc',
        string(itemId),
        int(2)
    )
    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(2), string('')])
    )
})

// Operatorではない者はboxをtruncateできない
test('Those who are not Operators cannot truncate the box', async () => {
    const itemId = 'test-item-id-2'
    emulator.createItem({itemId, version: 1, limit: 10})

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/operator/truncate_serial_box.cdc',
            string(itemId),
            int(2)
        )
    ).toThrowError('pre-condition failed: Roles not on the list are not allowed')
})
