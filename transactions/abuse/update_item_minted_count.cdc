import FanTopToken from "../../contracts/FanTopToken.cdc"

transaction(itemId: String, mintedCount: UInt32) {
    prepare(account: AuthAccount) {}

    execute {
        let item = FanTopToken.getItem(itemId)!
        item.mintedCount = mintedCount
    }
}
