import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(itemId: String, active: Bool) {
    let operatorRef: &DCAPermission.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateActive(itemId: itemId, active: active)
    }
}
