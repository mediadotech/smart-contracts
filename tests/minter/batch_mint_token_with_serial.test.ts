import { address, array, dicss, event, events, optional, string, uint32, uint64On18652 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
    emulator.createItem({ itemId: 'test-item-1', version: 1, limit: 10, metadata: {} })
    emulator.createItem({ itemId: 'test-item-2', version: 1, limit: 30, metadata: {} })
    emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
})

afterEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/user/destroy_account.cdc')
})

// Minterはシリアル番号付きで複数のNFTを一度にmintすることができる
test('Minter can mint multiple NFTs at once with serial numbers', async () => {
    const result = emulator.transactions(
        'transactions/minter/batch_mint_token.cdc',
        address(USER1_ADDRESS),
        array([
            array([string('test-ref-1'), string('test-item-1'), dicss({}), uint32(1)]),
            array([string('test-ref-2'), string('test-item-1'), dicss({}), uint32(2)]),
            array([string('test-ref-3'), string('test-item-2'), dicss({}), uint32(2)]),
            array([string('test-ref-4'), string('test-item-2'), dicss({}), uint32(1)])
        ])
    )

    expect(result).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopToken.TokenCreated', {
                id: uint64On18652(1),
                refId: string('test-ref-1'),
                serialNumber: uint32(1),
                itemId: string('test-item-1'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64On18652(1),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.TokenCreated', {
                id: uint64On18652(2),
                refId: string('test-ref-2'),
                serialNumber: uint32(2),
                itemId: string('test-item-1'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64On18652(2),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.TokenCreated', {
                id: uint64On18652(3),
                refId: string('test-ref-3'),
                serialNumber: uint32(2),
                itemId: string('test-item-2'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64On18652(3),
                to: optional(address(USER1_ADDRESS))
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.TokenCreated', {
                id: uint64On18652(4),
                refId: string('test-ref-4'),
                serialNumber: uint32(1),
                itemId: string('test-item-2'),
                itemVersion: uint32(1)
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64On18652(4),
                to: optional(address(USER1_ADDRESS))
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })
})

// 重複したシリアル番号を指定した場合はすべてのmintが失敗する
test('All mint fails if duplicate serial numbers are specified', async () => {
    expect(() =>
        emulator.transactions(
            'transactions/minter/batch_mint_token.cdc',
            address(USER1_ADDRESS),
            array([
                array([string('test-ref-5'), string('test-item-1'), dicss({}), uint32(3)]),
                array([string('test-ref-6'), string('test-item-1'), dicss({}), uint32(4)]),
                array([string('test-ref-7'), string('test-item-1'), dicss({}), uint32(5)]),
                array([string('test-ref-8'), string('test-item-1'), dicss({}), uint32(5)])
            ])
        )
    ).toThrow('pre-condition failed: Only serial number that are in stock can be used')
})

// 一度にtruncateされるのは1つまで
test('Only one stock is truncate per mint', async () => {
    const itemId = 'test-item-id-3'
    emulator.createItem({ itemId, version: 1, limit: 65 })
    emulator.transactions('transactions/test/put_box.cdc', string(itemId))
    emulator.withOptions('--gas-limit', '9999').transactions('transactions/test/fill_box.cdc', string(itemId), uint32(1), uint32(64))

    emulator.transactions(
        'transactions/minter/batch_mint_token.cdc',
        address(USER1_ADDRESS),
        array([
            array([string('test-ref-65'), string(itemId), dicss({}), uint32(65)])
        ])
    )

    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(1), string('x'.repeat(64))])
    )
})
