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

// AdminはMinterを削除できる
test('Admin can remove Minter', () => {
    emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-1"].address))

    expect(
        emulator.transactions('transactions/admin/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: string("minter")
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
    ).toEqual(bool(false))
})

// AdminではないユーザーはMinterを削除できない
test('Non-Admin users cannot remove Minter', () => {
    expect(() =>
        emulator.signer("emulator-user-2").transactions('transactions/admin/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('FanTopPermissionV2a.hasPermission(by.address, role: role)')
})

// Adminは重複してMinterを削除できない
test('Owner cannot delete Minter more than once', () => {
    expect(() =>
        emulator.transactions('transactions/admin/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
})
