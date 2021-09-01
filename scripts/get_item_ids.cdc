import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(): [String] {
    return FanTopToken.getItemIds()
}
