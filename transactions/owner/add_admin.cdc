import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(receiver: Address) {
    let ownerRef: &DCAPermission.Owner
    let receiverRef: &AnyResource{DCAPermission.Receiver}

    prepare(owner: AuthAccount) {
        self.ownerRef = owner.borrow<&DCAPermission.Owner>(from: /storage/DCAOwner)
            ?? panic("No owner resource in storage")
        self.receiverRef = getAccount(receiver).getCapability(DCAPermission.receiverPublicPath).borrow<&AnyResource{DCAPermission.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.ownerRef.addAdmin(receiver: self.receiverRef)
    }
}
