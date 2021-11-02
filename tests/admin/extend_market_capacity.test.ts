import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, dicaa, dicsa, enumUint8, event, events, int, optional, string, uint8 } from "../__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
    emulator.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-account"].address), string('admin'))
})

afterAll(() => {
    emulator?.terminate()
})

// キャパシティの初期値は1である
test('The initial value of capacity is 1.', () => {
    expect(emulator.scripts('scripts/get_market_capacity.cdc')).toEqual(int(1))
})

// Adminはキャパシティを拡張できる
test('Admin can extend capacity', () => {
    let capacity = Number(emulator.scripts('scripts/get_market_capacity.cdc')['value'])

    capacity += 1

    expect(emulator.transactions('transactions/admin/extend_market_capacity.cdc', int(capacity))).toEqual({
        authorizers: '[f8d6e0586b0a20c7]',
        events: events(
            event('A.f8d6e0586b0a20c7.FanTopMarket.CapacityExtended', {
                by: address(accounts["emulator-account"].address),
                capacity: int(2)
            })
        ),
        id: expect.any(String),
        payer: 'f8d6e0586b0a20c7',
        payload: expect.any(String),
        status: 'SEALED'
    })

    expect(emulator.scripts('scripts/get_market_capacity.cdc')).toEqual(int(capacity))
})

// キャパシティは縮小できない
test('Capacity cannot be reduced', () => {
    let capacity = Number(emulator.scripts('scripts/get_market_capacity.cdc')['value'])
    expect(() =>
        emulator.transactions('transactions/admin/extend_market_capacity.cdc', int(capacity)) // same
    ).toThrowError('error: pre-condition failed: Capacity cannot be reduced')

    capacity -= 1
    expect(() =>
        emulator.transactions('transactions/admin/extend_market_capacity.cdc', int(capacity)) // reduced
    ).toThrowError('error: pre-condition failed: Capacity cannot be reduced')
})

// Adminでない者はキャパシティを拡張できない
test('Non-Admins cannot increase capacity', () => {
    let capacity = Number(emulator.scripts('scripts/get_market_capacity.cdc')['value'])

    capacity += 1

    expect(() =>
        emulator.signer('emulator-user-1').transactions('transactions/admin/extend_market_capacity.cdc', int(capacity))
    ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.admin)')
})
