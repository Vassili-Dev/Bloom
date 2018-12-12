import React, { PureComponent } from 'react';
import './StockPreview.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

class SearchBar extends PureComponent {
  render() {
    return (
    	<div className='stock-preview-container'>
    		<div className="stock-preview-head">
	      		<h4>{this.props.stock.symbol}</h4>
	      		<FontAwesomeIcon onClick={this.props.closePreview} icon="times"/>
	      	</div>
	      	<div className="stock-preview-content">
	      		<p>{this.props.stock.name}</p>
	      	</div>
        </div>
    );
  }
}

export default SearchBar;
