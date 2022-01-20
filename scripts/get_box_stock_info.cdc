import FanTopSerial from "../contracts/FanTopSerial.cdc"

// returns: [offset, stockline]
pub fun main(itemId: String): [AnyStruct] {
    let stockLabels = [
        "xxxxxxxx", "oxxxxxxx", "xoxxxxxx", "ooxxxxxx", "xxoxxxxx", "oxoxxxxx", "xooxxxxx", "oooxxxxx", "xxxoxxxx", "oxxoxxxx", "xoxoxxxx", "ooxoxxxx", "xxooxxxx", "oxooxxxx", "xoooxxxx", "ooooxxxx",
        "xxxxoxxx", "oxxxoxxx", "xoxxoxxx", "ooxxoxxx", "xxoxoxxx", "oxoxoxxx", "xooxoxxx", "oooxoxxx", "xxxooxxx", "oxxooxxx", "xoxooxxx", "ooxooxxx", "xxoooxxx", "oxoooxxx", "xooooxxx", "oooooxxx",
        "xxxxxoxx", "oxxxxoxx", "xoxxxoxx", "ooxxxoxx", "xxoxxoxx", "oxoxxoxx", "xooxxoxx", "oooxxoxx", "xxxoxoxx", "oxxoxoxx", "xoxoxoxx", "ooxoxoxx", "xxooxoxx", "oxooxoxx", "xoooxoxx", "ooooxoxx",
        "xxxxooxx", "oxxxooxx", "xoxxooxx", "ooxxooxx", "xxoxooxx", "oxoxooxx", "xooxooxx", "oooxooxx", "xxxoooxx", "oxxoooxx", "xoxoooxx", "ooxoooxx", "xxooooxx", "oxooooxx", "xoooooxx", "ooooooxx",
        "xxxxxxox", "oxxxxxox", "xoxxxxox", "ooxxxxox", "xxoxxxox", "oxoxxxox", "xooxxxox", "oooxxxox", "xxxoxxox", "oxxoxxox", "xoxoxxox", "ooxoxxox", "xxooxxox", "oxooxxox", "xoooxxox", "ooooxxox",
        "xxxxoxox", "oxxxoxox", "xoxxoxox", "ooxxoxox", "xxoxoxox", "oxoxoxox", "xooxoxox", "oooxoxox", "xxxooxox", "oxxooxox", "xoxooxox", "ooxooxox", "xxoooxox", "oxoooxox", "xooooxox", "oooooxox",
        "xxxxxoox", "oxxxxoox", "xoxxxoox", "ooxxxoox", "xxoxxoox", "oxoxxoox", "xooxxoox", "oooxxoox", "xxxoxoox", "oxxoxoox", "xoxoxoox", "ooxoxoox", "xxooxoox", "oxooxoox", "xoooxoox", "ooooxoox",
        "xxxxooox", "oxxxooox", "xoxxooox", "ooxxooox", "xxoxooox", "oxoxooox", "xooxooox", "oooxooox", "xxxoooox", "oxxoooox", "xoxoooox", "ooxoooox", "xxooooox", "oxooooox", "xoooooox", "ooooooox",
        "xxxxxxxo", "oxxxxxxo", "xoxxxxxo", "ooxxxxxo", "xxoxxxxo", "oxoxxxxo", "xooxxxxo", "oooxxxxo", "xxxoxxxo", "oxxoxxxo", "xoxoxxxo", "ooxoxxxo", "xxooxxxo", "oxooxxxo", "xoooxxxo", "ooooxxxo",
        "xxxxoxxo", "oxxxoxxo", "xoxxoxxo", "ooxxoxxo", "xxoxoxxo", "oxoxoxxo", "xooxoxxo", "oooxoxxo", "xxxooxxo", "oxxooxxo", "xoxooxxo", "ooxooxxo", "xxoooxxo", "oxoooxxo", "xooooxxo", "oooooxxo",
        "xxxxxoxo", "oxxxxoxo", "xoxxxoxo", "ooxxxoxo", "xxoxxoxo", "oxoxxoxo", "xooxxoxo", "oooxxoxo", "xxxoxoxo", "oxxoxoxo", "xoxoxoxo", "ooxoxoxo", "xxooxoxo", "oxooxoxo", "xoooxoxo", "ooooxoxo",
        "xxxxooxo", "oxxxooxo", "xoxxooxo", "ooxxooxo", "xxoxooxo", "oxoxooxo", "xooxooxo", "oooxooxo", "xxxoooxo", "oxxoooxo", "xoxoooxo", "ooxoooxo", "xxooooxo", "oxooooxo", "xoooooxo", "ooooooxo",
        "xxxxxxoo", "oxxxxxoo", "xoxxxxoo", "ooxxxxoo", "xxoxxxoo", "oxoxxxoo", "xooxxxoo", "oooxxxoo", "xxxoxxoo", "oxxoxxoo", "xoxoxxoo", "ooxoxxoo", "xxooxxoo", "oxooxxoo", "xoooxxoo", "ooooxxoo",
        "xxxxoxoo", "oxxxoxoo", "xoxxoxoo", "ooxxoxoo", "xxoxoxoo", "oxoxoxoo", "xooxoxoo", "oooxoxoo", "xxxooxoo", "oxxooxoo", "xoxooxoo", "ooxooxoo", "xxoooxoo", "oxoooxoo", "xooooxoo", "oooooxoo",
        "xxxxxooo", "oxxxxooo", "xoxxxooo", "ooxxxooo", "xxoxxooo", "oxoxxooo", "xooxxooo", "oooxxooo", "xxxoxooo", "oxxoxooo", "xoxoxooo", "ooxoxooo", "xxooxooo", "oxooxooo", "xoooxooo", "ooooxooo",
        "xxxxoooo", "oxxxoooo", "xoxxoooo", "ooxxoooo", "xxoxoooo", "oxoxoooo", "xooxoooo", "oooxoooo", "xxxooooo", "oxxooooo", "xoxooooo", "ooxooooo", "xxoooooo", "oxoooooo", "xooooooo", "oooooooo"
    ]
    let boxRef = FanTopSerial.getBoxRef(itemId: itemId)!
    var stock = ""
    for chunk in boxRef.getStock() {
        var shift = 0 as UInt64
        while shift < 64 {
            stock = stock.concat(stockLabels[(chunk >> shift) & 0xff])
            shift = shift + 8
        }
    }
    return [
        boxRef.offset, stock
    ]
}
