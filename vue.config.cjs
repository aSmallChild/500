const serverConfig = require('./config.cjs');

module.exports = {
    transpileDependencies: [
        'vuetify',
    ],

    // chainWebpack: config => {
    //     config.plugin('html').tap(args => {
    //         args[0]['socketHost'] = serverConfig.socketHost;
    //         return args;
    //     });
    // },
};
