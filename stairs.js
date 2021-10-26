function initArray(n, size) {
    let a = [];
    for (let i = 0; i < size; i++) {
      a[i] = --n;
    }
    return a;
  }
  
  function reset(arr) {
        let ri = 0
        for(var pos = arr.length-1; pos >= 0; pos--){
          if(++ri !== arr[pos])
            break
        }
        arr[pos]--
        while(pos++ < arr.length-1) {
            arr[pos] = arr[pos-1] - 1
        }
        return arr
  }
  
  /*
  function add(arr) {
    return arr.reduce((a,b)=>a+b)   
  }
 */

  function solution(n) {
    let total = 0, max = 20
    for (let i = 2; i <= max; i++) {  // Number of slots
      let arr = initArray(n, i);
      while (arr[0] >= i) {
        arr[arr.length - 1]++
        while (arr[arr.length - 1]-- > 1) {  // Countdown last number
          if(arr.length == 5 && (arr[0] + arr[1] + 6) > n) break;
          if(arr.length == 6 && (arr[0] + arr[1] + 10) > n) break;
          if(arr.length == 7 && (arr[0] + arr[1] + 15) > n) break;

          // Sum array
          var sum = 0
          for (let ac = 0, l = arr.length; ac < l; ac++) {
              sum = sum + arr[ac];
          }
          if(sum === n) {
            console.log(arr, total++)
          }

        }

        // Reset array
        arr[arr.length - 1] = 1
        let ri = 0
        for(var pos = arr.length-1; pos >= 0; pos--){
          if(++ri !== arr[pos])
            break
        }
        arr[pos]--
        while(pos++ < arr.length-1) {
            arr[pos] = arr[pos-1] - 1
        }
        //arr = reset(arr)
      }
    }
    return total
  }
  
  setInterval(()=>console.log('running'), 10000)
  let t = solution(200);
  console.log(t);