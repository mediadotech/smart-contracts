import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(recipient: Address, refId: String, itemId: String, metadata: { String: String }) {
    let minterRef: &DCAPermission.Minter
    let collectionRef: &{DigitalContentAsset.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minterRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowMinter(by: account)
            ?? panic("No minter in storage")
        self.collectionRef = getAccount(recipient).getCapability<&{DigitalContentAsset.CollectionPublic}>(DigitalContentAsset.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the DCA collection")
    }

    execute {
        let item = DigitalContentAsset.getItem(itemId) ?? panic("That itemId does not exist")

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
