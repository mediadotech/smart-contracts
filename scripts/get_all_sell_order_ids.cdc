import FanTopMarket from "../contracts/FanTopMarket.cdc"

pub fun main(): [String] {
    return FanTopMarket.getSellOrderIds()
}
