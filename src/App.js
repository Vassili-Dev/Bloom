import React, { Component } from 'react';
import SearchBar from './SearchBar';
import StockCard from './StockCard';
import './App.css';
import { tickerSearch } from './data/tickerSearch';
import { keys } from './constants/keys';
 
const filterTicker = (text, list,favourites) => { return new Promise((resolve,reject) => {
  let filteredList = [];
  if (!text.length) resolve([]);
  let textRegex = new RegExp(text,'i');
  list.forEach((c) => {
    let foundTicker = c.symbol.match(textRegex);
    let foundName =  c.name.match(textRegex);
    favourites.indexOf(c.symbol)
    //console.log(found, c.name);
    if ((foundName || foundTicker) && favourites.indexOf(c.symbol) < 0) filteredList.push({...c,relevance: ((foundName && text.length / c.name.length) || (foundTicker && text.length / c.symbol.length))});

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
      favourites: [],
      searchText: ''
    }
     this.onChangeSearch = this.onChangeSearch.bind(this);
     this.unTab = this.unTab.bind(this);
     this.addToFavourites = this.addToFavourites.bind(this);
     this.removeFromFavourites = this.removeFromFavourites.bind(this);
     this.onKeyDown = this.onKeyDown.bind(this);
  }

  onChangeSearch(evt) {
    const favourites = this.state.favourites;
    const prevSearch = this.state.searchText;
    const newText = evt.target.value.trimLeft();
    this.setState({searchText: newText});
    // filterTicker(newText).then(res => this.setState({dataList: res})); 
    if (prevSearch.length >= newText.length || prevSearch.length === 0) {
      filterTicker(newText,tickerSearch,favourites).then(res => this.setState({dataList: res})); 
    } else {
      const prevData = this.state.dataList;
      prevData.length
        ? filterTicker(newText,prevData,favourites).then(res => this.setState({dataList: res}))
        : filterTicker(newText,tickerSearch,favourites).then(res => this.setState({dataList: res})); 
    }
    
  }

  unTab(ev) {
    ev.target.tabIndex=-1;
  }

  onKeyDown(ev) {
    if (ev.target.tagName==="UL" && ev.target.firstElementChild) {
      let next;
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
      let parent = ev.target.parentElement;
      let next;
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
          curr.getElementsByClassName('star')[0].click();
          curr.tabIndex=-1;
          parent.focus();
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
    const currFave = this.state.favourites;
    const newData = this.state.dataList.filter((c) => {
      return c.symbol !== v.symbol;
    });
    this.setState({favourites: [...currFave,v], dataList: newData});
    //console.log(v);
  }

  removeFromFavourites(v) {
    const currData = this.state.dataList;
    const newFaves = this.state.favourites.filter((c) => {
      return c.symbol !== v.symbol;
    });
    this.setState({favourites: newFaves});
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
        {this.state.favourites.length ? <ul className="stock-list-holder" onKeyDown={this.onKeyDown} tabIndex='0'>
                        { this.state.favourites.slice(0,50).map((v) => {
                  return (<li key={v.symbol} onBlur={this.unTab}>
                              {StockCard(v, this.removeFromFavourites, true)}
                            </li>)
                })}
                </ul> : <div/>}
        <SearchBar text={this.state.searchText} onChangeSearch={this.onChangeSearch} />
          {this.state.dataList.length ? <ul className="stock-list-holder" onKeyDown={this.onKeyDown} tabIndex='0'>
                  {this.state.dataList.slice(0,50).map((v, i) => {
                    return (<li key={v.symbol} onBlur={this.unTab}>
                                {StockCard(v, this.addToFavourites, false)}
                              </li>)
                  })}
                </ul> : <div/>}
        </main>
      </div>
    );
  }
}

export default App;
