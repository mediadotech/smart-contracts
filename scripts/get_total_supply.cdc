import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(): UInt64 {
    return FanTopToken.totalSupply
}
