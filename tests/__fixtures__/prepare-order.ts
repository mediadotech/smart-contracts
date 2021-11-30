import { accounts } from '../../flow.json'
import { address, arrays, dicss, int, string, uint32, uint64 } from './args'
import { FlowEmulator } from './emulator'
import { getNormarizedFlowKey, signSellOrder } from './sign-sell-order'

type AccountKey = keyof typeof accounts

export const TEST_ITEM_ID_1 = 'test-item-id-1'

let prepareCount = 1
export default async function prepareOrder({ emulator, account }: { emulator: FlowEmulator, account: AccountKey }) {
    const agent = accounts.agent.address
    const from = accounts[account].address
    const refId = `ref-id-${prepareCount}`
    const orderId = `order-id-${prepareCount}`
    const version = 1
    const metadata = []

    const nftId = emulator.mintToken({
        recipient: account,
        refId,
        itemId: TEST_ITEM_ID_1,
        metadata: {},
    })
    const key = getNormarizedFlowKey('agent')
    const { signature } = signSellOrder({
        agent,
        from,
        orderId,
        refId,
        nftId,
        version,
        metadata,
        key
    })

    emulator.signer(account).transactions(
        'transactions/user/sell_token.cdc',
        address(agent),
        string(orderId),
        string(refId),
        uint64(nftId),
        uint32(version),
        arrays(metadata),
        string(signature),
        int(key.index)
    )

    prepareCount++

    await new Promise(resolve => setTimeout(resolve, 100))

    return {
        agent,
        from,
        orderId,
        refId,
        nftId,
        version,
        metadata,
        signature
    }
}
