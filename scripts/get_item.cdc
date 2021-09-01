import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(itemId: String): FanTopToken.Item? {
    return FanTopToken.getItem(itemId)
}
