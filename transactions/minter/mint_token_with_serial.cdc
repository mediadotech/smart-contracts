import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(recipient: Address, refId: String, itemId: String, metadata: { String: String }, serialNumber: UInt32) {
    let minterRef: &FanTopPermissionV2a.Minter
    let collectionRef: &{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minterRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowMinter(by: account)
            ?? panic("No minter in storage")
        self.collectionRef = getAccount(recipient).getCapability<&{FanTopToken.CollectionPublic}>(FanTopToken.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the FanTopToken collection")
    }

    execute {
        let item = FanTopToken.getItem(itemId) ?? panic("That itemId does not exist")

        let itemId = itemId
        let itemVersion = item.version

        let token <- self.minterRef.mintTokenWithSerialNumber(
            refId: refId,
            itemId: itemId,
            itemVersion: itemVersion,
            metadata: metadata,
            serialNumber: serialNumber
        )

        self.collectionRef.deposit(token: <-token)

        self.minterRef.truncateSerialBox(itemId: itemId, limit: 1)
    }
}
