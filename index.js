import XLSX from 'xlsx'
import FS from 'fs'

const workbook = XLSX.readFile('./input/lang.xlsx')

const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]]

const arr = XLSX.utils.sheet_to_formulae(sheet)

const CHAR = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T',
  'V', 'U', 'W', 'X', 'Y', 'Z',
]

const format = (coordinate) => {
  let row = '', column = ''
  coordinate.split('').forEach(char => {
    if (CHAR.includes(char)) {
      row += char
    } else {
      column += char
    }
  })
  return { row, column: parseInt(column) }
}
const trim = (value) => {
  let result = value
  if (value.startsWith("'")) result = result.slice(1)
  if (value.endsWith("'")) result = result.slice(0, result.length - 1)
  return result
}

const formatKey = str => {
  const res = []
  str.split('.').forEach(i => {
    if (i.includes('[') && i.includes(']')) {
      const a = i.split('[')
      if (!!a[0]) res.push(a[0])
      let b = 1
      while (b < a.length) {
        res.push(a[b].split(']')[0])
        b++
      }
    } else {
      res.push(i)
    }
  })
  return res.slice(1)
}

const getObj = (arr, index, value) => {
  try {
    const init = {}
    const key = arr[index]
    if (index === arr.length - 1) {
      init[key] = value
      return init
    }
    init[key] = getObj(arr, index + 1, value)
    return init
  } catch (e) {
    console.log(e)
  }
}

const isObject = o => Object.prototype.toString.call(o) === '[object Object]'

const assignObj = (obj, o) => {
  if (!o) return obj
  let e = obj, s = obj, i = o, c = null
  while (isObject(i)) {
    c = Object.keys(i)[0]
    e = e[c]
    if (!e) {
      s[c] = i[c]
      return obj
    } else {
      s = s[c]
      i = i[c]
    }
  }
  s[c] = i[c]
  return obj
}

const obj_to_arr = (obj) => {
  const value = []
  let is_array = true
  Object.keys(obj).forEach((key, index) => {
    value.push(isObject(obj[key]) ? obj_to_arr(obj[key]) : obj[key])
    if (parseInt(key) !== index) is_array = false
  })
  const res = is_array ? [] : {}
  Object.keys(obj).forEach((key, index) => {
    res[is_array ? index : key] = value[index]
  })
  return res
}

const result = {}

arr.forEach(str => {
  const list = str.split('=')
  const { row, column } = format(list[0])
  const value = trim(list.slice(1).join('='))
  if (column === 1) {
    result[row] = row === 'A' ? [] : {}
  } else {
    if (row === 'A') {
      result[row].push(formatKey(value))
    } else {
      const obj = getObj(result['A'][column - 2], 0, value)
      result[row] = assignObj(result[row], obj)
    }
  }
})

const cn = obj_to_arr(result['B'])
const tw = obj_to_arr(result['C'])
const en = obj_to_arr(result['D'])
const ja = obj_to_arr(result['E'])
const ko = obj_to_arr(result['F'])

FS.writeFileSync('./output/zh-CN.json', JSON.stringify(cn, null, 2), 'utf8')
FS.writeFileSync('./output/zh-TW.json', JSON.stringify(tw, null, 2), 'utf8')
FS.writeFileSync('./output/en-US.json', JSON.stringify(en, null, 2), 'utf8')
FS.writeFileSync('./output/ja-JP.json', JSON.stringify(ja, null, 2), 'utf8')
FS.writeFileSync('./output/ko-KR.json', JSON.stringify(ko, null, 2), 'utf8')
