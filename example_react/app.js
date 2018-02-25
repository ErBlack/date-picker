const React = require('react');
const ReactDOM = require('react-dom');

require('../lib/DatePicker');

ReactDOM.render(
    <date-picker value="02-25-2018"></date-picker>,
    document.getElementById('component')
);

