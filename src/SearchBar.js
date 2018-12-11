import React, { Component } from 'react';
import './SearchBar.css';


class SearchBar extends Component {

  render() {
    return (
      <input className="mainSearch" type="text" name="stockSearch" value={this.props.text} placeholder="Enter Ticker Here" onChange={this.props.onChangeSearch}>

      </input>
    );
  }
}

export default SearchBar;
