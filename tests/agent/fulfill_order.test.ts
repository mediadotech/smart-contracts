import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { address, dicss, string, uint32, uint64, event, events, json, array, optional, resource, struct } from "../__fixtures__/args"
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

// エージェントは注文を履行できる
test('Agent can fulfill order', async () => {
    const order = prepareOrder({ emulator, account: 'emulator-user-1' })
    expect(
        emulator.signer('agent').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string(order.orderId),
            uint32(order.version)
        )
    ).toEqual({
        authorizers: '[f3fcd2c1a78f5eee]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopToken.Withdraw', {
                id: uint64(order.nftId),
                from: optional(address(order.from))
            }),
            event('A.f8d6e0586b0a20c7.FanTopToken.Deposit', {
                id: uint64(order.nftId),
                to: optional(address(accounts["emulator-user-2"].address))
            }),
            event('A.f8d6e0586b0a20c7.FanTopMarket.SellOrderFulfilled', {
                agent: address(accounts.agent.address),
                orderId: string(order.orderId),
                refId: string(order.refId),
                nftId: uint64(order.nftId),
                from: address(order.from),
                to: address(accounts["emulator-user-2"].address),
                metadata: dicss(order.metadata)
            })
        ),
        id: expect.any(String),
        payer: 'f3fcd2c1a78f5eee',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator.scripts('scripts/get_sell_order.cdc', string(order.orderId))).toEqual(optional(null))
    expect(emulator.scripts('scripts/get_token.cdc',
        address(accounts["emulator-user-2"].address),
        uint64(order.nftId)
    )).toEqual(optional(optional(
        resource('A.f8d6e0586b0a20c7.FanTopToken.NFT', {
            uuid: expect.anything(),
            id: uint64(order.nftId),
            refId: string(order.refId),
            data: struct('A.f8d6e0586b0a20c7.FanTopToken.NFTData', {
                serialNumber: uint32(1),
                itemId: string('test-item-id-1'),
                itemVersion: uint32(order.version),
                metadata: dicss(order.metadata)
            })
        })
    )))
})

// 存在しない注文は履行できない
test('Orders that do not exist cannot be fulfilled', () => {
    expect(() =>
        emulator.signer('agent').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string('non-exists-order-id'),
            uint32(123)
        )
    ).toThrowError('error: pre-condition failed: Cannot fulfill non-existent order')
})

// バージョンが一致していない注文は履行できない
test('Orders that do not match versions cannot be fulfilled', () => {
    const order = prepareOrder({ emulator, account: 'emulator-user-1' })
    const olderVersion = order.version - 1
    expect(() =>
        emulator.signer('agent').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string(order.orderId),
            uint32(olderVersion)
        )
    ).toThrowError('error: panic: Orders with mismatched versions cannot be purchased')
})

// Agentでない者は注文を履行できない
test('Non-Agent cannot fulfill order', () => {
    const order = prepareOrder({ emulator, account: 'emulator-user-1' })
    expect(() =>
        emulator.signer('emulator-user-2').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string(order.orderId),
            uint32(order.version)
        )
    ).toThrowError('error: panic: No agent in storage')
})

// 注文後にNFTが消滅したオーダーは履行できない
test('Orders for which NFTs have disappeared after the order cannot be fulfilled', () => {
    const order = prepareOrder({ emulator, account: 'emulator-user-1' })

    emulator.signer('emulator-user-1').transactions('transactions/user/transfer_token.cdc', uint64(order.nftId), address(accounts["emulator-user-2"].address))

    expect(() =>
        emulator.signer('agent').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string(order.orderId),
            uint32(order.version)
        )
    ).toThrowError('error: panic: Invalid order cannot be purchased')
})

// 注文後にコレクションが消滅したオーダーは履行できない
test('Orders whose collection has disappeared after the order cannot be fulfilled', () => {
    const order = prepareOrder({ emulator, account: 'emulator-user-1' })

    emulator.signer('emulator-user-1').transactions('transactions/user/destroy_account.cdc')

    expect(() =>
        emulator.signer('agent').transactions('transactions/agent/fulfill_order.cdc',
            address(accounts["emulator-user-2"].address),
            string(order.orderId),
            uint32(order.version)
        )
    ).toThrowError('error: panic: Invalid order cannot be purchased')
})
