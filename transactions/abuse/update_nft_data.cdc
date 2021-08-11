import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction(address: Address, nftID: UInt64) {
    prepare(account: AuthAccount) {}

    execute {
        let collectionRef = getAccount(address).getCapability(DigitalContentAsset.collectionPublicPath).borrow<&{DigitalContentAsset.CollectionPublic}>()!
        let tokenRef = collectionRef.borrowDCAToken(id: nftID)!
        tokenRef.getData().getMetadata().insert(key: "injected", "injected!!")
    }
}
