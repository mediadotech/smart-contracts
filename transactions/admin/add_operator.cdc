import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(receiver: Address) {
    let adminRef: &DCAPermission.Admin
    let receiverRef: &AnyResource{DCAPermission.Receiver}

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
        self.receiverRef = getAccount(receiver).getCapability(DCAPermission.receiverPublicPath).borrow<&AnyResource{DCAPermission.Receiver}>()
            ?? panic("No permission receiver in storage")
    }

    execute {
        self.adminRef.addOperator(receiver: self.receiverRef)
    }
}
