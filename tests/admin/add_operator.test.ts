import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicsa, event, events, optional, string } from "../__fixtures__/args"

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

// AdminはOperatorを追加できる
test('Admin can add Operator', () => {
    expect(
        emulator.transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2a.PermissionAdded', {
                target: address(accounts["emulator-user-1"].address),
                role: string("operator")
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/get_permission.cdc', address(accounts["emulator-user-1"].address))
    ).toEqual(optional(
        dicsa({
            operator: bool(true)
        })
    ))
})

// AdminではないユーザーはOperatorを追加できない
test('Non-Admin users cannot add Operator', () => {
    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-user-1"].address))
    ).toThrowError('FanTopPermissionV2a.hasPermission(by.address, role: role)')
})

// Adminは既存のOperatorを追加できない
test('Admin cannot add an existing Operator', () => {
    emulator.transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-user-2"].address))

    expect(() =>
        emulator.transactions('transactions/admin/add_operator.cdc', address(accounts["emulator-user-2"].address))
    ).toThrowError('error: pre-condition failed: Permission that already exists cannot be added')
})
