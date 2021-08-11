import { address, bool, dicaa, dicss, optional, string, struct, uint32 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'

const OPERATOR_ADDRESS = accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(OPERATOR_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(OPERATOR_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(OPERATOR_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// 一度もmintされていないItemのlimitは更新できる
test('Item limits that have never been mint can be updated', async () => {
    emulator.createItem({itemId: 'test-item-id-1', version: 1, limit: 0, metadata: {}})

    emulator.transactions('transactions/operator/update_item_limit.cdc', string('test-item-id-1'), uint32(10))

    expect(
        emulator.scripts('scripts/get_item.cdc', string('test-item-id-1'))
    ).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.DigitalContentAsset.Item', {
            itemId: string('test-item-id-1'),
            version: uint32(1),
            mintedCount: uint32(0),
            limit: uint32(10),
            active: bool(true),
            versions: dicaa([{
                key: uint32(1), value: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.ItemData', {
                    version: uint32(1),
                    originSerialNumber: uint32(1),
                    metadata: dicss({})
                })
            }])
        })
    ))
})

// 一度でもmintされたitemのlimitは更新できない
test('The limit of an item that has been mint even once cannot be updated', async () => {
    const itemId = 'test-item-id-2'
    emulator.createItem({itemId, version: 1, limit: 1, metadata: {}})
    emulator.mintToken({recipient: 'emulator-user-1', refId: 'test-ref-id-1', itemId, metadata: {}})

    expect(() =>
        emulator.transactions('transactions/operator/update_item_limit.cdc', string(itemId), uint32(10))
    ).toThrow('Limit can be changed only if it has never been mint')
})

// 存在しないitemのlimitは更新できない
test('Limit of non-existent item cannot be updated', async () => {
    expect(() =>
        emulator.transactions('transactions/operator/update_item_limit.cdc', string('test-item-id-3-no-exists'), uint32(10))
    ).toThrow('Limit of non-existent item cannot be updated')
})

// OperatorではないユーザーはItemのlimitを更新できない
test('Non-Operator users cannot update Item limits', () => {
    const itemId = 'test-item-id-3'
    emulator.createItem({itemId, version: 1, limit: 1})

    expect(() =>
        emulator.signer('emulator-user-1')
            .transactions(
                'transactions/operator/update_item_limit.cdc',
                string(itemId),
                uint32(10)
            )
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})
