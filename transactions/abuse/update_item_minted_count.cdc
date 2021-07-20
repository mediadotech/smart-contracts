import DigitalContentAsset from "../../contracts/DigitalContentAsset.cdc"

transaction(itemId: String, mintedCount: UInt32) {
    prepare(account: AuthAccount) {}

    execute {
        let item = DigitalContentAsset.getItem(itemId)!
        item.mintedCount = mintedCount
    }
}
