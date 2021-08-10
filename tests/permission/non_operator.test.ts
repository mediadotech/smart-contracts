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

// ロールを与えられていないユーザーはOperatorとして活動できない
test('Users who are not given the role cannot act as Operator', () => {
    // As an Operator
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/operator/create_item.cdc',
            string('test-item-id-1'),
            uint32(1),
            uint32(100),
            dicss({}),
            bool(true)
        )
    ).toThrowError('error: pre-condition failed: Roles not given cannot be borrowed')
})

// ロールを削除されたユーザーはOperatorとして活動できない
test('User whose role has been deleted cannot act as Operator', () => {
    emulator.transactions('transactions/owner/add_admin.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.signer('emulator-user-1').transactions('transactions/admin/add_operator.cdc', address(flowConfig.accounts["emulator-user-1"].address))
    emulator.transactions('transactions/owner/remove_operator.cdc', address(flowConfig.accounts["emulator-user-1"].address))

    // As an Operator
    expect(() =>
        emulator.signer('emulator-user-1').transactions(
            'transactions/operator/create_item.cdc',
            string('test-item-id-1'),
            uint32(1),
            uint32(100),
            dicss({}),
            bool(true)
        )
    ).toThrowError('error: pre-condition failed: Roles without permission cannot be used')
})
