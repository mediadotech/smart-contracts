import FanTopToken from "../contracts/FanTopToken.cdc"
import FanTopSerial from "../contracts/FanTopSerial.cdc"

pub fun main(itemId: String): Int {
    if let boxRef = FanTopSerial.getBoxRef(itemId: itemId) {
        return boxRef.getStock().length
    }
    return -1
}
