import FanTopMarket from "../contracts/FanTopMarket.cdc"

pub fun main(nftId: UInt64): Bool {
    return FanTopMarket.containsNFTId(nftId)
}
