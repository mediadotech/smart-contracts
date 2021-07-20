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

test('Non-admin cannot rewrite items', async () => {
    emulator.createItem({itemId: 'test-item-id-1', version: 5, limit: 10, metadata: {itemName: 'Test Item 1@v5'}})

    emulator.exec(`flow transactions send transactions/abuse/inject_item_version.cdc \
        --args-json '${json([
            string('test-item-id-1'),
            uint32(4),
            dicss({
                itemName: 'Test Item 1@v4 (injected!!)'
            }),
            uint32(10000)
        ])}' \
        --signer emulator-user-1`) // bu Non-admin

    expect(
        emulator.exec(`flow scripts execute scripts/get_items.cdc`)
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

test('Non-admin cannot rewrite item.mintedCount', async () => {
    emulator.createItem({ itemId: 'test-item-id-2', version: 5, limit: 10, metadata: {}})

    expect(() =>
        emulator.exec(`flow transactions send transactions/abuse/update_item_minted_count.cdc \
            --args-json '${json([
                string('test-item-id-2'),
                uint32(10000)
            ])}' \
            --signer emulator-user-1`) // bu Non-admin
    ).toThrow('error: cannot assign to `mintedCount`: field has public access')

    expect(
        emulator.exec(`flow scripts execute scripts/get_item.cdc --arg String:test-item-id-2`)
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
