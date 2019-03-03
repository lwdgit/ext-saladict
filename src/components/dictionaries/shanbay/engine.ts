import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  getText,
  getInnerHTMLBuilder,
  handleNoResult,
  HTMLString,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://www.shanbay.com/bdc/mobile/preview/word?word=${text}`
}

const getInnerHTML = getInnerHTMLBuilder('http://www.shanbay.com/')

export interface ShanbayResultLex {
  type: 'lex'
  title: string
  pattern: string
  prons: Array<{
    phsym: string
    url: string
  }>
  basic?: HTMLString
  wordId?: string | null
  sentence?: Boolean
  translation?: HTMLString
  id: 'shanbay'
}

export type ShanbayResult = ShanbayResultLex

type ShanbaySearchResult = DictSearchResult<ShanbayResult>

export const search: SearchFunction<ShanbaySearchResult> = (
  text, config, profile,
) => {
  const options = profile.dicts.all.shanbay.options
  return fetchDirtyDOM('https://www.shanbay.com/bdc/mobile/preview/word?word=' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options))
}

function checkResult (
  doc: Document,
  options: DictConfigs['shanbay']['options'],
): ShanbaySearchResult | Promise<ShanbaySearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options)
  }
  return handleNoResult()
}

function handleDOM (
  doc: Document,
  options: DictConfigs['shanbay']['options'],
): ShanbaySearchResult | Promise<ShanbaySearchResult> {
  const word = doc.querySelector('.word-spell')
  const result: ShanbayResult = {
    id: 'shanbay',
    type: 'lex',
    title: getText(doc, '.word-spell'),
    pattern: getText(doc, '.pattern'),
    prons: [],
  }

  const audio: { uk: string, us: string } = {
    uk: 'http://media.shanbay.com/audio/uk/' + result.title + '.mp3',
    us: 'http://media.shanbay.com/audio/us/' + result.title + '.mp3',
  }

  result.prons.push({
    phsym: getText(doc, '.word-announace'),
    url: audio.us,
  })

  if (options.basic) {
    result.basic = getInnerHTML(doc, '.definition-cn')
  }

  result.wordId = word && word.getAttribute('data-id')
  result.sentence = options.sentence && Boolean(result.wordId)

  if (result.title) {
    return { result, audio }
  }
  return handleNoResult()
}
