import React, { Component } from 'react';
import './Newsfeed.css';


class Newsfeed extends Component {
  render() {
    return (
    	<div className={`newsfeed-container ${this.props.viewing ? "showing" : ""}`}>
        {this.props.newsfeed ? <ul className="newsfeed-list">
                  {this.props.newsfeed.map((n) => 
                    {return (<li className="newsfeed-item">
                                      {navigator.onLine ? <img className="newsfeed-item-image" src={n.urlToImage}/> : <div/>}
                                      <div className="newsfeed-item-copy">
                                        <strong>{n.title}</strong>
                                        <p>{n.source.name}</p>
                                        <p>{n.description}</p>
                                      </div>                
                                </li>)})}
                </ul> : <div/>}
      </div>
    );
  }
}

export default Newsfeed;
