module.exports = {
    entry: './app.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            { test: /\.html$/, use: 'raw-loader' }
        ]
    }
};