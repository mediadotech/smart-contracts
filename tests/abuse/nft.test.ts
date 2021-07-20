import { address, array, dicaa, dicss, json, optional, resource, string, struct, uint32, uint64 } from "../utils/args"
import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'

const MINTER_ADDRESS = '0x' + flowConfig.accounts["emulator-account"].address

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_operator.cdc', address(MINTER_ADDRESS))
    emulator.transactions('transactions/admin/add_minter.cdc', address(MINTER_ADDRESS))

    emulator.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-1')
    emulator.exec('flow transactions send transactions/user/init_account.cdc --signer emulator-user-2')
    emulator.createItem({
        itemId: 'test-item-id-1', version: 1, limit: 10, metadata: {}
    })
})

afterAll(() => {
    emulator?.terminate()
})

function mint(user: keyof typeof flowConfig.accounts, refId: string): number {
    const targetAddress = '0x' + flowConfig.accounts[user].address
    let result = emulator!.exec(`flow transactions send transactions/minter/mint_token.cdc \
        --args-json '${json([address(targetAddress), string(refId), string('test-item-id-1'), dicss({})])}'
    `)
    if (result.error) {
        throw new Error(result.error)
    }
    const nftID = Number(result.events[0].values.value.fields[0].value.value)
    return nftID
}

test('User cannot rewrite NFT of others', () => {
    const nftID = mint('emulator-user-1', 'test-ref-id-1')

    const ownerAddress = '0x' + flowConfig.accounts["emulator-user-1"].address

    expect(
        emulator.exec(`flow transactions send transactions/abuse/update_nft_data.cdc \
            --args-json '${json([address(ownerAddress), uint64(nftID)])}' \
            --signer emulator-user-2
        `).error
    ).toBeUndefined()

    expect(
        emulator.exec(`flow scripts execute scripts/get_token.cdc --arg Address:${ownerAddress} --arg UInt64:${nftID}`)
    ).toEqual(optional(optional(resource('A.f8d6e0586b0a20c7.DigitalContentAsset.NFT', {
        uuid: uint64(expect.any(String)),
        id: uint64(1),
        refId: string('test-ref-id-1'),
        data: struct('A.f8d6e0586b0a20c7.DigitalContentAsset.NFTData', {
            serialNumber: uint32(1),
            itemId: string('test-item-id-1'),
            itemVersion: uint32(1),
            metadata: dicss({})
        })
    }))))
})
