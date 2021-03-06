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
var event = require('../../event');

module.exports = {
    panel: {
        domId: "messaging-container",
        collapsed: true,
        pane: "left"
    },
    initialize: function () {
        document.getElementById("messaging-send")
            .addEventListener("click", function () {
                var number = document.getElementById("messaging-sms-number").value,
                    text = document.getElementById("messaging-text").value,
                    message = {
                        type: "sms",
                        body: text,
                        from: number,
                        time: new Date()
                    };

                event.trigger("MessageReceived", [message]);
            }, false);
    }
};
