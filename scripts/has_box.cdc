import FanTopSerial from "../contracts/FanTopSerial.cdc"

pub fun main(itemId: String): Bool {
    return FanTopSerial.hasBox(itemId: itemId)
}
