/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
var http = require('http');
var url = require('url');
var fs = require('fs');

var httpProxy = require('http-proxy');
var path = require('path');
var colors = require('colors');
var express = require('express');
var hbs = require('hbs');
var enchilada = require('enchilada');

var cordovaProject = require('./emulate/cordovaProject');
var conf = require('./conf');

colors.mode = 'console';

module.exports = {
    start: function (options) {
        var app = express();
        var port = options.port || conf.ports.main;

        app.use(express.bodyParser());

        app.set('views', __dirname + '/../../assets/client');
        app.set('view engine', 'html');
        app.engine('html', hbs.__express);

        if (!options.path) { options.path = [process.cwd()]; }

        if (!options.route) {
            options.route = "/ripple";
        } else if (!options.route.match(/^\//)) {
            options.route = "/" + options.route;
        }

        //app = proxy.start({route: options.route}, app);

        var panels = [];
        var overlays = [];
        var dialogs = [];

        var plugin_base = path.join(__dirname, "../client/ui/plugins");
        fs.readdirSync(plugin_base).forEach(function(plugin) {
            var dir = path.join(plugin_base, plugin);
            if (!fs.statSync(dir).isDirectory()) {
                return;
            }

            var panel_file = path.join(dir, 'panel.html');
            var overlay_file = path.join(dir, 'overlay.html');
            var dialog_file = path.join(dir, 'dialog.html');

            if (fs.existsSync(panel_file)) {
                panels.push(fs.readFileSync(panel_file, 'utf-8'));
            }
            if (fs.existsSync(overlay_file)) {
                overlays.push(fs.readFileSync(overlay_file, 'utf-8'));
            }
            if (fs.existsSync(dialog_file)) {
                dialogs.push(fs.readFileSync(dialog_file, 'utf-8'));
            }
        });

        app.use("/ripple/vendor", express.static(__dirname + "/../../thirdparty"));

        app.use("/ripple/assets", enchilada({
            src: path.normalize(__dirname + "/../client"),
            debug: true
        }));

        app.use("/themes", express.static(__dirname + "/../../assets/client/themes"));
        app.use("/ripple/assets", express.static(__dirname + "/../../assets/client"));
        app.use(cordovaProject.inject(options));

        // TODO make it so that we serve up ripple things via /ripple
        // so that root can remain for proxying the app stuff
        // or we could load app stuff on a different port
        // that would be pretty good too
        app.use('/app', function(req, res, next) {
            express.static(req.staticSource)(req, res, next);
        });

        app.use('/cordova.js', function(req, res, next) {
            var prefix = '(function() {if (window.top.ripple) { ' +
                'window.top.ripple.inject(window, document); }})();\n';

            var src = fs.readFileSync(req.staticSource + '/cordova.js', 'utf8');
            src = prefix + src;
            res.set('Content-Type', 'application/javascript');
            res.send(src);

            //express.static(req.staticSource)(req, res, next);
        });

        app.use('/', function(req, res, next) {
            if (req.path === '/') {
                return next();
            }
            express.static(req.staticSource)(req, res, next);
        });

        app.get('/', function(req, res, next) {
            res.locals.overlay_views = overlays.join('\n');
            res.locals.panel_views = panels.join('\n');
            res.locals.dialog_views = dialogs.join('\n');
            res.render('index');
        });

        // TODO does not work with custom route (since ripple does not dynamically know custom ones, yet, if set)
        app.post("/ripple/user-agent", function (req, res, next) {
            options.userAgent = unescape(req.body.userAgent);

            if (options.userAgent) {
                console.log("INFO:".green + ' Set Device User Agent (String): "' + options.userAgent + '"');
            } else {
                console.log("INFO:".green + ' Using Browser User Agent (String)');
            }

            res.send(200);
        });

        // run prepare to invoke any scripts
        // only run first request
        // other requests need to wait
        var exec = require('child_process').exec;
        var queue = undefined;
        var last = undefined;
        app.use(function(req, res, next) {
            if (queue) {
                queue.push(next);
                return;
            }

            // if last prepare was recent enough
            // don't need to do it again
            if (last && last > Date.now() - 5000) {
                return next();
            }

            queue = [];
            queue.push(next);

            exec('cordova prepare ' + req.staticPlatform, function (err, stdout, stderr) {
                last = Date.now();
                queue.forEach(function(next) {
                    next(err);
                });
                queue = undefined;
            });
        });

        var proxy = httpProxy.createProxyServer(options);

        var server = http.createServer(function(req, res) {
            var parsed = url.parse(req.url, true /* parse query */);
            if (parsed.pathname === '/ripple/xhr_proxy') {
                var target_url = parsed.query.tinyhippos_rurl;
                console.log('PROXY'.green, target_url);

                // TODO set user-agent?
                req.url = target_url;
                req.headers['user-agent'] = options.userAgent;

                return proxy.web(req, res, { target: target_url });
            }

            app(req, res);
        });

        server.listen(port);
        server._port = port;

        return server;
    }
};
