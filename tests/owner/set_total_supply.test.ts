import { address, string, uint32 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const OWNER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(OWNER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(OWNER_ADDRESS))
    emulator.createItem({ itemId: 'test-item-1', version: 1, limit: 10, metadata: {} })
    emulator.createItem({ itemId: 'test-item-2', version: 1, limit: 30, metadata: {} })
})

afterAll(() => {
    emulator?.terminate()
})

test('Owner can force mintedCount to be updated', () => {
    emulator.transactions('transactions/owner/set_item_minted_count.cdc', string('test-item-1'), uint32(5))

    expect(
        emulator.scripts('scripts/get_item_minted_count.cdc', string('test-item-1'))
    ).toEqual(
        uint32(5)
    )
})

test('mintedCount must be higher', () => {
    expect(() =>
        emulator.transactions('transactions/owner/set_item_minted_count.cdc', string('test-item-1'), uint32(3))
    ).toThrowError('error: pre-condition failed: mintedCount must be higher than before')
})

test('mintedCount must not exceed limit', () => {
    emulator.transactions('transactions/owner/set_item_minted_count.cdc', string('test-item-1'), uint32(10))
    expect(() =>
        emulator.transactions('transactions/owner/set_item_minted_count.cdc', string('test-item-1'), uint32(11))
    ).toThrowError('error: pre-condition failed: mintedCount must not exceed limit')
})

test('There is no unexpected change in mintedCount of item', () => {
    expect(
        emulator.scripts('scripts/get_item_minted_count.cdc', string('test-item-2'))
    ).toEqual(
        uint32(0)
    )
})
