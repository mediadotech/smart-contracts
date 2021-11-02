import { address, array, dicss, event, events, json, optional, resource, string, struct, uint32, uint64 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// MinterはNFTをmintできる
test('Minter can mint NFT', async () => {
    emulator.createItem({ itemId: 'test-item-for-mint-token', version: 1, limit: 10, metadata: {} })

    const result = emulator.transactions(
        'transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-for-mint-token'),
        dicss({exInfo: "Additional per-mint info"})
    )

    expect(result).toEqual({
        authorizers: expect.any(String),
        events: events(
            event(expect.stringContaining('.FanTopToken.TokenCreated'), {
                id: uint64(expect.any(String)),
                refId: string('test-ref-id-1'),
                serialNumber: uint32(1),
                itemId: string('test-item-for-mint-token'),
                itemVersion: uint32(1)
            }),
            event(expect.stringContaining('FanTopToken.Deposit'),{
                id: uint64(expect.any(String)),
                to: optional(address(expect.any(String)))
            })
        ),
        id: expect.any(String),
        payer: expect.any(String),
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/get_tokens.cdc', address(USER1_ADDRESS)
    )).toEqual(array([optional(resource('A.f8d6e0586b0a20c7.FanTopToken.NFT', {
        uuid: uint64(expect.any(String)),
        id: uint64(1),
        refId: string('test-ref-id-1'),
        data: struct('A.f8d6e0586b0a20c7.FanTopToken.NFTData', {
            serialNumber: uint32(1),
            itemId: string('test-item-for-mint-token'),
            itemVersion: uint32(1),
            metadata: dicss({ exInfo: 'Additional per-mint info' })
        })
    }))]))
})

// Minterは存在しないitemIdのNFTをmintできない
test('Minter cannot mint NFT for non-existent itemId', async () => {
    expect(() =>
        emulator.transactions(
            'transactions/minter/mint_token.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id-2'),
            string('unknown-item-id'),
            dicss({})
        )
    ).toThrow('error: panic: That itemId does not exist')
})

// Minterはlimitを超過したitemのNFTをmintできない
test('Minter cannot mint NFTs for items that exceed the limit', async () => {
    emulator.createItem({ itemId: 'test-item-for-limit', version: 1, limit: 1, metadata: {} })
    emulator.transactions(
        'transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-for-limit'),
        dicss({})
    )

    expect(() =>
        emulator.transactions(
            'transactions/minter/mint_token.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id-2'),
            string('test-item-for-limit'),
            dicss({})
        )
    ).toThrow('Fulfilled items cannot be mint')
})

// MinterではないユーザーはNFTをmintできない
test('Non-Minter users can\'t mint NFT', () => {
    emulator.createItem({ itemId: 'test-item-for-non-minter', version: 1, limit: 1, metadata: {} })
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/mint_token.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id-2'),
            string('test-item-for-non-minter'),
            dicss({})
        )
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.minter)')
})
