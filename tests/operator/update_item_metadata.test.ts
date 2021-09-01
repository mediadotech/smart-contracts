import { address, array, bool, dicaa, dicss, json, optional, string, struct, uint32 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const OPERATOR_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

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

// ミントされていないバージョンのMetadataは更新できる
test('Non-minted version of metadata can be updated with the same version', () => {
    emulator.createItem({itemId: 'test-item-id-1', version: 1, limit: 1, metadata: { 'versionName': 'First' }})
    emulator.transactions('transactions/operator/update_item_metadata.cdc', string('test-item-id-1'), uint32(1), dicss({ 'versionName': 'First (overwritten)'}))

    expect(emulator.scripts('scripts/get_item.cdc', string('test-item-id-1'))).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.FanTopToken.Item', {
            itemId: string('test-item-id-1'),
            version: uint32(1),
            mintedCount: uint32(0),
            limit: uint32(1),
            active: bool(true),
            versions: dicaa([{
                key: uint32(1), value: struct('A.f8d6e0586b0a20c7.FanTopToken.ItemData', {
                    version: uint32(1),
                    originSerialNumber: uint32(1),
                    metadata: dicss({ 'versionName': 'First (overwritten)'})
                })
            }])
        })
    ))
})

// ミントされたバージョンのmetadataは同じバージョンで更新できない
test('Minted version of metadata cannot be updated with the same version', () => {
    emulator.createItem({itemId: 'test-item-id-2', version: 1, limit: 1, metadata: { 'versionName': 'First' }})
    emulator.mintToken({recipient: 'emulator-user-1', refId: 'test-ref-id-1', itemId: 'test-item-id-2', metadata: { 'versionName': 'First (overwritten)'} })

    expect(() =>
        emulator.transactions('transactions/operator/update_item_metadata.cdc', string('test-item-id-2'), uint32(1), dicss({ 'versionName': 'First (overwritten)'}))
    ).toThrow('Locked version cannot be overwritten')
})

// ミントされたバージョンのメタデータは新しいバージョンのメタデータで上書きできる
test('Minted version of metadata can be overridden with newer version of metadata', () => {
    emulator.createItem({itemId: 'test-item-id-3', version: 1, limit: 1, metadata: { 'versionName': 'First' }})
    emulator.mintToken({recipient: 'emulator-user-1', refId: 'test-ref-id-1', itemId: 'test-item-id-3', metadata: { 'versionName': 'First (overwritten)'} })

    emulator.transactions('transactions/operator/update_item_metadata.cdc', string('test-item-id-3'), uint32(2), dicss({ 'versionName': 'Second'}))

    expect(emulator.scripts('scripts/get_item.cdc', string('test-item-id-3'))).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.FanTopToken.Item', {
            itemId: string('test-item-id-3'),
            version: uint32(2),
            mintedCount: uint32(1),
            limit: uint32(1),
            active: bool(true),
            versions: dicaa([{
                key: uint32(1), value: struct('A.f8d6e0586b0a20c7.FanTopToken.ItemData', {
                    version: uint32(1),
                    originSerialNumber: uint32(1),
                    metadata: dicss({ 'versionName': 'First'})
                })
            }, {
                key: uint32(2), value: struct('A.f8d6e0586b0a20c7.FanTopToken.ItemData', {
                    version: uint32(2),
                    originSerialNumber: uint32(2),
                    metadata: dicss({ 'versionName': 'Second'})
                })
            }])
        })
    ))
})

// メタデータはバージョンを遡って更新できない
test('Metadata cannot be updated retroactively', () => {
    emulator.createItem({itemId: 'test-item-id-4', version: 5, limit: 1, metadata: { 'versionName': 'Five' }})

    expect(() =>
        emulator.transactions('transactions/operator/update_item_metadata.cdc', string('test-item-id-4'), uint32(4), dicss({ 'versionName': 'Four' }))
    ).toThrow('Version must be greater than or equal to the current version')
})

// OperatorでないユーザーはItemのmetadataを更新できない
test('Non-Operator users cannot update Item metadata', () => {
    const itemId = 'test-item-id-5'
    emulator.createItem({itemId, version: 1, limit: 1 })

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/operator/update_item_metadata.cdc', string(itemId), uint32(1), dicss({ 'exInfo': 'metadata from other user' }))
    ).toThrow('error: pre-condition failed: Roles not given cannot be borrowed')
})
