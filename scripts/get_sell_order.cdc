import FanTopMarket from "../contracts/FanTopMarket.cdc"

pub fun main(orderId: String): FanTopMarket.SellOrder? {
    return FanTopMarket.getSellOrder(orderId)
}
