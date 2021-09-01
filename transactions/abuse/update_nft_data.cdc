import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction(address: Address, nftID: UInt64) {
    prepare(account: AuthAccount) {}

    execute {
        let collectionRef = getAccount(address).getCapability(FanTopToken.collectionPublicPath).borrow<&{FanTopToken.CollectionPublic}>()!
        let tokenRef = collectionRef.borrowFanTopToken(id: nftID)!
        tokenRef.getData().getMetadata().insert(key: "injected", "injected!!")
    }
}
