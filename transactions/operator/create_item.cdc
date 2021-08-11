import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"
import DCAPermission from "../../contracts/DCAPermission.cdc"

transaction(itemId: String, version: UInt32, limit: UInt32, metadata: { String: String }, active: Bool) {
    let operatorRef: &DCAPermission.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&DCAPermission.Holder>(from: DCAPermission.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.createItem(itemId: itemId, version: version, limit: limit, metadata: metadata, active: active)
    }

    post {
        DigitalContentAsset.getItem(itemId) != nil: "Item must be added"
        DigitalContentAsset.getItem(itemId)!.itemId == itemId: "itemId must match"
        DigitalContentAsset.getItem(itemId)!.limit == limit: "limit must match"
        DigitalContentAsset.getItem(itemId)!.version == version: "version must match"
        DigitalContentAsset.getItem(itemId)!.mintedCount == 0: "mintedCount must be zero"
        !DigitalContentAsset.getItem(itemId)!.isVersionLocked(): "item version must not be locked"
        equalsStringDictionary(DigitalContentAsset.getItem(itemId)!.getData().metadata, metadata): "metadata must match"
    }
}

priv fun equalsStrings(_ a: [String], _ b: [String]): Bool {
    var i = 0
    while i < a.length {
        if a[i] != b[i] {
            return false
        }
        i = i + 1
    }
    return true
}

priv fun equalsStringDictionary(_ a: {String: String}, _ b: {String: String}): Bool {
    return equalsStrings(a.keys, b.keys) && equalsStrings(a.values, b.values)
}
