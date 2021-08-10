import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(receiver: Address) {
    let ownerRef: &DCAPermission.Owner

    prepare(owner: AuthAccount) {
        self.ownerRef = owner.borrow<&DCAPermission.Owner>(from: /storage/DCAOwner)
            ?? panic("No owner resource in storage")
    }

    execute {
        self.ownerRef.removePermission(address: receiver, as: DCAPermission.Role.operator)
    }
}
