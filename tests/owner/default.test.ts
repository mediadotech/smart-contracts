import { createEmulator, FlowEmulator } from '../__fixtures__/emulator'
import { accounts } from '../../flow.json'
import { address, bool, string } from '../__fixtures__/args'

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

// OwnerはデフォルトでOwnerだけを持っている
test('Owner only has Owner permission by default', () => {
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-account'].address), string('owner'))).toEqual(bool(true))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-account'].address), string('admin'))).toEqual(bool(false))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-account'].address), string('operator'))).toEqual(bool(false))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-account'].address), string('minter'))).toEqual(bool(false))
})
test('Others do not have any permission', () => {
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-user-1'].address), string('owner'))).toEqual(bool(false))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-user-1'].address), string('admin'))).toEqual(bool(false))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-user-1'].address), string('operator'))).toEqual(bool(false))
    expect(emulator.scripts('scripts/has_permission.cdc', address(accounts['emulator-user-1'].address), string('minter'))).toEqual(bool(false))
})
