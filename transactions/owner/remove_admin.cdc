import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermission from "../../contracts/FanTopPermission.cdc"

transaction(receiver: Address) {
    let ownerRef: &FanTopPermission.Owner

    prepare(owner: AuthAccount) {
        self.ownerRef = owner.borrow<&FanTopPermission.Owner>(from: /storage/FanTopOwner)
            ?? panic("No owner resource in storage")
    }

    execute {
        self.ownerRef.removePermission(address: receiver, as: FanTopPermission.Role.admin)
    }
}
