import React, { Component } from 'react';

import SearchBar from './SearchBar';
import StockPreview from './StockPreview';
import Portfolio from './Portfolio';

import './App.css';
import { tickerSearch } from './data/tickerSearch';
import { keys } from './constants/keys';
import { library } from '@fortawesome/fontawesome-svg-core'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faBookmark, faNewspaper, faBars } from '@fortawesome/free-solid-svg-icons'
import request from 'request';
import { USER_KEY, BASE_URL, QUOTE_PATH } from './constants/alphaVantage';
import { NEWSAPI_KEY, NEWSAPI_BASE_URL, NEWSAPI_EVERYTHING_PATH } from './constants/newsApi';
import localforage from "localforage";

let timeout;

library.add(faTimesCircle, faBookmark, faNewspaper, faBars );

const filterTicker = (text, list,favourites=[]) => { return new Promise((resolve,reject) => {
  let filteredList = [];
  if (!text.length) resolve([]);
  let textRegex = new RegExp(text,'i');
  list.forEach((c) => {
    let foundTicker = c.symbol.match(textRegex);
    let foundName =  c.name.match(textRegex);
    //favourites.indexOf(c.symbol)
    //console.log(found, c.name);
    //if ((foundName || foundTicker) && !favourites.filter(v => v.symbol === c.symbol).length) filteredList.push({...c,relevance: ((foundName && text.length / c.name.length) || (foundTicker && text.length / c.symbol.length))});
    if ((foundName || foundTicker) && (!favourites.length || !favourites.filter(v => v.symbol === c.symbol).length)) filteredList.push({...c,relevance: ((foundName && text.length / c.name.length) || (foundTicker && text.length / c.symbol.length))});
  });
  filteredList.sort((a,b) => 
  {
    return (b.relevance - a.relevance);
  });
  resolve(filteredList);
});
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [],
      preview: {},
      favourites: [],
      timeout: {},
      searchText: '',
      news: {},
      showingNews: false,
      searching: false
    }
     this.onChangeSearch = this.onChangeSearch.bind(this);
     this.unTab = this.unTab.bind(this);
     this.addToFavourites = this.addToFavourites.bind(this);
     this.previewStock = this.previewStock.bind(this);
     this.removeFromFavourites = this.removeFromFavourites.bind(this);
     this.onChangeFocusSearch = this.onChangeFocusSearch.bind(this);
     this.onKeyDown = this.onKeyDown.bind(this);
     this.closePreview = this.closePreview.bind(this);
     this.queryStockQuote = this.queryStockQuote.bind(this);
     this.queryNews = this.queryNews.bind(this);
     this.onPressNews = this.onPressNews.bind(this);
  }

  componentDidMount() {
    localforage.getItem('state')
      .then((data) => {
        this.setState(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  queryNews(stock, page=1) {
    let stockQueryUrl=encodeURIComponent(stock.name+' OR '+stock.symbol);
    let url = `${NEWSAPI_BASE_URL}${NEWSAPI_EVERYTHING_PATH}?q=${stockQueryUrl}&apiKey=${NEWSAPI_KEY}&pageSize=5&page=${page}`;
    request(url, (err, res) => {
      res = JSON.parse(res.body);
      if (err) {
        this.setState({error: err});
      } else {
        let currNewsDate = this.state.news.articles ? this.state.news.articles.publishedAt : '0';
        if (res && res.status === "ok" && res.articles && res.articles.length && res.articles[0].publishedAt !== currNewsDate ) {
          this.setState((oldState,oldProps) => {
            let indexOfStock = oldState.favourites.findIndex((s) => {
              return(s.symbol===stock.symbol);
            });
            let newFavourites = oldState.favourites;
            newFavourites[indexOfStock].news = res.articles;
            localforage.setItem('state', {favourites: newFavourites});
            if (this.state.preview.symbol === stock.symbol) {
              return({favourites: newFavourites, preview: newFavourites[indexOfStock]});
            } else {
              return({favourites: newFavourites});
            }
            
          });
        }
      }
    })
  }

  onPressNews(stock) {
    let indexOfStock = this.state.favourites.findIndex((s) => {
      return(stock.symbol === s.symbol);
    });
    //console.log(indexOfStock);
    if (indexOfStock > -1) {
      this.setState({showingNews: true});
      this.queryNews(stock);
    }
    else console.log('Save this stock first'); 
  }

  onChangeSearch(evt) {
    //const favourites = this.state.favourites;
    const prevSearch = this.state.searchText;
    const newText = evt.target.value.trimLeft();
    this.setState({searchText: newText});
    // filterTicker(newText).then(res => this.setState({dataList: res})); 
    if (prevSearch.length >= newText.length || prevSearch.length === 0) {
      filterTicker(newText,tickerSearch).then(res => this.setState({dataList: res})); 
    } else {
      const prevData = this.state.dataList;
      prevData.length
        ? filterTicker(newText,prevData).then(res => this.setState({dataList: res}))
        : filterTicker(newText,tickerSearch).then(res => this.setState({dataList: res})); 
    }
    
  }

  unTab(ev) {
    ev.target.tabIndex=-1;
  }

  queryStockQuote(stock) {
    localforage.getItem(`${BASE_URL}${QUOTE_PATH}&symbol=${stock.symbol}&apikey=${USER_KEY}`).then(data => {
      if (data && data["Global Quote"]) {
        //console.log(data["Global Quote"]);
        stock.quote = data["Global Quote"];
        this.setState({preview: stock});
        request(`${BASE_URL}${QUOTE_PATH}&symbol=${stock.symbol}&apikey=${USER_KEY}`, (err,res) => {
          if (err) this.setState({error: err});
          else this.setState((oldState,oldProps) => {
            let resJson = JSON.parse(res.body);
            //console.log(JSON.parse(res.body)["Global Quote"]);
            if (resJson["Global Quote"]) {
              stock.quote = resJson["Global Quote"];
              if(stock.symbol === this.state.preview.symbol) {
                localforage.setItem(`${BASE_URL}${QUOTE_PATH}&symbol=${stock.symbol}&apikey=${USER_KEY}`,resJson);
                return({preview: stock});
              }
              else { 
                console.log('blocked');
                return;
              }
            }
            //console.log(this.state.preview.symbol, stock.symbol);

          });
        });
      } else {
        request(`${BASE_URL}${QUOTE_PATH}&symbol=${stock.symbol}&apikey=${USER_KEY}`, (err,res) => {
          if (err) this.setState({error: err});
          else this.setState((oldState,oldProps) => {
            let resJson = JSON.parse(res.body);
            //console.log(JSON.parse(res.body)["Global Quote"]);
            if (resJson["Global Quote"]) {
              stock.quote = resJson["Global Quote"];
              if(stock.symbol === this.state.preview.symbol) {
                localforage.setItem(`${BASE_URL}${QUOTE_PATH}&symbol=${stock.symbol}&apikey=${USER_KEY}`,resJson);
                return({preview: stock});
              }
              else { 
                console.log('blocked');
                return;
              }
            }
            //console.log(this.state.preview.symbol, stock.symbol);

          });
        });
      }
    }).catch(err => {
      if (err) console.log(err);
    });

  }
  onChangeFocusSearch(ev) {
    switch (ev.type) {
      case 'focus':
        clearTimeout(timeout);
        timeout = setTimeout(() => {this.setState({searching: true})}, 10);
        break;
      case 'blur':
        clearTimeout(timeout);
        timeout = setTimeout(() => {this.setState({searching: false})}, 10);
        if (ev.target.tagName==="LI") ev.target.tabIndex = -1
        break;
      default:
        break;
    }
  }

  onKeyDown(ev) {
    let next;
    if (ev.target.tagName==="INPUT" && ev.target.nextElementSibling) {
      switch (ev.keyCode) {
        case keys.KEY_DOWN_ARROW: 
          next = ev.target.nextElementSibling.firstElementChild;
          if(next) {
            next.tabIndex = 0;
            next.focus();
          }
          break;
        case keys.KEY_UP_ARROW:
          next = ev.target.nextElementSibling.lastElementChild;
          if(next) {
            next.tabIndex = 0;
            next.focus();
          }
          break;
        case keys.KEY_ESCAPE:
          ev.target.blur();
          break;
        default:
          break;
      }

    }
    else if (ev.target.tagName==="UL" && ev.target.firstElementChild) {
      switch(ev.keyCode) {
        case keys.KEY_DOWN_ARROW:
          next = ev.target.firstElementChild;
          ev.preventDefault();
          next.tabIndex=0;
          next.focus();
          break;
      case keys.KEY_UP_ARROW:
          next = ev.target.lastElementChild;
          ev.preventDefault();
          next.tabIndex=0;
          next.focus();
          break;
        default:
          break;
      }
    }
    else if (ev.target.tagName==="LI") {
      let curr = ev.target;
      let parent = ev.target.parentElement.previousElementSibling;
      switch(ev.keyCode) {
        case keys.KEY_DOWN_ARROW:
          if(curr.nextElementSibling) {
            next = ev.target.nextElementSibling;
            ev.preventDefault();
            next.tabIndex=0;
            next.focus();
            curr.tabIndex=-1;
          }
          break;
        case keys.KEY_UP_ARROW:
          if(curr.previousElementSibling) {
            next = ev.target.previousElementSibling;
            ev.preventDefault();
            next.tabIndex=0;
            next.focus();
            curr.tabIndex=-1;
          }
          break;
        case keys.KEY_ENTER:
          curr.click();
          curr.tabIndex=-1;
          // parent.focus();
          break;
        case keys.KEY_ESCAPE:
          parent.focus();
          curr.tabIndex=-1;
          break;
        default:
          break;
      }
    }

    //console.log(ev.target.findElementsByTagName('li')[0].focus);
  }

  addToFavourites(v) {
    clearTimeout(timeout);
    this.setState((oldState, oldProps) => {
      let cFavourites = oldState.favourites;
      if (!v.bookmarked) {
        v.bookmarked = true;
        cFavourites.push(v);
      } else {
        v.bookmarked = false;
        cFavourites = cFavourites.filter((c) => c.symbol !== v.symbol);
      }
      localforage.setItem('state',{favourites: cFavourites});
      return({favourites: cFavourites, preview: v});
    });
    //console.log(v);
  }

  previewStock(v) {
    let favourites = this.state.favourites;
    clearTimeout(timeout);
    let fromFavourites = favourites.find((c) => c.symbol === v.symbol);
    v = fromFavourites ? fromFavourites : v;
    //console.log(v);
    this.setState({preview: v, searching:false});
    this.queryStockQuote(v);
    //console.log(v);
  }

  closePreview(v) {
    this.setState({preview: {}});
  }

  removeFromFavourites(v) {
    this.setState((oldState, oldProps) => {
      let newFaves = oldState.favourites.filter((c) => {
        return c.symbol !== v.symbol;
      });
      localforage.setItem('state',{favourites: newFaves});
      return({favourites: newFaves})
    });
    //const currData = this.state.dataList;
    this.onChangeSearch({target: {value: this.state.searchText}});
    //console.log(v);
  }


  openStock(key) {
    console.log(key);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h2>Bl&ouml;m
          </h2>
        </header>
        <main>
            <SearchBar id="searchBar" text={this.state.searchText} onselect={this.previewStock} focused={this.state.searching} onChangeSearch={this.onChangeSearch} dataList={this.state.dataList} onChangeFocus={this.onChangeFocusSearch} onKeyDown={this.onKeyDown}/>
            {this.state.preview.symbol ? <StockPreview stock={this.state.preview} showingNews={this.state.showingNews} querySymbol={this.queryStockQuote} onNews={this.onPressNews} onBookmark={this.addToFavourites} closePreview={this.closePreview}/> : <div/>}
            <Portfolio onselect={this.previewStock} dataList={this.state.favourites} onChangeFocus={this.onChangeFocusSearch} onKeyDown={this.onKeyDown}/>
        </main>
        
      </div>
    );
  }
}

export default App;
