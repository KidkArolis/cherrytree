import './base.css'
import './application.css'
import 'suitcss-base'
import 'suitcss-utils-text'
import 'suitcss-components-arrange'
import React from 'react'

module.exports = React.createClass({
  propTypes: {
    children: React.PropTypes.any
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  link () {
    var router = this.context.router
    return router.generate.apply(router, arguments)
  },

  getInitialState () {
    var time = new Date().getTime()
    // setInterval(this.updateTime, 1000)
    return { time }
  },

  updateTime () {
    var time = new Date().getTime()
    this.setState({time})
  },

  render: function () {
    return (
      <div className='Application'>
        <div className='Navbar'>
          <div className='Navbar-header'>
            <a className='Navbar-brand' href={this.link('index')} />
          </div>
        </div>

        <div className='Application-content'>
          {this.props.children}
        </div>

        <footer className='Footer'>
          <p className='u-textCenter'>Cherrytree Demo. ·
            <a href='https://github.com/QubitProducts/cherrytree'>Cherrytree Repo</a> ·
            <a href='https://github.com/QubitProducts/cherrytree/tree/master/examples/cherry-pick'>Demo Source Code</a>
          </p>
        </footer>
      </div>
    )
  }
})
