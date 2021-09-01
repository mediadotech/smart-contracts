import { createEmulator, FlowEmulator } from "../utils/emulator"
import { accounts } from '../../flow.json'
import { address, event, events, optional, uint8 } from "../utils/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.signer('emulator-account').transactions('transactions/permission/init_permission_receiver.cdc')
    emulator.signer('emulator-user-1').transactions('transactions/permission/init_permission_receiver.cdc')
})

afterAll(() => {
    emulator?.terminate()
})

// OwnerはMinterを削除できる
test('Owner can remove Minter', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(accounts["emulator-account"].address))
    emulator.transactions('transactions/admin/add_minter.cdc', address(accounts["emulator-user-1"].address))

    expect(
        emulator.transactions('transactions/owner/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermission.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: uint8(3) // minter
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/get_permission.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual(optional(null))
})

// OwnerではないユーザーはMinterを削除できない
test('Non-Owner users cannot remove Minter', () => {
    expect(() =>
        emulator.signer("emulator-user-2").transactions('transactions/owner/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: panic: No owner resource in storage')
})

// Ownerは重複してMinterを削除できない
test('Owner cannot delete Minter more than once', () => {
    expect(() =>
        emulator.transactions('transactions/owner/remove_minter.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('error: pre-condition failed: Roles that do not exist cannot be removed')
})
