import React, { Component } from 'react';
import './SearchBar.css';
import StockCard from './StockCard';


class SearchBar extends Component {
  render() {
    return (
    	<div className={`search-container ${this.props.focused ? "showing" : ""}`}>
	      <input className={`mainSearch ${(this.props.focused && this.props.text.length > 0)? 'focused' : ''}`} type="text" name="stockSearch" onBlur={this.props.onChangeFocus} onFocus={this.props.onChangeFocus} value={this.props.text} placeholder="Enter Ticker Here" onKeyDown={this.props.onKeyDown} onChange={this.props.onChangeSearch}></input>
	                   {this.props.dataList.length ? <ul className='stock-list-holder' onFocus={this.props.onChangeFocus} onBlur={this.props.onChangeFocus} onKeyDown={this.props.onKeyDown}>
	                      {this.props.dataList.slice(0,50).map((v, i) => {
	                        return (<li className="search-entry" key={v.symbol} onClick={(evt) => {
	                        		evt.target.blur();
	                        		this.props.onselect(v);
	                        	}} onFocus={this.props.onChangeFocus} onBlur={this.props.onChangeFocus} tabIndex={i === 0 ? '0' : -1}>
	                                    <h4>{v.symbol}</h4>
	          							<p>{v.name}</p>
	                                  </li>)
	                      })}
	                    </ul> : <div/>}
          </div>
    );
  }
}

export default SearchBar;
