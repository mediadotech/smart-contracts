import { address, bool, dicss, string } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/user/init_account.cdc --signer emulator-user-1')
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// Activeでないitemはmintできない
test('Items that are not active cannot be mint', async () => {
    emulator.createItem({itemId: 'test-item-id-1', version: 1, limit: 10, active: false})

    expect(() =>
        emulator.transactions('transactions/minter/mint_token.cdc',
            address(MINTER_ADDRESS),
            string('test-ref-id-1'),
            string('test-item-id-1'),
            dicss({})
        )
    ).toThrowError('error: pre-condition failed: Only active items can be mint')
})

// Activeなitemはmintできる
test('Active item can be mint', async () => {
    emulator.createItem({itemId: 'test-item-id-2', version: 1, limit: 10, active: true})

    expect(emulator.transactions('transactions/minter/mint_token.cdc',
        address(MINTER_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-id-2'),
        dicss({})
    )).toBeTruthy()
})

// ActiveにアップデートされたItemはmintできる
test('Items updated to active can be mint', async () => {
    emulator.createItem({itemId: 'test-item-id-3', version: 1, limit: 10, active: false})

    emulator.transactions('transactions/operator/update_item_active.cdc', string('test-item-id-3'), bool(true))

    expect(emulator.transactions('transactions/minter/mint_token.cdc',
        address(MINTER_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-id-3'),
        dicss({})
    )).toBeTruthy()
})


// DeactiveにアップデートされたItemはmintできない
test('Items updated to deactive cannot be mint', async () => {
    emulator.createItem({itemId: 'test-item-id-4', version: 1, limit: 10, active: true})

    emulator.transactions('transactions/operator/update_item_active.cdc', string('test-item-id-4'), bool(false))

    expect(() =>
        emulator.transactions('transactions/minter/mint_token.cdc',
            address(MINTER_ADDRESS),
            string('test-ref-id-1'),
            string('test-item-id-4'),
            dicss({})
        )
    ).toThrowError('error: pre-condition failed: Only active items can be mint')
})
