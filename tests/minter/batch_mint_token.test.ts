import { address, array, dicss, event, events, json, optional, resource, string, struct, uint32, uint64 } from "../utils/args"
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
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterAll(() => {
    emulator?.terminate()
})

afterEach(() => {
    emulator.signer('emulator-user-1').transactions('transactions/user/destroy_account.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
})

// Minterは複数のNFTを一度にmintすることができる
test('Minter can mint multiple NFTs at once', async () => {
    const result = emulator.transactions(
        'transactions/minter/batch_mint_token.cdc',
        address(USER1_ADDRESS),
        array([
            array([string('test-ref-1'), string('test-item-1'), dicss({ exInfo: 'exInfo for test-ref-1' })]),
            array([string('test-ref-2'), string('test-item-1'), dicss({ exInfo: 'exInfo for test-ref-2' })]),
            array([string('test-ref-3'), string('test-item-2')]),
            array([string('test-ref-4'), string('test-item-2')])
        ])
    )

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

    expect(
        emulator.scripts('scripts/get_tokens.cdc', address(USER1_ADDRESS))
    ).toEqual(
        array([
            optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(1),
                refId: string('test-ref-1'),
                data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
                    serialNumber: uint32(1),
                    itemId: string('test-item-1'),
                    itemVersion: uint32(1),
                    metadata: dicss({
                        'exInfo': 'exInfo for test-ref-1'
                    })
                })
            })),
            optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(2),
                refId: string('test-ref-2'),
                data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
                    serialNumber: uint32(2),
                    itemId: string('test-item-1'),
                    itemVersion: uint32(1),
                    metadata: dicss({
                        'exInfo': 'exInfo for test-ref-2'
                    })
                })
            })),
            optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(3),
                refId: string('test-ref-3'),
                data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
                    serialNumber: uint32(1),
                    itemId: string('test-item-2'),
                    itemVersion: uint32(1),
                    metadata: dicss({})
                })
            })),
            optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
                uuid: uint64(expect.any(String)),
                id: uint64(4),
                refId: string('test-ref-4'),
                data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
                    serialNumber: uint32(2),
                    itemId: string('test-item-2'),
                    itemVersion: uint32(1),
                    metadata: dicss({})
                })
            }))
        ])
    )
})

// 存在しないitemIdを含んでいる場合はすべてのmintが失敗する
test('All mint fails if it contains an itemId that does not exist', async () => {
    expect(() =>
        emulator.transactions(
            'transactions/minter/batch_mint_token.cdc',
            address(USER1_ADDRESS),
            array([
                array([string('test-ref-5'), string('test-item-1')]),
                array([string('test-ref-6'), string('test-item-1')]),
                array([string('test-ref-7'), string('unknown-item-id')]),
                array([string('test-ref-8'), string('unknown-item-id')])
            ])
        )
    ).toThrow('error: panic: That itemId does not exist')
})

// mint中にlimitを超過した場合はすべてのmintが失敗する
test('If limit is exceeded during mint, all mint will fail', async () => {
    const itemId = 'test-item-id-3'
    emulator.createItem({ itemId, version: 1, limit: 2 })
    expect(() =>
        emulator.transactions(
            'transactions/minter/batch_mint_token.cdc',
            address(USER1_ADDRESS),
            array([
                array([string('test-ref-9'), string(itemId)]),
                array([string('test-ref-10'), string(itemId)]),
                array([string('test-ref-11'), string(itemId)]),
                array([string('test-ref-12'), string(itemId)])
            ])
        )
    ).toThrow('error: pre-condition failed: Fulfilled items cannot be mint')

    expect(
        emulator.scripts('scripts/get_tokens.cdc', address(USER1_ADDRESS))
    ).toEqual(array([]))
})

// Minterでないユーザーはmintすることができない
test('Non-Minter users cannot mint', () => {
    const itemId = 'test-item-id-4'
    emulator.createItem({ itemId, version: 1, limit: 2 })

    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/batch_mint_token.cdc',
            address(USER1_ADDRESS),
            array([
                array([string('test-ref-13'), string(itemId)]),
            ])
        )
    ).toThrow('error: pre-condition failed: Roles not given cannot be borrowed')
})
