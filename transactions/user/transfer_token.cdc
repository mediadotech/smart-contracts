import FanTopToken from "../../contracts/FanTopToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

transaction(id: UInt64, to: Address) {
    let transferToken: @NonFungibleToken.NFT

    prepare(from: AuthAccount) {
        let fromRef = from.borrow<&FanTopToken.Collection>(from: FanTopToken.collectionStoragePath)!
        self.transferToken <- fromRef.withdraw(withdrawID: id)
    }

    execute {
        let toRef = getAccount(to).getCapability(FanTopToken.collectionPublicPath).borrow<&{FanTopToken.CollectionPublic}>()!
        toRef.deposit(token: <- self.transferToken)
    }
}
