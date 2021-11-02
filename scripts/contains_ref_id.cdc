import FanTopMarket from "../contracts/FanTopMarket.cdc"

pub fun main(refId: String): Bool {
    return FanTopMarket.containsRefId(refId)
}
