import DigitalContentAsset from "../contracts/DigitalContentAsset.cdc"

pub fun main(): [DigitalContentAsset.Item] {
    let items: [DigitalContentAsset.Item] = []
    for id in DigitalContentAsset.getItemIds() {
        items.append(DigitalContentAsset.getItem(id)!)
    }
    return items
}
