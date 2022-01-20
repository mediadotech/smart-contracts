import { createEmulator, FlowEmulator } from "./__fixtures__/emulator"
import { array, int, string, uint32 } from "./__fixtures__/args"

let emulator: FlowEmulator
beforeAll(async () => {
    emulator = await createEmulator()
})

afterAll(() => {
    emulator?.terminate()
})

test('size: 100, pickTo: 0', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(100), uint32(0), array([]), int(0))
    ).toEqual(array([
        uint32(0), string('o'.repeat(100) + 'x'.repeat(28))
    ]))
})

test('size: 100, pickTo: 50', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(100), uint32(50), array([]), int(0))
    ).toEqual(array([
        uint32(0), string('x'.repeat(50) + 'o'.repeat(50) + 'x'.repeat(28))
    ]))
})


test('size: 128, pickTo: 64', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(128), uint32(64), array([]), int(0))
    ).toEqual(array([
        uint32(1), string('o'.repeat(64))
    ]))
})

test('size: 128, pickTo: 70', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(128), uint32(70), array([]), int(0))
    ).toEqual(array([
        uint32(1), string('x'.repeat(6) + 'o'.repeat(58))
    ]))
})

test('size: 200, pickTo: 70', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(200), uint32(70), array([]), int(0))
    ).toEqual(array([
        uint32(1), string('x'.repeat(6) + 'o'.repeat(130) + 'x'.repeat(56))
    ]))
})

test('size: 64, pickTo: 64', async () => {
    expect(
        emulator.scripts('scripts/test_box.cdc', uint32(64), uint32(64), array([]), int(0))
    ).toEqual(array([
        uint32(1), string('')
    ]))
})

test('size: 10, pickTo: 1, picks: [3, 5, 7, 9]', async () => {
    expect(
        emulator.scripts(
            'scripts/test_box.cdc',
            uint32(10), uint32(1), array([
                uint32(3), uint32(5), uint32(7), uint32(9)
            ]), int(0))
    ).toEqual(array([
        uint32(0), string('xo'.repeat(5) + 'x'.repeat(54))
    ]))
})

test('size: 128, pickTo: 0, picks: [1 - 128], truncate: 1', async () => {
    expect(
        emulator.scripts(
            'scripts/test_box.cdc',
            uint32(128), uint32(0), array(Array(128).fill(0).map((_, i) => uint32(i + 1))), int(1))
    ).toEqual(array([
        uint32(1), string('x'.repeat(64))
    ]))
})

test('size: 128, pickTo: 0, picks: [1 - 128], truncate: 2', async () => {
    expect(
        emulator.scripts(
            'scripts/test_box.cdc',
            uint32(128), uint32(0), array(Array(128).fill(0).map((_, i) => uint32(i + 1))), int(2))
    ).toEqual(array([
        uint32(2), string('')
    ]))
})

test('size: 1000, pickTo: 0', async () => {
    expect(
        emulator.scripts(
            'scripts/test_box.cdc',
            uint32(1000), uint32(0), array([]), int(0))
    ).toEqual(array([
        uint32(0), string('o'.repeat(1000) + 'x'.repeat(24))
    ]))
})

test('size: 192, pickTo: 0, picks: [1, 65, 129]', async () => {
    expect(
        emulator.scripts(
            'scripts/test_box.cdc',
            uint32(192), uint32(0), array([
                uint32(1), uint32(65), uint32(129)
            ]), int(0))
    ).toEqual(array([
        uint32(0), string(('x' + 'o'.repeat(63)).repeat(3))
    ]))
})
