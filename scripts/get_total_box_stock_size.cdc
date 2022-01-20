import FanTopToken from "../contracts/FanTopToken.cdc"
import FanTopSerial from "../contracts/FanTopSerial.cdc"

pub fun main(): Int {
    var count = 0

    for itemId in FanTopToken.getItemIds() {
        if let box = FanTopSerial.getBoxRef(itemId: itemId) {
            count = count + box.getStock().length
        }
    }

    return count
}
