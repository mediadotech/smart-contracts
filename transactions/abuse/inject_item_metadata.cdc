import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction(itemId: String, key: String, value: String) {
    prepare(account: AuthAccount) {}

    execute {
        let item = DigitalContentAsset.getItem(itemId)
        let metadata = DigitalContentAsset.getItem(itemId)!.getData().getMetadata()
        metadata.insert(key: key, value)
    }
}
