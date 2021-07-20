import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(itemId: String): DigitalContentAsset.Item? {
    return DigitalContentAsset.getItem(itemId)
}
