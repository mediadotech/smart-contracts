import { createEmulator, FlowEmulator } from "./__fixtures__/emulator"
import { accounts } from '../flow.json'
import { address, dicaa, dicss, int, string, uint32 } from "./__fixtures__/args"
import prepareOrder, { TEST_ITEM_ID_1 } from "./__fixtures__/prepare-order"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator({ useDocker: true })
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/user/init_account.cdc')

    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.signer('agent').transactions('transactions/permission/v2a/init_permission_receiver.cdc')

    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
    emulator.transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-account"].address))
    emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-account"].address))
    emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["agent"].address))

    emulator.createItem({ itemId: TEST_ITEM_ID_1, version:1, limit: 1000 })
})

afterAll(() => {
    emulator?.terminate()
})

var orders = []
afterEach(() => {
    if (!emulator) {
        return
    }
    // cancel all
    for (const order of orders) {
        emulator.signer('agent').transactions('transactions/agent/cancel_order.cdc', string(order.orderId))
    }
    orders = []
})

// ユーザーが一つのlistに3つオーダーを追加するとカウントは3つになる
test('If the user adds 3 orders to one list, the count will be 3', () => {
    orders = [
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' })
    ]
    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([{
        key: int(0), value: int(3)
    }]))
})

// 3つのListに2つのオーダーを追加するとカウントは1,1,0になる
test('Adding 2 orders to 3 Lists will count 1,1,0', () => {
    emulator.transactions('transactions/admin/extend_market_capacity.cdc', int(3))
    orders = [
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' }),
    ]
    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([
        { key: int(0), value: int(1) },
        { key: int(1), value: int(1) },
        { key: int(2), value: int(0) }
    ]))
})

// 3つのListに4つのオーダーを追加するとカウントは2,1,1になる
test('Adding 4 orders to 3 Lists will count 2,1,1', () => {
    orders = [
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' }),
        prepareOrder({ emulator, account: 'emulator-user-1' }),
    ]
    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([
        { key: int(0), value: int(2) },
        { key: int(1), value: int(1) },
        { key: int(2), value: int(1) }
    ]))
})

// オーダーは最も数が少ないListに追加される
test('Orders are added to the list with the lowest count', () => {
    const order1 = prepareOrder({ emulator, account: 'emulator-user-1' })
    const order2 = prepareOrder({ emulator, account: 'emulator-user-1' })
    const order3 = prepareOrder({ emulator, account: 'emulator-user-1' })

    emulator.signer('agent').transactions('transactions/agent/cancel_order.cdc', string(order2.orderId))
    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([
        { key: int(0), value: int(1) },
        { key: int(1), value: int(0) }, // minimum list
        { key: int(2), value: int(1) }
    ]))

    const order4 = prepareOrder({ emulator, account: 'emulator-user-1' })

    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([
        { key: int(0), value: int(1) },
        { key: int(1), value: int(1) }, // added
        { key: int(2), value: int(1) }
    ]))

    orders = [order1, order3, order4]
})

// オーダーをアップデートするときは平坦化する
test('Flatten when updating orders', () => {
    const order1 = prepareOrder({ emulator, account: 'emulator-user-1' })
    const order2 = prepareOrder({ emulator, account: 'emulator-user-1' })
    const order3 = prepareOrder({ emulator, account: 'emulator-user-1' })
    const order4 = prepareOrder({ emulator, account: 'emulator-user-1' })

    // 2, 1, 1

    emulator.signer('agent').transactions(
        'transactions/agent/cancel_order.cdc', string(order2.orderId)
    )

    // 2, 0, 1

    emulator.signer('agent').transactions(
        'transactions/agent/update_order.cdc', string(order4.orderId), uint32(2), dicss({})
    )

    // 1, 1, 1

    expect(emulator.scripts('scripts/get_sell_order_list_counts.cdc')).toEqual(dicaa([
        { key: int(0), value: int(1) },
        { key: int(1), value: int(1) },
        { key: int(2), value: int(1) }
    ]))

    orders = [order1, order3, order4]
})
