import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"

transaction(id: UInt64, to: Address) {
    let transferToken: @NonFungibleToken.NFT

    prepare(from: AuthAccount) {
        let fromRef = from.borrow<&DigitalContentAsset.Collection>(from: DigitalContentAsset.collectionStoragePath)!
        self.transferToken <- fromRef.withdraw(withdrawID: id)
    }

    execute {
        let toRef = getAccount(to).getCapability(DigitalContentAsset.collectionPublicPath).borrow<&{DigitalContentAsset.CollectionPublic}>()!
        toRef.deposit(token: <- self.transferToken)
    }
}
