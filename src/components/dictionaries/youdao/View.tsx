import React from 'react'
import Speaker from '@/components/Speaker'
import StarRates from '@/components/StarRates'
import { backgroundFetch } from '@/_helpers/browser-api'
import { YoudaoResult, YoudaoResultLex, YoudaoResultRelated } from './engine'
import { ViewPorps } from '@/components/dictionaries/helpers'

export default class DictYoudao extends React.PureComponent<ViewPorps<YoudaoResult>> {
  state = {
    addText: '添加到新词本',
  }
  renderLex (result: YoudaoResultLex) {
    return (
      <>
        {result.title &&
          <div className='dictYoudao-HeaderContainer'>
            <h1 className='dictYoudao-Title'>{result.title}</h1>
            <span className='dictYoudao-Pattern'>{result.pattern}</span>
            <button className='dictYoudao-addToWordBook' onClick={this.addToWordBook}>{this.state.addText}</button>
          </div>
        }
        {(result.stars > 0 || result.prons.length > 0) &&
          <div className='dictYoudao-HeaderContainer'>
            {result.stars > 0 && <StarRates className='dictYoudao-Stars' rate={result.stars} />}
            {result.prons.map(({ phsym, url }) => (
              <React.Fragment key={url}>
                {phsym} <Speaker src={url} />
              </React.Fragment>
            ))}
            <span className='dictYoudao-Rank'>{result.rank}</span>
          </div>
        }
        {result.basic &&
          <div className='dictYoudao-Basic' dangerouslySetInnerHTML={{ __html: result.basic }} />
        }
        {result.collins &&
          <div>
            <h1 className='dictYoudao-SecTitle'>柯林斯英汉双解</h1>
            <ul className='dictYoudao-Collins' dangerouslySetInnerHTML={{ __html: result.collins }} />
          </div>
        }
        {result.discrimination &&
          <div className='dictYoudao-Discrimination'>
            <h1 className='dictYoudao-Discrimination_Title'>词义辨析</h1>
            <div dangerouslySetInnerHTML={{ __html: result.discrimination }} />
          </div>
        }
        {result.sentence &&
          <div>
            <h1 className='dictYoudao-SecTitle'>权威例句</h1>
            <ol className='dictYoudao-Sentence' dangerouslySetInnerHTML={{ __html: result.sentence }} />
          </div>
        }
        {result.translation &&
          <div>
            <h1 className='dictYoudao-SecTitle'>机器翻译</h1>
            <div className='dictYoudao-Translation' dangerouslySetInnerHTML={{ __html: result.translation }} />
          </div>
        }
      </>
    )
  }

  addToWordBook = () => {
    if (this.state.addText === '添加中') return
    const result = this.props.result as YoudaoResultLex
    this.setState({
      addText: '添加中',
    })

    return backgroundFetch(`http://dict.youdao.com/wordbook/ajax?action=addword&q=${result.title}`, {
      credentials: 'include'
    })
    .then(({ body = {} }) => {
      if (body.message === 'adddone') {
        this.setState({
          addText: '添加成功',
        })
      } else {
        alert('请先登录有道词典')
        return window.open('http://account.youdao.com/login?service=dict')
      }
    })
    .catch((e) => {
      this.setState({
        addText: '添加失败',
      })
      console.log(e)
    })
  }

  renderRelated (result: YoudaoResultRelated) {
    return (
      <div className='dictYoudao-Related' dangerouslySetInnerHTML={{ __html: result.list }} />
    )
  }

  render () {
    const { result } = this.props
    switch (result.type) {
      case 'lex':
        return this.renderLex(result)
      case 'related':
        return this.renderRelated(result)
      default:
        return null
    }
  }
}
