import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

// arg: [["ref-id-1", "item-id-1", { "exInfo": "info per token" }], ... ]
transaction(recipient: Address, args: [[AnyStruct]]) {
    let minterRef: &FanTopPermission.Minter
    let collectionRef: &{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minterRef = account.borrow<&FanTopPermission.Holder>(from: FanTopPermission.receiverStoragePath)?.borrowMinter(by: account)
            ?? panic("No minter in storage")
        self.collectionRef = getAccount(recipient).getCapability<&{FanTopToken.CollectionPublic}>(FanTopToken.collectionPublicPath).borrow()
            ?? panic("Cannot borrow a reference to the FanTopToken collection")
    }

    execute {
        let refIds: [String] = []
        for arg in args {
            let refId = arg[0] as! String
            let itemId = arg[1] as! String
            let metadata = arg.length == 3 ? arg[2] as! {String: String} : {}

            assert(!refIds.contains(refId), message: "NFT with duplicate refId is not issued")

            let item = FanTopToken.getItem(itemId) ?? panic("That itemId does not exist")
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
