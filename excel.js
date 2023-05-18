import XLSX from 'xlsx'
import FS from 'fs'

// import en from './en-US.json' assert { type: 'json' }
// import ko from './ko-KR.json' assert { type: 'json' }
// import ja from './ja-JP.json' assert { type: 'json' }
// import cn from './zh-CN.json' assert { type: 'json' }
// import tw from './zh-TW.json' assert { type: 'json' }

const en = JSON.parse(await FS.promises.readFile('./en-US.json'))
const ko = JSON.parse(await FS.promises.readFile('./ko-KR.json'))
const ja = JSON.parse(await FS.promises.readFile('./ja-JP.json'))
const cn = JSON.parse(await FS.promises.readFile('./zh-CN.json'))
const tw = JSON.parse(await FS.promises.readFile('./zh-TW.json'))

const key = {
  en: {},
  ko: {},
  ja: {},
  cn: {},
  tw: {},
}
const value = {
  en: [],
  ko: [],
  ja: [],
  cn: [],
  tw: [],
}
const isObject = o => Object.prototype.toString.call(o) === '[object Object]'
const isArray = o => Array.isArray(o)

const find_str = (json, index, string_id, value, key) => {
  if (isArray(json)) {
    json.forEach((v, k) => {
      const new_id = `${string_id}[${k}]`
      if (isArray(v) || isObject(v)) {
        find_str(v, index + 1, new_id, value, key)
      } else {
        key[new_id] = value.length
        value.push(v)
      }
    })
  } else if (isObject(json)) {
    Object.keys(json).forEach(k => {
      const new_id = `${string_id}.${k}`, v = json[k]
      if (isArray(v) || isObject(v)) {
        find_str(v, index + 1, new_id, value, key)
      } else {
        key[new_id] = value.length
        value.push(v)
      }
    })
  } else {
    key[string_id] = value.length
    value.push(json)
  }
}

find_str(en, 0, 'lang', value.en, key.en)
find_str(ja, 0, 'lang', value.ja, key.ja)
find_str(ko, 0, 'lang', value.ko, key.ko)
find_str(cn, 0, 'lang', value.cn, key.cn)
find_str(tw, 0, 'lang', value.tw, key.tw)

const title = ["string_id", "zh-CN", "zh-TW", "en-US", "ja-JP", "ko-KR"]
const data = [title]
Object.keys(key.cn).forEach(k => {
  const row = [
    k, value.cn[key.cn[k]], value.tw[key.tw[k]], value.en[key.en[k]], value.ja[key.ja[k]], value.ko[key.ko[k]]
  ]
  data.push(row)
})
const workbook = XLSX.utils.book_new()
const sheet = XLSX.utils.json_to_sheet(data)
XLSX.utils.book_append_sheet(workbook, sheet, 'i18n')
XLSX.writeFile(workbook, './lang.xlsx')



