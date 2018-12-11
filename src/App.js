import React, { Component } from 'react';
import SearchBar from './SearchBar';
import StockCard from './StockCard';
import './App.css';
import { tickerSearch } from './data/tickerSearch';

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
     this.addToFavourites = this.addToFavourites.bind(this);
     this.removeFromFavourites = this.removeFromFavourites.bind(this);
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
          Bl&ouml;m
        </header>
        <main>
        <ul className="stock-list-holder">
                {this.state.favourites.length ? this.state.favourites.slice(0,50).map((v) => {
          return (<li key={v.symbol}>
                      {StockCard(v, this.removeFromFavourites, true)}
                    </li>)
        }) : <p>&nbsp;</p>}
        </ul>
        <SearchBar text={this.state.searchText} onChangeSearch={this.onChangeSearch} />
          <ul className="stock-list-holder">
        {this.state.dataList.length ? this.state.dataList.slice(0,50).map((v) => {
          return (<li key={v.symbol}>
                      {StockCard(v, this.addToFavourites, false)}
                    </li>)
        }) : <p>&nbsp;</p>}
      </ul>
        </main>
      </div>
    );
  }
}

export default App;
