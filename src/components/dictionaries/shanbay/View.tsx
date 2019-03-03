import React from 'react'
import Speaker from '@/components/Speaker'
import { backgroundFetch } from '@/_helpers/browser-api'
import { ShanbayResult, ShanbayResultLex } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictShanbay extends React.Component<ViewPorps<ShanbayResult>> {
  state = {
    inited: false,
    examples: [],
    addText: '添加到新词本',
  }
  renderLex (result: ShanbayResultLex) {
    return (
      <>
        {result.title &&
          <div className='dictShanbay-HeaderContainer'>
            <h1 className='dictShanbay-Title'>{result.title}</h1>
            <span className='dictShanbay-Pattern'>{result.pattern}</span>
            { result.wordId && <button className='dictShanbay-addToWordBook' onClick={this.addToWordBook}>{this.state.addText}</button> }
          </div>
        }
        {result.prons.length > 0 &&
          <div className='dictShanBay-HeaderContainer'>
            {result.prons.map(({ phsym, url }) => (
              <React.Fragment key={url}>
                {phsym} <Speaker src={url} />
              </React.Fragment>
            ))}
          </div>
        }
        {result.basic &&
          <div className='dictShanbay-Basic' dangerouslySetInnerHTML={{ __html: result.basic }} />
        }
        {result.sentence &&
          <div>
          <h1 className='dictShanbay-SecTitle'>例句</h1>
            <ol className='dictShanbay-Sentence'>
            { this.renderExamples(result) }
            </ol>
          </div>
        }
      </>
    )
  }

  addToWordBook = () => {
    if (this.state.addText === '添加中') return
    const result = this.props.result as ShanbayResultLex
    this.setState({
      addText: '添加中',
    })

    return backgroundFetch('https://www.shanbay.com/api/v1/bdc/learning/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'id=' + result.wordId,
      credentials: 'include',
    })
    .then((response) => {
      const { body = {}, status } = response

      if (body.msg === 'SUCCESS') {
        this.setState({
          addText: '添加成功',
        })
      } else if (status === 401) {
        alert('请先登录扇贝网')
        return window.open('https://web.shanbay.com/web/account/login')
      } else {
        this.setState({
          addText: '添加失败',
        })
      }
    })
    .catch((e) => {
      this.setState({
        addText: '添加失败',
      })
      console.log(e)
    })
  }

  loadExample (id: string) {
    return backgroundFetch(`https://www.shanbay.com/api/v1/bdc/example/?vocabulary_id=${id}&type=sys`)
    .then(({ body = {} }) => {
      if ((body.data || {}).length) {
        this.setState({
          examples: body.data
        })
      }
    })
  }

  renderExamples (result) {
    if (!this.state.inited) {
      this.state.inited = true
      this.loadExample(result.wordId)
      return (
        <div>Loading...</div>
      )
    }
    return this.state.examples.map((example: {
      annotation: string,
      translation: string,
    }) => {
      return <li>
      <p dangerouslySetInnerHTML={{ __html: example.annotation }} />
      <p>{ example.translation }</p>
      </li>
    })
  }

  render () {
    const { result } = this.props
    switch (result.type) {
      case 'lex':
        return this.renderLex(result)
      default:
        return null
    }
  }
}
