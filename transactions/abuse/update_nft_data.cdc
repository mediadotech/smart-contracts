import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction(address: Address, nftID: UInt64) {
    prepare(account: AuthAccount) {}

    execute {
        let collectionRef = getAccount(address).getCapability(/public/DCACollection).borrow<&{DigitalContentAsset.CollectionPublic}>()!
        let tokenRef = collectionRef.borrowDCAToken(id: nftID)!
        tokenRef.getData().metadata.insert(key: "injected", "injected!!")
    }
}
