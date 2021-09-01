import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(receiver: Address) {
    let ownerRef: &FanTopPermission.Owner
    let receiverRef: &AnyResource{FanTopPermission.Receiver}

    prepare(owner: AuthAccount) {
        self.ownerRef = owner.borrow<&FanTopPermission.Owner>(from: /storage/FanTopOwner)
            ?? panic("No owner resource in storage")
        self.receiverRef = getAccount(receiver).getCapability(FanTopPermission.receiverPublicPath).borrow<&AnyResource{FanTopPermission.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.ownerRef.addAdmin(receiver: self.receiverRef)
    }
}
