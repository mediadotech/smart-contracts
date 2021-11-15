import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(receiver: Address) {
    let ownerRef: &FanTopPermissionV2a.Owner
    let receiverRef: &AnyResource{FanTopPermissionV2a.Receiver}

    prepare(owner: AuthAccount) {
        self.ownerRef = owner.borrow<&FanTopPermissionV2a.Owner>(from: FanTopPermissionV2a.ownerStoragePath)
            ?? panic("No owner resource in storage")
        self.receiverRef = getAccount(receiver).getCapability(FanTopPermissionV2a.receiverPublicPath).borrow<&AnyResource{FanTopPermissionV2a.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.ownerRef.addAdmin(receiver: self.receiverRef)
    }
}
