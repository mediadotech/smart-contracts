import { address, array, dicss, event, events, json, optional, string, uint32, uint64 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
    emulator.createItem({ itemId: 'test-item-1', version: 1, limit: 10, metadata: {} })
    emulator.createItem({ itemId: 'test-item-2', version: 1, limit: 30, metadata: {} })
    emulator.transactions(`transactions/user/init_account.cdc --signer emulator-user-1`)
})

afterAll(() => {
    emulator?.terminate()
})

test('batch_mint_token succeeds', async () => {
    const result = emulator!.exec(`flow transactions send transactions/minter/batch_mint_token.cdc \
        --args-json '${json([address(USER1_ADDRESS), array([
            array([string('test-ref-1'), string('test-item-1'), dicss({ exInfo: 'exInfo for test-ref-1' })]),
            array([string('test-ref-2'), string('test-item-1'), dicss({ exInfo: 'exInfo for test-ref-2' })]),
            array([string('test-ref-3'), string('test-item-2')]),
            array([string('test-ref-4'), string('test-item-2')])
        ])])}'
    `)

    expect(result).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.TokenCreated', {
                id: uint64(1),
                refId: string('test-ref-1'),
                serialNumber: uint32(1),
                itemId: string('test-item-1'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit', {
                id: uint64(1),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.TokenCreated', {
                id: uint64(2),
                refId: string('test-ref-2'),
                serialNumber: uint32(2),
                itemId: string('test-item-1'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit', {
                id: uint64(2),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.TokenCreated', {
                id: uint64(3),
                refId: string('test-ref-3'),
                serialNumber: uint32(1),
                itemId: string('test-item-2'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit', {
                id: uint64(3),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.TokenCreated', {
                id: uint64(4),
                refId: string('test-ref-4'),
                serialNumber: uint32(2),
                itemId: string('test-item-2'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.DigitalContentAsset.Deposit', {
                id: uint64(4),
                to: optional(address(USER1_ADDRESS))
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })
})

test('batch_mint_token fails with non-existent itemId', async () => {
    expect(() =>
        emulator!.exec(`flow transactions send transactions/minter/batch_mint_token.cdc \
            --args-json '${json([address(USER1_ADDRESS), array([
                array([string('test-ref-5'), string('test-item-1')]),
                array([string('test-ref-6'), string('test-item-1')]),
                array([string('test-ref-7'), string('unknown-item-id')]),
                array([string('test-ref-8'), string('unknown-item-id')])
            ])])}'
        `)
    ).toThrow('unexpectedly found nil while forcing an Optional value')
})
