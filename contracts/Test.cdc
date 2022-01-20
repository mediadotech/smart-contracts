import Signature from "./Signature.cdc"
import FanTopSerial from "./FanTopSerial.cdc"
import FanTopToken from "./FanTopToken.cdc"

// Emulator only
pub contract Test {
    pub fun verifySignature(
        signature: [UInt8],
        signedData: [UInt8],
        account: PublicAccount,
        keyIndex: Int
    ): Bool {
        return Signature.verify(
            signature: signature,
            signedData: signedData,
            account: account,
            keyIndex: keyIndex
        )
    }

    pub fun getBoxTester(itemId: String): BoxTester {
        let boxRef = FanTopSerial.getBoxRef(itemId: itemId)!
        return BoxTester(boxRef)
    }

    pub fun putBox(itemId: String) {
        let item = FanTopToken.getItem(itemId)!
        let box = FanTopSerial.Box(size: item.limit, pickTo: item.mintedCount)
        FanTopSerial.putBox(box, itemId: itemId)
    }

    pub struct BoxTester {
        pub let boxRef: &FanTopSerial.Box
        init(_ boxRef: &FanTopSerial.Box) {
            self.boxRef = boxRef
        }
        pub fun pick(_ serialNumber: UInt32) {
            self.boxRef.pick(serialNumber)
        }
        pub fun truncate(limit: Int): Int {
            return self.boxRef.truncate(limit: limit)
        }
        pub fun fill(start: UInt32, end: UInt32) {
            var i = start
            while i <= end {
                self.boxRef.pick(i)
                i = i + 1
            }
        }
    }
}
