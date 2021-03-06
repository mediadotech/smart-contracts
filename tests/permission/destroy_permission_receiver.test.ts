import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
})

// PermissionHolderは破棄することができる
test('PermissionHolder can be destroyed', () => {
    expect(
        emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    ).toBeTruthy()
})


// 重複してPermissionHolderを破棄することはできない
test('PermissionHolder cannot be destroyed more than once', () => {
    emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    ).toThrowError('error: panic: The account does not have a permission holder.')
})
