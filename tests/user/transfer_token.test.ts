import { string, uint32, uint64, address, dicss, json, array, optional, resource, struct, events, event } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'

const MINTER_ADDRESS = accounts["emulator-account"].address
const USER1_ADDRESS = accounts["emulator-user-1"].address
const USER2_ADDRESS = accounts["emulator-user-2"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()

    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))

    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/user/init_account.cdc')

    emulator.createItem({
        itemId: 'test-item-id-1', version: 1, limit: 10, metadata: {}
    })
})

afterAll(() => {
    emulator?.terminate()
})

// ユーザーは別のユーザーにNFTを譲渡することができる
test('A user can transfer an NFT to another user', async () => {
    emulator.transactions('transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id-1'),
        string('test-item-id-1'),
        dicss({})
    )

    expect(emulator.signer('emulator-user-1').transactions(
        'transactions/user/transfer_token.cdc',
        uint64(1),
        address(USER2_ADDRESS)
    )).toEqual({
        authorizers: expect.any(String),
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopToken.Withdraw', {
                id: uint64(1),
                from: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64(1),
                to: optional(address(USER2_ADDRESS))
            })
        ),
        id: expect.any(String),
        payer: USER1_ADDRESS,
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator.scripts(
        'scripts/get_tokens.cdc',
        address(USER1_ADDRESS)
    )).toEqual({ type: 'Array', value: []})

    expect(
        emulator.scripts('scripts/get_tokens.cdc', address(USER2_ADDRESS))
    ).toEqual(
        array([
            optional(
                resource('A.f8d6e0586b0a20c7.FanTopToken.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(1),
                refId: string('test-ref-id-1'),
                data: struct('A.f8d6e0586b0a20c7.FanTopToken.NFTData', {
                    serialNumber: uint32(1),
                    itemId: string('test-item-id-1'),
                    itemVersion: uint32(1),
                    metadata: dicss({})
                })
            })
            )
        ])
    )
})

// ユーザーは存在しないユーザーにNFTを譲渡することはできない
test('Users cannot transfer NFTs to non-existent users', async () => {
    emulator.transactions('transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id-2'),
        string('test-item-id-1'),
        dicss({})
    )

    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/user/transfer_token.cdc',
            uint64(1), address('0x0000000000000000')
        )
    ).toThrow('That withdrawID does not exist')

    const result2 = emulator.scripts(
        'scripts/get_tokens.cdc',
        address(USER1_ADDRESS)
    )
    expect(result2).toEqual(array([
        optional(
            resource('A.f8d6e0586b0a20c7.FanTopToken.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(2),
                refId: string('test-ref-id-2'),
                data: struct('A.f8d6e0586b0a20c7.FanTopToken.NFTData', {
                    serialNumber: uint32(2),
                    itemId: string('test-item-id-1'),
                    itemVersion: uint32(1),
                    metadata: dicss({})
                })
            })
        )
    ]))
})

// ユーザーは所有していないNFTを他人に譲渡することはできない
test('Users cannot transfer NFTs they do not own to others', async () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/user/transfer_token.cdc',
            uint64(123), address('0x0000000000000000')
        )
    ).toThrow('That withdrawID does not exist')
})
