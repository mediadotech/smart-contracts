import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(itemId: String): [UInt32] {
    return FanTopToken.getItem(itemId)!.getVersions().keys
}
