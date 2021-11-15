import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { address, dicss, string, uint32, uint64, event, events, json, array, optional, int, struct } from "../__fixtures__/args"
import { accounts } from '../../flow.json'
import prepareOrder from "../__fixtures__/prepare-order"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator({ useDocker: true })
    emulator.signer('emulator-user-1').transactions('transactions/user/init_account.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/user/init_account.cdc')

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

// Agentはオーダーのメタデータを更新することができる
test('Agent can update order metadata', async () => {
    let order = prepareOrder({ emulator, account: 'emulator-user-1'})

    const nextVersion = order.version + 1
    const nextMetadata = { exInfo: 'Updated to ' + nextVersion }
    expect(
        emulator.signer('agent').transactions(
            'transactions/agent/update_order.cdc',
            string(order.orderId),
            uint32(nextVersion),
            dicss(nextMetadata)
        )
    ).toEqual({
        authorizers: '[f3fcd2c1a78f5eee]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopMarket.SellOrderUpdated', {
                agent: address(accounts.agent.address),
                from: address(accounts["emulator-user-1"].address),
                orderId: string(order.orderId),
                refId: string(order.refId),
                nftId: uint64(order.nftId),
                version: uint32(nextVersion),
                metadata: dicss(nextMetadata)
            })
        ),
        id: expect.any(String),
        payer: 'f3fcd2c1a78f5eee',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator.scripts('scripts/get_sell_order.cdc', string(order.orderId))).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.FanTopMarket.SellOrder', {
            orderId: string(order.orderId),
            capability: expect.anything(),
            refId: string(order.refId),
            nftId: uint64(order.nftId),
            version: uint32(nextVersion),
            metadata: dicss(nextMetadata)
        })
    ))
})

// 同じバージョンでアップデートはできない
test('Cannot be updated with the same version', async () => {
    let order = prepareOrder({ emulator, account: 'emulator-user-1'})

    expect(() =>
        emulator.signer('agent').transactions(
            'transactions/agent/update_order.cdc',
            string(order.orderId),
            uint32(order.version), // same version
            dicss({ exInfo: 'Updated to ' + order.version })
        )
    ).toThrowError('error: panic: Order cannot be updated without upgrading the version')

    expect(emulator.scripts('scripts/get_sell_order.cdc', string(order.orderId))).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.FanTopMarket.SellOrder', {
            orderId: string(order.orderId),
            capability: expect.anything(),
            refId: string(order.refId),
            nftId: uint64(order.nftId),
            version: uint32(order.version),
            metadata: dicss(order.metadata)
        })
    ))
})

// 存在しないオーダーはアップデートできない
test('Orders that do not exist cannot be updated', () => {
    expect(() =>
        emulator.signer('agent').transactions(
            'transactions/agent/update_order.cdc',
            string('non-exists-order-id'),
            uint32(1), // same version
            dicss({ })
        )
    ).toThrowError('error: pre-condition failed: Cannot update non-existent order')
})

// Agentではない者はオーダーをアップデートできない
test('Non-Agents cannot update orders', () => {
    let order = prepareOrder({ emulator, account: 'emulator-user-1'})

    const nextVersion = order.version + 1
    const nextMetadata = { exInfo: 'Updated to ' + nextVersion }
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/agent/update_order.cdc',
            string(order.orderId),
            uint32(nextVersion),
            dicss(nextMetadata)
        )
    ).toThrowError('error: panic: No agent in storage')
})
