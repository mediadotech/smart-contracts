import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

// arg: [["ref-id-1", "item-id-1", { "exInfo": "info per token" }], ... ]
transaction(recipient: Address, args: [[AnyStruct]]) {
    let minterRef: &DCAPermission.Minter
    let collectionRef: &{DigitalContentAsset.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minterRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowMinter(by: account)
            ?? panic("No minter in storage")
        self.collectionRef = getAccount(recipient).getCapability<&{DigitalContentAsset.CollectionPublic}>(DigitalContentAsset.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the DCA collection")
    }

    execute {
        let refIds: [String] = []
        for arg in args {
            let refId = arg[0] as! String
            let itemId = arg[1] as! String
            let metadata = arg.length == 3 ? arg[2] as! {String: String} : {}

            assert(!refIds.contains(refId), message: "NFT with duplicate refId is not issued")

            let item = DigitalContentAsset.getItem(itemId) ?? panic("That itemId does not exist")
            let itemVersion = item.version

            let token <- self.minterRef.mintToken(
                refId: refId,
                itemId: itemId,
                itemVersion: itemVersion,
                metadata: metadata
            )
            self.collectionRef.deposit(token: <-token)

            refIds.append(refId)
        }
    }
}
