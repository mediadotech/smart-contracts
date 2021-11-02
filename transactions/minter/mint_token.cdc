import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

transaction(recipient: Address, refId: String, itemId: String, metadata: { String: String }) {
    let minter: FanTopPermissionV2.Minter
    let collectionRef: &{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minter = FanTopPermissionV2.Minter(account)
        self.collectionRef = getAccount(recipient).getCapability<&{FanTopToken.CollectionPublic}>(FanTopToken.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the FanTopToken collection")
    }

    execute {
        let item = FanTopToken.getItem(itemId) ?? panic("That itemId does not exist")

        let itemId = itemId
        let itemVersion = item.version

        let token <- self.minter.mintToken(
            refId: refId,
            itemId: itemId,
            itemVersion: itemVersion,
            metadata: metadata
        )

        self.collectionRef.deposit(token: <-token)
    }
}
