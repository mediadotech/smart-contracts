import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, mintedCount: UInt32) {
    let owner: &FanTopPermissionV2a.Owner

    prepare(account: AuthAccount) {
        self.owner = account.borrow<&FanTopPermissionV2a.Owner>(from: FanTopPermissionV2a.ownerStoragePath)
            ?? panic("No owner resource in storage")
    }

    execute {
        self.owner.setItemMintedCount(itemId: itemId, mintedCount: mintedCount)
    }
}
