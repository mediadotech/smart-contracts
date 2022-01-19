import { address, array, bool, dicss, int, string, uint32 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address
const USER1_ADDRESS = '0x' + flowConfig.accounts["emulator-user-1"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))
})

afterAll(() => {
    emulator?.terminate()
})

// シリアル番号なしでmintするとboxは生成されない
test('Box is not generated when mint without a serial number', async () => {
    const itemId = 'test-item-id-1'
    emulator.createItem({ itemId, version: 1, limit: 10, metadata: {} })

    const result = emulator.transactions(
        'transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({})
    )

    expect(result.events[0].values.value.fields[2]).toEqual({
        name: 'serialNumber', value: uint32(1)
    })

    expect(emulator.scripts('scripts/has_box.cdc', string(itemId))).toEqual(bool(false))
})

// シリアル番号を使用してmintするとboxが生成される
test('Box is generated when mint using serial number', async () => {
    const itemId = 'test-item-id-2'
    emulator.createItem({ itemId, version: 1, limit: 10, metadata: {} })

    const result = emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(2)
    )

    expect(result.events[0].values.value.fields[2]).toEqual({
        name: 'serialNumber', value: uint32(2)
    })

    expect(emulator.scripts('scripts/has_box.cdc', string(itemId))).toEqual(bool(true))
})


// シリアル番号なしでmintしたあとにシリアル番号ありでmintできる
test('Token can be mint with serial number after mint without serial number', async () => {
    const itemId = 'test-item-id-3'
    emulator.createItem({ itemId, version: 1, limit: 10, metadata: {} })
    emulator.transactions(
        'transactions/minter/mint_token.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({})
    )
    emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(3)
    )
    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(0), string('xoxoooooooxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')])
    )
})

// シリアル番号ありでmintしたあとにシリアル番号なしでmintできない
test('Token cannot be mint without serial number after mint with serial number', () => {
    const itemId = 'test-item-id-4'
    emulator.createItem({ itemId, version: 1, limit: 10, metadata: {} })
    emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(1)
    )
    expect(() =>
        emulator.transactions(
            'transactions/minter/mint_token.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id'),
            string(itemId),
            dicss({})
        )
    ).toThrowError('pre-condition failed: Items with box cannot be mint without serial number')
    expect(emulator.scripts('scripts/get_box_stock_info.cdc', string(itemId))).toEqual(
        array([uint32(0), string('xoooooooooxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')])
    )
})

// 重複したシリアル番号でmintできない
test('Token cannot be mint with duplicate serial number', () => {
    const itemId = 'test-item-id-5'
    emulator.createItem({ itemId, version: 1, limit: 10, metadata: {} })

    emulator.transactions(
        'transactions/minter/mint_token_with_serial.cdc',
        address(USER1_ADDRESS),
        string('test-ref-id'),
        string(itemId),
        dicss({}),
        uint32(7)
    )

    expect(() =>
        emulator.transactions(
            'transactions/minter/mint_token_with_serial.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id'),
            string(itemId),
            dicss({}),
            uint32(7)
        )
    ).toThrowError('pre-condition failed: Only serial number that are in stock can be used')
})

// box sizeを超えるシリアル番号ではmintできない
test('Token cannot be mint with a serial number larger than box size', () => {
    const itemId = 'test-item-id-6'
    emulator.createItem({ itemId, version: 1, limit: 100, metadata: {} })

    expect(() =>
        emulator.transactions(
            'transactions/minter/mint_token_with_serial.cdc',
            address(USER1_ADDRESS),
            string('test-ref-id'),
            string(itemId),
            dicss({}),
            uint32(101)
        )
    ).toThrowError('pre-condition failed: Serial numbers that exceed size are not available')
})
