module.exports = {
    entry: './app.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules|lib/,
                loader: 'babel-loader'
            },
            {test: /\.html$/, use: 'raw-loader'}
        ]
    }
};
