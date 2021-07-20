import { string, uint32, uint64, address, dicss, json, array, optional, resource, struct } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address
const USER2_ADDRESS = '0x' + flowConfig.accounts["emulator-user-2"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()

    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))

    emulator!.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-1')
    emulator!.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-2')

    emulator.createItem({
        itemId: 'test-item-id-1', version: 1, limit: 10, metadata: {}
    })
})

afterAll(() => {
    emulator?.terminate()
})

test('transfer_token succeeds', async () => {
    emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
        --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-1'), string('test-item-id-1'), dicss({})])}'
    `)

    expect(emulator!.exec(`flow transactions send transactions/user/transfer_token.cdc \
        --args-json '${json([uint64(1), address(USER2_ADDRESS)])}' \
        --signer emulator-user-1
    `)).toEqual({
        authorizers: expect.any(String),
        events: [{
            index: 0,
            type: 'A.f8d6e0586b0a20c7.DigitalContentAsset.Withdraw',
            values: {
                type: 'Event',
                value: {
                    fields: [
                        { name: 'id', value: { type: 'UInt64', value: '1'} },
                        { name: 'from', value: { type: 'Optional', value: { type: 'Address', value: USER1_ADDRESS} } }
                    ],
                    id: 'A.f8d6e0586b0a20c7.DigitalContentAsset.Withdraw'
                }
            },
        }, {
            index: 1,
            type: 'A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit',
            values: {
                type: 'Event',
                value: {
                    fields: [
                        { name: 'id', value: { type: 'UInt64', value: '1'} },
                        { name: 'to', value: { type: 'Optional', value: { type: 'Address', value: USER2_ADDRESS} } }
                    ],
                    id: 'A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit'
                }
            }
        }],
        id: expect.any(String),
        payer: USER1_ADDRESS.slice(2),
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator!.exec(`flow scripts execute scripts/get_tokens.cdc \
        --args-json '${json([address(USER1_ADDRESS)])}'
    `)).toEqual({ type: 'Array', value: []})

    expect(emulator!.exec(`flow scripts execute scripts/get_tokens.cdc \
        --args-json '${json([address(USER2_ADDRESS)])}'
    `)).toEqual({ type: 'Array', value: [{
        type: 'Optional',
        value: {
            type: 'Resource',
            value: {
                fields: [
                    { name: 'uuid', value: { type: 'UInt64', value: expect.any(String) } },
                    { name: 'id', value: { type: 'UInt64', value: '1' }},
                    { name: 'refId', value: { type: 'String', value: 'test-ref-id-1' }},
                    { name: 'data', value: {
                        type: 'Struct', value: {
                            fields: [
                                { name: 'serialNumber', value: { type: 'UInt32', value: '1' } },
                                { name: 'itemId', value: { type: 'String', value: 'test-item-id-1' } },
                                { name: 'itemVersion', value: { type: 'UInt32', value: '1' } },
                                { name: 'metadata', value: { type: 'Dictionary', value: [] } },
                            ],
                            id: 'A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData'
                        }
                    }},
                ],
                id: 'A.f8d6e0586b0a20c7.DigitalContentAsset.NFT'
            }
        }
    }]})
})

test('transfer_token fails with non-existent address', async () => {
    emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
        --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-2'), string('test-item-id-1'), dicss({})])}'
    `)

    expect(() =>
        emulator!.exec(`flow transactions send transactions/user/transfer_token.cdc \
            --args-json '${json([uint64(1), address('0x0000000000000000')])}' \
            --signer emulator-user-1
        `)
    ).toThrow('That withdrawID does not exist')

    const result2 = emulator!.exec(`flow scripts execute scripts/get_tokens.cdc \
        --args-json '${json([address(USER1_ADDRESS)])}'
    `)
    expect(result2).toEqual(array([
        optional(
            resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(2),
                refId: string('test-ref-id-2'),
                data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
                    serialNumber: uint32(2),
                    itemId: string('test-item-id-1'),
                    itemVersion: uint32(1),
                    metadata: dicss({})
                })
            })
        )
    ]))
})
