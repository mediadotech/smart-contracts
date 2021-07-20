import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(): UInt64 {
    return DigitalContentAsset.totalSupply
}