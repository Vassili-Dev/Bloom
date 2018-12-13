import React, { Component } from 'react';
import './StockPreview.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { throws } from 'assert';

class SearchBar extends Component {
  render() {
    return (
    	<div className='stock-preview-container'>
    		<div className="stock-preview-head">
	      		<h4>{this.props.stock.symbol}</h4>
	      		<FontAwesomeIcon className="close-button" onClick={this.props.closePreview} icon="times"/>
	      	</div>
	      	<div className="stock-preview-content">
	      		<p>{this.props.stock.name}</p>
						{this.props.stock.quote ? <strong className={`stock-value ${(this.props.stock.quote["09. change"] < 0) ? 'red' : 'green'}`}>{this.props.stock.quote['02. open']}</strong> : ""}
	      	</div>
        </div>
    );
  }
}

export default SearchBar;
