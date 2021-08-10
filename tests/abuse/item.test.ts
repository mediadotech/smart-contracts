import { address, array, bool, dicaa, dicss, json, optional, string, struct, uint32 } from "../utils/args"
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

// 直接Itemを書き換えることはできない
test('Item cannot be rewritten directly', async () => {
    emulator.createItem({itemId: 'test-item-id-1', version: 5, limit: 10, metadata: {itemName: 'Test Item 1@v5'}})

    emulator.signer('emulator-user-1').transactions(
        'transactions/abuse/inject_item_version.cdc',
        string('test-item-id-1'),
        uint32(4),
        dicss({
            itemName: 'Test Item 1@v4 (injected!!)'
        }),
        uint32(10000)
    )

    expect(
        emulator.scripts('scripts/get_items.cdc')
    ).toEqual(array([
        struct('A.f8d6e0586b0a20c7.DigitalContentAsset.Item', {
            itemId: string('test-item-id-1'),
            versions: dicaa([{key: uint32(5), value:
                struct('A.f8d6e0586b0a20c7.DigitalContentAsset.ItemData', {
                    version: uint32(5),
                    metadata: dicss({ itemName: 'Test Item 1@v5' }),
                    originSerialNumber: uint32(1)
                })
            }]),
            version: uint32(5),
            mintedCount: uint32(0),
            limit: uint32(10),
            active: bool(true)
        })
    ]))
})

// 直接item.mintedCountを書き換えることはできない
test('Item.mintedCount cannot be rewritten directly', async () => {
    emulator.createItem({ itemId: 'test-item-id-2', version: 5, limit: 10, metadata: {}})

    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/abuse/update_item_minted_count.cdc',
            string('test-item-id-2'),
            uint32(10000)
        )
    ).toThrow('error: cannot assign to `mintedCount`: field has public access')

    expect(
        emulator.scripts('scripts/get_item.cdc', string('test-item-id-2'))
    ).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.DigitalContentAsset.Item', {
            itemId: string('test-item-id-2'),
            versions: dicaa([{key: uint32(5), value:
                struct('A.f8d6e0586b0a20c7.DigitalContentAsset.ItemData', {
                    version: uint32(5),
                    metadata: dicss({ }),
                    originSerialNumber: uint32(1)
                })
            }]),
            version: uint32(5),
            mintedCount: uint32(0),
            limit: uint32(10),
            active: bool(true)
        })
    ))
})
