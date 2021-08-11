import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(itemId: String, limit: UInt32) {
    let operatorRef: &DCAPermission.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.updateLimit(itemId: itemId, limit: limit)
    }
}
