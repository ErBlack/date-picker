const React = require('react');

require('../lib/DatePicker');

class Component extends React.Component {
  constructor() {
    super();
    this._onInput = this._onInput.bind(this);
  }
  render() {
    return <date-picker
      value={this.props.value}
      onInput={this._onInput}
    ></date-picker>;
  }
  _onInput(e) {
    const {
      target,
      detail
    } = e.nativeEvent;

    console.log(`date changed to ${target.value} (${detail})`);
  }
}

module.exports = Component;
