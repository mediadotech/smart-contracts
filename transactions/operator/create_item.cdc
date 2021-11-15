import FanTopToken from "../../contracts/FanTopToken.cdc"
import FanTopPermissionV2a from "../../contracts/FanTopPermissionV2a.cdc"

transaction(itemId: String, version: UInt32, limit: UInt32, metadata: { String: String }, active: Bool) {
    let operatorRef: &FanTopPermissionV2a.Operator

    prepare(account: AuthAccount) {
        self.operatorRef = account.borrow<&FanTopPermissionV2a.Holder>(from: FanTopPermissionV2a.receiverStoragePath)?.borrowOperator(by: account)
            ?? panic("No operator in storage")
    }

    execute {
        self.operatorRef.createItem(itemId: itemId, version: version, limit: limit, metadata: metadata, active: active)
    }

    post {
        FanTopToken.getItem(itemId) != nil: "Item must be added"
        FanTopToken.getItem(itemId)!.itemId == itemId: "itemId must match"
        FanTopToken.getItem(itemId)!.limit == limit: "limit must match"
        FanTopToken.getItem(itemId)!.version == version: "version must match"
        FanTopToken.getItem(itemId)!.mintedCount == 0: "mintedCount must be zero"
        !FanTopToken.getItem(itemId)!.isVersionLocked(): "item version must not be locked"
        equalsStringDictionary(FanTopToken.getItem(itemId)!.getData().getMetadata(), metadata): "metadata must match"
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
