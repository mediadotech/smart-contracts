import { address, array, dicss, event, events, json, optional, resource, string, struct, uint32, uint64 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions(`transactions/user/init_account.cdc --signer emulator-user-1`)
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

test('mint_token succeeds', async () => {
    emulator.createItem({ itemId: 'test-item-for-mint-token', version: 1, limit: 10, metadata: {} })

    const result = emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
        --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-1'), string('test-item-for-mint-token'), dicss({exInfo: "Additional per-mint info"})])}'
    `)

    expect(result).toEqual({
        authorizers: expect.any(String),
        events: events(
            event(expect.stringContaining('.DigitalContentAsset.TokenCreated'), {
                id: uint64(expect.any(String)),
                refId: string('test-ref-id-1'),
                serialNumber: uint32(1),
                itemId: string('test-item-for-mint-token'),
                itemVersion: uint32(1)
            }),
            event(expect.stringContaining('DigitalContentAsset.Deposit'),{
                id: uint64(expect.any(String)),
                to: optional(address(expect.any(String)))
            })
        ),
        id: expect.any(String),
        payer: expect.any(String),
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator!.exec(
        `flow scripts execute scripts/get_tokens.cdc --arg Address:${USER1_ADDRESS}`
    )).toEqual(array([optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
        uuid: uint64(expect.any(String)),
        id: uint64(1),
        refId: string('test-ref-id-1'),
        data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
            serialNumber: uint32(1),
            itemId: string('test-item-for-mint-token'),
            itemVersion: uint32(1),
            metadata: dicss({ exInfo: 'Additional per-mint info' })
        })
    }))]))
})

test('mint_token fails with non-existent itemId', async () => {
    expect(() =>
        emulator.exec(`flow transactions send transactions/minter/mint_token.cdc \
            --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-2'), string('unknown-item-id'), dicss({})])}'
        `)
    ).toThrow('unexpectedly found nil while forcing an Optional value')
})

test('mint_token fails if limit exceeded', async () => {
    emulator.createItem({ itemId: 'test-item-for-limit', version: 1, limit: 1, metadata: {} })
    emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
        --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-1'), string('test-item-for-limit'), dicss({})])}'
    `)

    expect(() =>
        emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
            --args-json '${json([address(USER1_ADDRESS), string('test-ref-id-2'), string('test-item-for-limit'), dicss({})])}'
        `)
    ).toThrow('Fulfilled items cannot be mint')
})
