import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-account').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
})

afterAll(() => {
    emulator?.terminate()
})

beforeEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
    emulator?.signer('emulator-user-2').transactions('transactions/permission/v2a/init_permission_receiver.cdc')
})

afterEach(() => {
    emulator?.signer('emulator-user-1').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
    emulator?.signer('emulator-user-2').transactions('transactions/permission/v2a/destroy_permission_receiver.cdc')
})

// AdminはAgentを削除できる
test('Admin can remove Agent', () => {
    emulator.transactions('transactions/admin/add_agent.cdc', address(accounts["emulator-user-1"].address))

    expect(
        emulator.transactions('transactions/admin/remove_agent.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: string("agent")
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("agent"))
    ).toEqual(bool(false))
})

// AdminではないユーザーはAgentを削除できない
test('Non-Admin users cannot remove Agent', () => {
    expect(() =>
        emulator.signer("emulator-user-2").transactions('transactions/admin/remove_agent.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('FanTopPermissionV2a.hasPermission(by.address, role: role)')
})

// Adminは重複してAgentを削除できない
test('Owner cannot delete Agent more than once', () => {
    expect(() =>
        emulator.transactions('transactions/admin/remove_agent.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
})
