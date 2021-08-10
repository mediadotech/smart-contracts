import { createEmulator, FlowEmulator } from "../utils/emulator"
import flowConfig from '../../flow.json'
import { address, event, events, uint32, uint8, string, dicss, bool } from "../utils/args"

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
    try {
        emulator.signer('emulator-user-1').transactions('transactions/permission/destroy_permission_receiver.cdc')
    } catch {
        // NOP
    }
    try {
        emulator.signer('emulator-user-2').transactions('transactions/permission/destroy_permission_receiver.cdc')
    } catch {
        // NOP
    }
})

// ロールを与えられていないユーザーはMinterとして活動できない
test('Users who are not given the role cannot act as Minter', () => {
    // As an Minter
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/mint_token.cdc',
            address(flowConfig.accounts['emulator-user-2'].address),
            string('test-ref-id-1'),
            string('test-item-id-1'),
            dicss({})
        )
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})

// ロールを削除されたユーザーはMinterとして活動できない
test('User whose role has been deleted cannot act as Minter', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.signer('emulator-user-1').transactions('transactions/admin/add_minter.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.transactions('transactions/owner/remove_minter.cdc', address(flowConfig.accounts["emulator-user-1"].address))

    // As an Minter
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/minter/mint_token.cdc',
            address(flowConfig.accounts['emulator-user-2'].address),
            string('test-ref-id-1'),
            string('test-item-id-1'),
            dicss({})
        )
    ).toThrowError('error: pre-condition failed: Roles without permission cannot be used')
})
