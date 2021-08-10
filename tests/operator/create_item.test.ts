import { address, bool, dicaa, dicss, json, optional, string, struct, uint32 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'

const OPERATOR_ADDRESS = accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(OPERATOR_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(OPERATOR_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// OperatorはItemを作ることができる
test('Operator can create Items', async () => {
    emulator.transactions(
        'transactions/operator/create_item.cdc',
        string('test-item-id-1'),
        uint32(1),
        uint32(0),
        dicss({itemName: 'Test Item 1'}),
        bool(false)
    )

    expect(emulator.scripts(
        'scripts/get_item.cdc',
        string('test-item-id-1')
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

// OperatorではないユーザーはItemを作ることができない
test('Operator can create Items', async () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/operator/create_item.cdc',
            string('test-item-id-10'),
            uint32(1),
            uint32(0),
            dicss({itemName: 'Test Item 1'}),
            bool(false)
        )
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})

// 重複して同じitemIdのItemをつくることはできない
test('Users who are not Operators cannot create Items', async () => {
    emulator.transactions(
        'transactions/operator/create_item.cdc',
        string('test-item-id-2'),
        uint32(1),
        uint32(0),
        dicss({itemName: 'Test Item 1'}),
        bool(true)
    )

    expect(() =>
        emulator.transactions(
            'transactions/operator/create_item.cdc',
            string('test-item-id-2'),
            uint32(1),
            uint32(0),
            dicss({itemName: 'Test Item 1'}),
            bool(true)
        )
    ).toThrow('Admin cannot create existing items')
})
