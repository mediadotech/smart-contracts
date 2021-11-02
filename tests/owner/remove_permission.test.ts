import { createEmulator, FlowEmulator } from "../__fixtures__/emulator"
import { accounts } from '../../flow.json'
import { address, bool, event, events, string } from "../__fixtures__/args"

describe('Operator', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
    })

    afterEach(() => {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // OwnerはOpeartorを削除できる
    test('Owner can remove Opeartor', () => {
        expect(
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toEqual({
            authorizers: '[f8d6e0586b0a20c7]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionRemoved', {
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
            emulator.scripts('scripts/has_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toEqual(bool(false))
    })

    // Ownerではないユーザーは権限を削除できない
    test('Non-Owner users cannot remove Operator', () => {
        expect(() => emulator.signer("emulator-user-2").transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        ).toThrowError('FanTopPermissionV2.hasPermission(account.address, role: Role.owner)')
    })

    // Ownerは重複してOperatorを削除できない
    test('Owner cannot delete Operator more than once', () => {
        emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        expect(() => {
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        }).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
    })
})

describe('Minter', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
    })

    afterEach(() => {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // OwnerはMinterを削除できる
    test('Owner can remove Minter', () => {
        expect(
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        ).toEqual({
            authorizers: '[f8d6e0586b0a20c7]',
            events: events(
                event('A.f8d6e0586b0a20c7.FanTopPermissionV2.PermissionRemoved', {
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

    // Ownerは重複してMinterを削除できない
    test('Owner cannot delete Minter more than once', () => {
        emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        expect(() => {
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
        }).toThrowError('error: pre-condition failed: Permissions that do not exist cannot be deleted')
    })
})

describe('Others', () => {
    let emulator: FlowEmulator
    beforeAll(async () => {
        emulator = await createEmulator()
    })

    afterAll(() => {
        emulator?.terminate()
    })

    beforeEach(() => {
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("operator"))
        emulator?.transactions('transactions/owner/add_permission.cdc', address(accounts["emulator-user-1"].address), string("minter"))
    })

    afterEach(() => {
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("operator")) } catch { /* NOP */ }
        try { emulator?.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("minter")) } catch { /* NOP */ }
    })

    // 存在しないRoleは削除できない
    test('Roles that do not exist cannot be deleted', () => {
        expect(() => {
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-user-1"].address), string("abc"))
        }).toThrowError('error: panic: Unknown roles cannot be removed')
    })

    // Ownerは削除できない
    test('Owner cannot be deleted', () => {
        expect(() => {
            emulator.transactions('transactions/owner/remove_permission.cdc', address(accounts["emulator-account"].address), string("owner"))
        }).toThrowError('error: pre-condition failed: Owner cannot be changed')
    })
})
