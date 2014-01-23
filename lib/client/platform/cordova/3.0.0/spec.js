/*
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
 */
var honeypot = require('../../../honeypot'),
    devices = require('../../../devices'),
    bridge = require('../2.0.0/bridge');

module.exports = {
    id: "cordova",
    version: "3.0.0",
    name: "Apache Cordova",
    type: "platform",
    nativeMethods: {},

    config: require('./spec/config'),
    device: require('../2.0.0/spec/device'),
    ui: require('../2.0.0/spec/ui'),
    events: require('../2.0.0/spec/events'),

    initialize: function (win) {
        var device = devices.getCurrentDevice(),
            cordova,
            get = function () {
                return cordova;
            },
            set = function (orig) {
                if (cordova) return;

                cordova = orig;

                cordova.define.remove("cordova/exec");
                cordova.define("cordova/exec", function (require, exports, module) {
                    module.exports = bridge.exec;
                });
            };

        bridge.add("PluginManager", require('./bridge/PluginManager'));
        bridge.add("SplashScreen", require('./bridge/splashscreen'));
        bridge.add("InAppBrowser", require('./bridge/inappbrowser'));
        bridge.add("Vibration", require('./bridge/vibration'));
        honeypot.monitor(win, "cordova").andRun(get, set);

        //HACK: BlackBerry does vibration different
        if (device.manufacturer === "BlackBerry") {
            navigator.vibrate = function (ms) {
                require('./bridge/vibration').vibrate(null, null, [ms]);
            };
        }
    },

    objects: {
        MediaError: {
            _path: require('../2.0.0/MediaError'),
            path: "cordova/2.0.0/MediaError"
        },
        Acceleration: {
            _path: require('../../w3c/1.0/Acceleration'),
            path: "w3c/1.0/Acceleration"
        },
        Coordinates: {
            _path: require('../../w3c/1.0/Coordinates'),
            path: "w3c/1.0/Coordinates"
        },
        Position: {
            _path: require('../../w3c/1.0/Position'),
            path: "w3c/1.0/Position"
        },
        PositionError: {
            _path: require('../../w3c/1.0/PositionError'),
            path: "w3c/1.0/PositionError"
        },
        navigator: {
            _path: require('../../w3c/1.0/navigator'),
            path: "w3c/1.0/navigator",
            children: {
                geolocation: {
                    _path: require('../../w3c/1.0/geolocation'),
                    path: "w3c/1.0/geolocation"
                }
            }
        },
        org: {
            children: {
                apache: {
                    children: {
                        cordova: {
                            children: {
                                Logger: {
                                    _path: require('../2.0.0/Logger'),
                                    path: "cordova/2.0.0/logger"
                                },
                                JavaPluginManager: {
                                    _path: require('../2.0.0/JavaPluginManager'),
                                    path: "cordova/2.0.0/JavaPluginManager"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
