import Test from "../../contracts/Test.cdc"

transaction(itemId: String, start: UInt32, end: UInt32) {
    prepare(account: AuthAccount) {}

    execute {
        Test.getBoxTester(itemId: itemId).fill(start: start, end: end)
    }
}
