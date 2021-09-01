import FanTopToken from "../contracts/FanTopToken.cdc"

pub fun main(): [FanTopToken.Item] {
    let items: [FanTopToken.Item] = []
    for id in FanTopToken.getItemIds() {
        items.append(FanTopToken.getItem(id)!)
    }
    return items
}
