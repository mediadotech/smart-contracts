import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2 from "../../contracts/FanTopPermissionV2.cdc"

// arg: [["ref-id-1", "item-id-1", { "exInfo": "info per token" }], ... ]
transaction(recipient: Address, args: [[AnyStruct]]) {
    let minter: FanTopPermissionV2.Minter
    let collectionRef: &{FanTopToken.CollectionPublic}

    prepare(account: AuthAccount) {
        self.minter = FanTopPermissionV2.Minter(account)
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

            let token <- self.minter.mintToken(
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
