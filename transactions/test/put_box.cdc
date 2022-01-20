import Test from "../../contracts/Test.cdc"

transaction(itemId: String) {
    prepare(account: AuthAccount) {}

    execute {
        Test.putBox(itemId: itemId)
    }
}
