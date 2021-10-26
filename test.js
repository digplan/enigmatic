
function add(arr) {
    return arr.reduce((a, b) => a + b)
}

var arr = [100, 99, 98, 97, 96, 95]

var n = 1000000
var start = +new Date()
while (n--) {
    var sum = 0
    for (var i = 0, l = arr.length; i < l; i++) {
        sum = sum + arr[i];
    }
}
var end = +new Date()

console.log(end - start)