import { address, array, dicaa, dicss, json, optional, resource, string, struct, uint32, uint64 } from "../__fixtures__/args"
import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

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

function mint(user: keyof typeof flowConfig.accounts, refId: string): number {
    const targetAddress = '0x' + flowConfig.accounts[user].address
    let result = emulator.transactions(
        'transactions/minter/mint_token.cdc',
        address(targetAddress),
        string(refId),
        string('test-item-id-1'),
        dicss({})
    )
    const nftID = Number(result.events[0].values.value.fields[0].value.value)
    return nftID
}

// ユーザーは他者のNFTを書き換えることはできない
test('Users cannot rewrite NFTs of others', () => {
    const nftID = mint('emulator-user-1', 'test-ref-id-1')

    const ownerAddress = '0x' + flowConfig.accounts["emulator-user-1"].address

    expect(() =>
        emulator.signer('emulator-user-2').transactions(
            'transactions/abuse/update_nft_data.cdc',
            address(ownerAddress),
            uint64(nftID)
        )
    ).not.toThrowError()

    expect(
        emulator.scripts('scripts/get_token.cdc', address(ownerAddress), uint64(nftID))
    ).toEqual(optional(optional(resource('A.f8d6e0586b0a20c7.FanTopToken.NFT', {
        uuid: uint64(expect.any(String)),
        id: uint64(1),
        refId: string('test-ref-id-1'),
        data: struct('A.f8d6e0586b0a20c7.FanTopToken.NFTData', {
            serialNumber: uint32(1),
            itemId: string('test-item-id-1'),
            itemVersion: uint32(1),
            metadata: dicss({})
        })
    }))))
})
