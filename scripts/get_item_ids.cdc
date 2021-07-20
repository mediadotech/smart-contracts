import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(): [String] {
    return DigitalContentAsset.getItemIds()
}
