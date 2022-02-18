import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

// arg: [["item-id-1", 1234], ... ]
transaction(args: [[AnyStruct]]) {
    let owner: &FanTopPermissionV2a.Owner

    prepare(account: AuthAccount) {
        self.owner = account.borrow<&FanTopPermissionV2a.Owner>(from: FanTopPermissionV2a.ownerStoragePath)
            ?? panic("No owner resource in storage")
    }

    execute {
        for arg in args {
            let itemId = arg[0] as! String
            let mintedCount = arg[1] as! UInt32
            self.owner.setItemMintedCount(itemId: itemId, mintedCount: mintedCount)
        }
    }
}
