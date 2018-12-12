import React, { Component } from 'react';
import SearchBar from './SearchBar';
import StockPreview from './StockPreview';
import StockCard from './StockCard';
import './App.css';
import { tickerSearch } from './data/tickerSearch';
import { keys } from './constants/keys';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

let timeout;

library.add(faTimes);
const filterTicker = (text, list,favourites) => { return new Promise((resolve,reject) => {
  let filteredList = [];
  if (!text.length) resolve([]);
  let textRegex = new RegExp(text,'i');
  list.forEach((c) => {
    let foundTicker = c.symbol.match(textRegex);
    let foundName =  c.name.match(textRegex);
    //favourites.indexOf(c.symbol)
    //console.log(found, c.name);
    if ((foundName || foundTicker) && !favourites.filter(v => v.symbol === c.symbol).length) filteredList.push({...c,relevance: ((foundName && text.length / c.name.length) || (foundTicker && text.length / c.symbol.length))});

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
    const currFave = this.state.favourites;
    const newData = this.state.dataList.filter((c) => {
      return c.symbol !== v.symbol;
    });
    clearTimeout(timeout);
    this.setState({favourites: [...currFave,v], dataList: newData, searching:false});
    //console.log(v);
  }

  previewStock(v) {
    // const newData = this.state.dataList.filter((c) => {
    //   return c.symbol !== v.symbol;
    // });
    clearTimeout(timeout);
    // this.setState({preview: v, dataList: newData, searching:false});
    this.setState({preview: v, searching:false});
    //console.log(v);
  }

  closePreview(v) {
    this.setState({preview: {}});
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
            <SearchBar id="searchBar" text={this.state.searchText} onselect={this.previewStock} focused={this.state.searching} onChangeSearch={this.onChangeSearch} dataList={this.state.dataList} onChangeFocus={this.onChangeFocusSearch} onKeyDown={this.onKeyDown}/>
            {this.state.preview.symbol ? <StockPreview stock={this.state.preview} closePreview={this.closePreview}/> : <div/>}
        </main>
      </div>
    );
  }
}

export default App;
