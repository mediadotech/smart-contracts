import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
})

afterAll(() => {
    emulator?.terminate()
})

// Operatorは自身を失効させることができる
test('Operator can revoke itself', () => {
    expect(
        emulator.signer('emulator-user-1').transactions('transactions/operator/revoke_operator.cdc')
    ).toEqual({
        authorizers: '[01cf0e2f2f715450]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionRemoved', {
                target: address(accounts["emulator-user-1"].address),
                role: string("operator")
            })
        ),
        id: expect.any(String),
        payer: '01cf0e2f2f715450',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(
        emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
    ).toEqual(bool(false))
})

// Operatorではない者は自身を失効できない
test('Non-Operators cannot revoke themselves', () => {
    expect(() =>
        emulator.signer('emulator-user-2').transactions('transactions/operator/revoke_operator.cdc')
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.operator)')
})
