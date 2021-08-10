import { createEmulator, FlowEmulator } from "../utils/emulator"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// 誰でもPermissionHolderを初期化することができる
test('Anyone can initialize PermissionHolder', () => {
    expect(
        emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    ).toBeTruthy()
})


// 重複してPermissionHolderを初期化することはできない
test('PermissionHolder cannot be initialized more than once', () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    ).toThrowError('error: panic: The account has already been initialized.')
})
