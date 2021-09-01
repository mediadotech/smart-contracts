import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(recipient: Address, refId: String, itemId: String, metadata: { String: String }) {
    let minterRef: &FanTopPermission.Minter
    let collectionRef: &{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minterRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowMinter(by: account)
            ?? panic("No minter in storage")
        self.collectionRef = getAccount(recipient).getCapability<&{FanTopToken.CollectionPublic}>(FanTopToken.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the FanTopToken collection")
    }

    execute {
        let item = FanTopToken.getItem(itemId) ?? panic("That itemId does not exist")

        let itemId = itemId
        let itemVersion = item.version

        let token <- self.minterRef.mintToken(
            refId: refId,
            itemId: itemId,
            itemVersion: itemVersion,
            metadata: metadata
        )

        self.collectionRef.deposit(token: <-token)
    }
}
