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
var _prompt = require('../../../ui/plugins/exec-dialog'),
    emulator = {
        "App": require('./bridge/app'),
        "Accelerometer": require('./bridge/accelerometer'),
        "Compass": require('./bridge/compass'),
        "Camera": require('./bridge/camera'),
        "Capture": require('./bridge/capture'),
        "Contacts": require('./bridge/contacts'),
        "Debug Console": require('./bridge/console'),
        "Device": require('./bridge/device'),
        "File": require('./bridge/file'),
        "Geolocation": require('./bridge/geolocation'),
        "Globalization": require('./bridge/globalization'),
        "Logger": require('./bridge/logger'),
        "Media": require('./bridge/media'),
        "Network Status": require('./bridge/network'),
        "NetworkStatus": require('./bridge/network'),
        "Notification": require('./bridge/notification')
    };

module.exports = {
    add: function (service, module) {
        emulator[service] = module;
    },
    exec: function (success, fail, service, action, args) {
        try {
            emulator[service][action](success, fail, args);
        }
        catch (e) {
            console.log("missing exec:" + service + "." + action);
            console.log(args);
            console.log(e);
            console.log(e.stack);
            //TODO: this should really not log the above lines, but they are very nice for development right now
            _prompt.show(service, action, success, fail);
        }
    }
};
