// todo: 오름차순으로 정렬되어 있는(number) 임의의 배열이 있다. 배열에 속하지 않은 특정 값(n)이 있을 때, n과 가장 가까운 원소를 찾는 알고리즘을 구성하라. (단, 가장 가까운 원소가 2개 존재할 경우 배열 내 더 작은 수를 반환한다.)

function findClosestNumber(arr, n) {
    if (arr.length === 1) {
        return arr[0]
    }

    let mid = Math.floor(arr.length / 2) - 1
    // 1을 빼는 이유를 느낌적으로 설명하자면 배열의 index가 0으로부터 시작하는 것과 관련. 예를 들어 [1, 2] 같은 경우 mid가 1이 되는데, arr[1]과 arr[2](undefined)를 비교하는 꼴이 되어 잘못 설계된 알고리즘이 된다.

    return Math.abs(arr[mid] - n) <= Math.abs(arr[mid + 1] - n)
        ? findClosestNumber(arr.slice(0, mid + 1), n)
        : findClosestNumber(arr.slice(mid + 1), n)
}
// O(logn)의 시간 복잡도를 갖는다.

// testing
console.log(findClosestNumber([1, 2], 1.5))
console.log(findClosestNumber([1, 2, 3, 4, 5, 6, 7], 1.2))
console.log(findClosestNumber([1, 2, 3, 4, 5, 6, 7], 3))
console.log(findClosestNumber([1, 2, 3, 4, 5, 6, 7], 6))
console.log(findClosestNumber([1, 2, 3, 4, 5, 6, 7], 123))
