import { address, bool, dicaa, dicss, json, optional, string, struct, uint32 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const OPERATOR_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(OPERATOR_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(OPERATOR_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// AdminはItemを作ることができる
test('Operator can create Items', async () => {
    emulator.exec(`flow transactions send transactions/operator/create_item.cdc \
        --args-json '${json([string('test-item-id-1'), uint32(1), uint32(0), dicss({itemName: 'Test Item 1'}), bool(false)])}'
    `)

    expect(emulator.exec(
        'flow scripts execute scripts/get_item.cdc --arg String:test-item-id-1'
    )).toEqual(optional(struct('A.f8d6e0586b0a20c7.DigitalContentAsset.Item', {
        itemId: string('test-item-id-1'),
        versions: dicaa([
            { key: uint32(1), value: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.ItemData', {
                version: uint32(1),
                metadata: dicss({itemName: 'Test Item 1'}),
                originSerialNumber: uint32(1)
            })}
        ]),
        version: uint32(1),
        mintedCount: uint32(0),
        limit: uint32(0),
        active: bool(false)
    })))
})

// 重複して同じitemIdのItemをつくることはできない
test('Operator cannot duplicate Items with the same itemId', async () => {
    emulator.exec(`flow transactions send transactions/operator/create_item.cdc \
        --args-json '${json([string('test-item-id-2'), uint32(1), uint32(0), dicss({itemName: 'Test Item 1'}), bool(true)])}'
    `)

    expect(() =>
        emulator.exec(`flow transactions send transactions/operator/create_item.cdc \
            --args-json '${json([string('test-item-id-2'), uint32(1), uint32(0), dicss({itemName: 'Test Item 1'}), bool(true)])}'
        `)
    ).toThrow('Admin cannot create existing items')
})
