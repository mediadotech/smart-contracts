import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction(itemId: String, version: UInt32, metadata: { String: String }, originSerialNumber: UInt32) {
    prepare(account: AuthAccount) {}

    execute {
        let data = DigitalContentAsset.ItemData(version: version, metadata: metadata, originSerialNumber: 100)
        DigitalContentAsset.getItem(itemId)?.versions?.insert(key: version, data)
    }
}
