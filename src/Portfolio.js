import React, { Component } from 'react';
import './Portfolio.css';


class Portfolio extends Component {
  render() {
    return (
    	<div className={`portfolio-container ${this.props.focused ? "showing" : ""}`}>
    		<h2>Portfolio</h2>
           {this.props.dataList.length ? <ul className='bookmarked-stock-holder'  onKeyDown={this.props.onKeyDown}>
              {this.props.dataList.slice(0,50).map((v, i) => {
                return (<li className="bookmarked-stock" key={v.symbol} onClick={(evt) => {
                		evt.target.blur();
                		this.props.onselect(v);
                	}} tabIndex={i === 0 ? '0' : -1}>
                            <h4>{v.symbol}</h4>
  							<p>{v.name}</p>
                          </li>)
              })}
            </ul> : <div/>}
          </div>
    );
  }
}

export default Portfolio;
