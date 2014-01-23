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
var _bound,
    _console = require('./console');

function _bindObjects(win, doc) {
    if (!win.tinyHippos) {
        require('./emulatorBridge').init(win, doc);
        require('./touchEventEmulator').init(win, doc);
        require('./deviceMotionEmulator').init(win, doc);
        require('./resizer').init(win, doc);
        require('./cssMediaQueryEmulator').init(win, doc);
        _bound = true;
    }
}

function _createFrame(src) {
    var frame = document.createElement("iframe");
    frame.setAttribute("id", "document");
    frame.src = src;
    return frame;
}

function _post(src) {
    var event = require('./event'),
        frame = _createFrame(src);

    _console.log("Initialization Finished (Make it so.)");

    frame.onload = function () {
        var bootLoader = document.querySelector("#emulator-booting"),
            id;
        if (bootLoader) {
            document.querySelector("#ui").removeChild(bootLoader);
        }

        event.trigger("TinyHipposLoaded");

        window.setTimeout(function () {
            window.clearInterval(id);
        }, 1200);
    };

    // append frame
    document.getElementById("viewport-container").appendChild(frame);

    delete tinyHippos.boot;
}

function _bootstrap() {
    if (console.clear) {
        console.clear();
    }

    window.ripple = {
        inject: module.exports.inject
    };

    _console.log("Ripple :: Environment Warming Up (Tea. Earl Gray. Hot.)");

    window.tinyHippos = require('./index');

    tinyHippos.boot(function () {
        var uri = document.documentURI.replace(/enableripple=[^&]*[&]?/i, "").replace(/[\?&]*$/, "");
        _post(uri + 'app');
        delete tinyHippos.boot;
    });
}

module.exports = {
    bootstrap: _bootstrap,
    inject: function (frameWindow, frameDocument) {
        _bindObjects(frameWindow, frameDocument);
    }
};

module.exports.bootstrap();
