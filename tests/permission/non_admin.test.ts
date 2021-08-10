import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'
import { address } from "../utils/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-2').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterEach(() => {
    try { emulator.signer('emulator-user-1').transactions('transactions/permission/destroy_permission_receiver.cdc') } catch {}
    try { emulator.signer('emulator-user-2').transactions('transactions/permission/destroy_permission_receiver.cdc') } catch {}
})

// ロールを与えられていないユーザーはAdminとして活動できない
test('Users who are not given the role cannot act as Admin', () => {
    // As an Admin
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/add_minter.cdc', address(flowConfig.accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})

// ロールを削除されたユーザーはAdminとして活動できない
test('User whose role has been deleted cannot act as Admin', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.transactions('transactions/owner/remove_admin.cdc', address(flowConfig.accounts["emulator-user-1"].address))

    // As an Admin
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/add_minter.cdc', address(flowConfig.accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Roles without permission cannot be used')
})
