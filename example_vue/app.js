const Vue = require('vue');
require('../lib/DatePicker');

const app = new Vue({
    el: '#app',
    data: {
        date: '03-17-2018'
    },
    methods: {
        onChange(e) {
            const {
                target,
                detail
            } = e;

            console.log(`date changed to ${target.value} (${detail})`);
        }
    }
});
