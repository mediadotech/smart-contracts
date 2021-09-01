import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction(itemId: String, key: String, value: String) {
    prepare(account: AuthAccount) {}

    execute {
        let item = FanTopToken.getItem(itemId)
        let metadata = FanTopToken.getItem(itemId)!.getData().getMetadata()
        metadata.insert(key: key, value)
    }
}
