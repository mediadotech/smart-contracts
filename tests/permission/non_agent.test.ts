import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, string } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
})

afterAll(() => {
    emulator?.terminate()
})

// ロールを与えられていないユーザーはAgentとして活動できない
test('Users who are not given the role cannot act as Agent', () => {
    // As an Agent
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/agent/cancel_order.cdc', string('test-order-id'))
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.agent)')
})

// ロールを削除されたユーザーはAgentとして活動できない
test('User whose role has been deleted cannot act as Agent', () => {
    emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-1"].address))
    emulator.transactions('transactions/admin/remove_agent.cdc', address(accounts["emulator-user-1"].address))

    // As an Agent
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/agent/cancel_order.cdc', string('test-order-id'))
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.agent)')
})
