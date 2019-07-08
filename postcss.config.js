module.exports = ({ env }) => ({
    plugins: {
        'postcss-flexbugs-fixes': {},
        autoprefixer: {
            flexbox: 'no-2009'
        },
        cssnano: env === 'production' ? {} : false
    }
});
