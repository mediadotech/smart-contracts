import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(receiver: Address) {
    let adminRef: &DCAPermission.Admin

    prepare(account: AuthAccount) {
        self.adminRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowAdmin(by: account)
            ?? panic("No admin in storage")
    }

    execute {
        self.adminRef.removeOperator(receiver)
    }
}
