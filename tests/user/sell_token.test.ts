import { createEmulator, FlowEmulator } from '../__fixtures__/emulator'
import { address, dicss, string, uint32, uint64, event, events, json, array, optional, int, struct, bool } from '../__fixtures__/args'
import { accounts } from '../../flow.json'
import { signSellOrder, getNormarizedFlowKey, AccountKey } from '../__fixtures__/sign-sell-order'

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator({ useDocker: true })
    emulator.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-1')
    emulator.transactions('transactions/owner/add_permission.cdc', address(accounts['emulator-account'].address), string('operator'))
    emulator.transactions('transactions/owner/add_permission.cdc', address(accounts['emulator-account'].address), string('minter'))
    emulator.transactions('transactions/owner/add_permission.cdc', address(accounts['agent'].address), string('agent'))

    emulator.createItem({
        itemId: 'test-item-id-1',
        version: 1,
        limit: 1000
    })
})

afterAll(() => {
    emulator?.terminate()
})

let mintCount = 1
function mint(account: AccountKey) {
    const refId = `ref-id-${mintCount}`
    const nftId = emulator.mintToken({
        recipient: account, refId, itemId: 'test-item-id-1', metadata: {}
    })
    mintCount++
    return {
        nftId, refId
    }
}

// ユーザーは所有するNFTを販売できる
test('Users can sell owned NFTs', async () => {
    const key = getNormarizedFlowKey('agent')
    const { refId, nftId } = mint('emulator-user-1')
    const { signature, params: { agent, orderId, version, metadata } } = signSellOrder({
        agent: accounts['agent'].address,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-1',
        refId, nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })

    expect(
        emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
            address(agent),
            string(orderId),
            string(refId),
            uint64(nftId),
            uint32(version),
            dicss(metadata),
            string(signature),
            int(key.index)
        )
    ).toEqual({
        authorizers: '[01cf0e2f2f715450]',
        events: events(
            event(expect.stringContaining('.FanTopMarket.SellOrderAdded'), {
                agent: address('0xf3fcd2c1a78f5eee'),
                from: address('0x01cf0e2f2f715450'),
                orderId: string(orderId),
                refId: string(refId),
                nftId: uint64(nftId),
                version: uint32(version),
                metadata: dicss(metadata)
            }),
        ),
        id: expect.any(String),
        payer: '01cf0e2f2f715450',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/get_sell_order.cdc', string(orderId))
    ).toEqual(optional(
        struct('A.f8d6e0586b0a20c7.FanTopMarket.SellOrder', {
            orderId: string(orderId),
            capability: expect.anything(),
            refId: string(refId),
            nftId: uint64(nftId),
            version: uint32(version),
            metadata: dicss(metadata)
        })
    ))
    expect(emulator.scripts('scripts/contains_nft_id.cdc', uint64(nftId))).toEqual(bool(true))
    expect(emulator.scripts('scripts/contains_ref_id.cdc', string(refId))).toEqual(bool(true))
})

// ユーザーは自分が所有していないNFTを販売できない
test('Users cannot sell NFTs they do not own', () => {
    const key = getNormarizedFlowKey('agent')
    const refId = 'ref-id-2' // dummy
    const nftId = 2 // dummy
    const { signature, params: { agent, orderId, version, metadata } } = signSellOrder({
        agent: accounts['agent'].address,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-2',
        refId, nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
            address(agent),
            string(orderId),
            string(refId),
            uint64(nftId),
            uint32(version),
            dicss(metadata),
            string(signature),
            int(key.index)
        )
    ).toThrowError('a')

    expect(
        emulator.scripts('scripts/get_sell_order.cdc', string(orderId))
    ).toEqual(optional(
        null
    ))
})

// オーダーIDは重複できない
test('Order ID cannot be duplicated', () => {
    const key = getNormarizedFlowKey('agent')
    const minted1 = mint('emulator-user-1')
    const minted2 = mint('emulator-user-1')

    const agent = accounts['agent'].address
    const order1 = signSellOrder({
        agent,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-3',
        refId: minted1.refId,
        nftId: minted1.nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })
    const order2 = signSellOrder({
        agent,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-3', // duplicated
        refId: minted2.refId,
        nftId: minted2.nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })

    emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
        address(agent),
        string(order1.params.orderId),
        string(minted1.refId),
        uint64(minted1.nftId),
        uint32(order1.params.version),
        dicss(order1.params.metadata),
        string(order1.signature),
        int(key.index)
    )

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
            address(agent),
            string(order2.params.orderId),
            string(minted2.refId),
            uint64(minted2.nftId),
            uint32(order2.params.version),
            dicss(order2.params.metadata),
            string(order2.signature),
            int(key.index)
        )
    ).toThrowError('error: pre-condition failed: Cannot add a SellOrder that already exists')
})

// 出品するNFTは重複できない
test('NFTs to be listed cannot be duplicated', () => {
    const key = getNormarizedFlowKey('agent')
    const minted = mint('emulator-user-1')

    const agent = accounts['agent'].address
    const order1 = signSellOrder({
        agent,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-4',
        refId: minted.refId,
        nftId: minted.nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })
    const order2 = signSellOrder({
        agent,
        from: accounts['emulator-user-1'].address,
        orderId: 'order-id-5',
        refId: minted.refId,
        nftId: minted.nftId,
        version: 1,
        metadata: { price: '123 JPY', exInfo: 'Test' },
        key
    })

    emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
        address(agent),
        string(order1.params.orderId),
        string(minted.refId),
        uint64(minted.nftId),
        uint32(order1.params.version),
        dicss(order1.params.metadata),
        string(order1.signature),
        int(key.index)
    )

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/user/sell_token.cdc',
            address(agent),
            string(order2.params.orderId),
            string(minted.refId),
            uint64(minted.nftId),
            uint32(order2.params.version),
            dicss(order2.params.metadata),
            string(order2.signature),
            int(key.index)
        )
    ).toThrowError('error: pre-condition failed: Cannot add a SellOrder with duplicate refId')
})
