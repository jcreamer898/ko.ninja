require.config({
    paths: {
        'underscore': '/underscore/underscore',
        'knockout': '/knockout.js/knockout'
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});