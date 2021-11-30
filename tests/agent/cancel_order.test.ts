import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { address, dicss, string, uint32, uint64, event, events, json, array, optional, int, bool } from "../__fixtures__/args"
import { accounts } from '../../flow.json'
import prepareOrder from "../__fixtures__/prepare-order"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.signer('agent').transactions('transactions/permission/v2a/init_permission_receiver.cdc')

    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts['emulator-account'].address))
    emulator.transactions('transactions/admin/add_operator.cdc', address(accounts['emulator-account'].address))
    emulator.transactions('transactions/admin/add_minter.cdc', address(accounts['emulator-account'].address))
    emulator.transactions('transactions/admin/add_agent.cdc', address(accounts['agent'].address))
    emulator.createItem({ itemId: 'test-item-id-1', version: 1, limit: 1000 })
})

afterAll(() => {
    emulator?.terminate()
})

// Agentはユーザーのオーダーをキャンセルできる
test('Agent can cancel user\'s order', async () => {
    let order = await prepareOrder({ emulator, account: 'emulator-user-1'})

    expect(
        emulator.signer('agent').transactions('transactions/agent/cancel_order.cdc', string(order.orderId))
    ).toEqual({
        authorizers: '[f3fcd2c1a78f5eee]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopMarket.SellOrderCancelled', {
                agent: address(accounts.agent.address),
                from: address(accounts["emulator-user-1"].address),
                orderId: string(order.orderId),
                refId: string(order.refId),
                nftId: uint64(order.nftId),
                version: uint32(order.version),
                metadata: dicss({})
            })
        ),
        id: expect.any(String),
        payer: 'f3fcd2c1a78f5eee',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator.scripts('scripts/get_sell_order.cdc', string(order.orderId))).toEqual(optional(null))
    expect(emulator.scripts('scripts/contains_nft_id.cdc', uint64(order.nftId))).toEqual(bool(false))
    expect(emulator.scripts('scripts/contains_ref_id.cdc', string(order.refId))).toEqual(bool(false))
})

// 存在しないオーダーはキャンセルできない
test('Orders that do not exist cannot be canceled', () => {
    expect(() =>
        emulator.signer('agent').transactions('transactions/agent/cancel_order.cdc', string('non-exists'))
    ).toThrowError('error: pre-condition failed: Orders that do not exist cannot be canceled')
})

// Agentではない者はオーダーをキャンセルできない
test('Non-Agents cannot cancel orders', async () => {
    let order = await prepareOrder({ emulator, account: 'emulator-user-1'})
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/agent/cancel_order.cdc', string(order.orderId))
    ).toThrowError('error: panic: No agent in storage')
})
