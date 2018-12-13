import React, { Component } from 'react';
import './StockPreview.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { throws } from 'assert';

class SearchBar extends Component {
  render() {
    return (
    	<div className='stock-preview-container'>
    		<div className="stock-preview-head">
    			<div className="padder"/>
	      		<h4>{this.props.stock.symbol}</h4>
	      		<FontAwesomeIcon className="close-button" onClick={this.props.closePreview} icon="times-circle"/>
	      	</div>
	      	<div className="stock-preview-content">
	      		<p>{this.props.stock.name}</p>
						{this.props.stock.quote ? <strong className={`stock-value ${(this.props.stock.quote["09. change"] < 0) ? 'red' : 'green'}`}>{this.props.stock.quote['02. open']}</strong> : ""}
	      	</div>
	      	<div className="stock-preview-footer">
	      		<FontAwesomeIcon className="news-button" onClick={this.props.closePreview} icon="newspaper"/>
	      		<FontAwesomeIcon className="menu-button" onClick={this.props.closePreview} icon="bars"/>
	      		<FontAwesomeIcon className={`bookmark-button ${this.props.stock.bookmarked ? "bookmarked" : ""}`} onClick={() => this.props.onBookmark(this.props.stock)} icon="bookmark"/>
	      	</div>
        </div>
    );
  }
}

export default SearchBar;
