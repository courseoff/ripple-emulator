var loadScript = require('load-script');

module.exports = {
    init: function(success_cb, err_cb, args) {
        loadScript("//connect.facebook.net/en_US/all.js", function(err) {
            if (err) {
                return err_cb(err);
            }

            FB.init({
                appId: args[0]
            });

            success_cb();
        });
    },
    login: function(success_cb, err_cb, args) {
        var scope = args[0];
        FB.login(success_cb, { scope: scope });
    }
};
