import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(itemId: String): [UInt32] {
    return DigitalContentAsset.getItem(itemId)!.versions.keys
}
