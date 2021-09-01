import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction(itemId: String, version: UInt32, metadata: { String: String }, originSerialNumber: UInt32) {
    prepare(account: AuthAccount) {}

    execute {
        let data = FanTopToken.ItemData(version: version, metadata: metadata, originSerialNumber: 100)
        FanTopToken.getItem(itemId)?.getVersions()?.insert(key: version, data)
    }
}
