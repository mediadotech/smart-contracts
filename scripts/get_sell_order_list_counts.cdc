import FanTopMarket from "../contracts/FanTopMarket.cdc"

pub fun main(): { Int: Int } {
    let counts = {} as { Int: Int }
    let size = FanTopMarket.getCapacity()
    var i = 0
    while i < size {
        counts[i] = FanTopMarket.getCountOfOrders(index: i)
        i = i + 1
    }
    return counts
}
