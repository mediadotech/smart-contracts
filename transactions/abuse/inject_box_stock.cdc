import FanTopSerial from "../../contracts/FanTopSerial.cdc"

transaction(itemId: String) {
    prepare(account: AuthAccount) {}

    execute {
        let boxRef = FanTopSerial.getBoxRef(itemId: itemId)!
        let stockRef = &boxRef.getStock() as &[UInt64]
        stockRef[0] = 0
    }
}
