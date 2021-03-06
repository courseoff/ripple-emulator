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
var _console = require('../../console'),
    platform = require('../../platform'),
    utils = require('../../utils');

module.exports = {
    panel: {
        domId: "platform-events-container",
        collapsed: true,
        pane: "right"
    },
    initialize: function () {
        var eventSelect = document.getElementById("platform-events-select"),
            spec = platform.current();

        if (!spec.events) {
            return;
        }

        utils.forEach(spec.events, function (method, name) {
            eventSelect.appendChild(utils.createElement("option", {
                "innerHTML": name,
                "value": name
            }));
        });

        jQuery("#platform-events-fire").click(function () {
            var eventName = document.getElementById("platform-events-select").value,
                args = spec.events[eventName].args ? document.getElementById("platform-events-args").value : null,
                callback = spec.events[eventName].callback;

            _console.log("fired event => " + eventName);

            try {
                callback(args);
            } catch (e) {
                _console.log("Failed to raise: " + eventName);
                _console.log(e);
            }
        });

        jQuery(eventSelect).change(function () {
            var argsSelect = jQuery("#platform-events-args"),
                args = spec.events[this.value].args;

            argsSelect.empty();

            if (args) {
                utils.forEach(spec.events[this.value].args, function (arg, index) {
                    argsSelect.append(utils.createElement("option", {
                        innerHTML: arg,
                        value: index
                    }));
                });

                argsSelect.show();
            } else {
                argsSelect.hide();
            }
        });
    }
};
