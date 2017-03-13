/*

 Copyright (c) 2017 Jirtdan Team and other collaborators

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

"use strict";
/*jshint esversion: 6*/

const DEFAULT_CONNECTION_PIN_RADIUS = 12;
const PIN_TYPE_IN = "in";
const PIN_TYPE_OUT = "out";

import {
    POWER_STATE_LOW,
    DEFAULT_FILL_COLOR,
    DEFAULT_STROKE_COLOR,
    BaseControl
} from './BaseControl.js'

export class ConnectionPin {

    /**
     * Constructor of ConnectionPin
     * @param parent the parent control that the pin is used for
     * @param x the x coordinate for pin
     * @param y the y coordinate for pin
     * @param type either "in" or "out"
     */
    constructor(parent, x, y, type) {
        this.control = parent;
        this.board = this.control.board;
        this.paper = this.board.paper;
        this.x = x;
        this.y = y;
        this.type = (type === PIN_TYPE_IN || type === PIN_TYPE_OUT) ? type : null;
        this.stateChangeListeners = [];
        this.state = POWER_STATE_LOW;
        this.init();
    }

    /**
     * The method that initializes the pin object.
     * This method should not be called from outside.
     */
    /**@hide*/
    init() {
        this.element = this.paper.circle(this.x, this.y, DEFAULT_CONNECTION_PIN_RADIUS);

        BaseControl.applyDefaultAttributes(this.element);

        // Assign event handlers.
        let _this = this;
        this.element.mousedown(function () {
            _this.onActionDown();
        });
        this.element.mouseup(function () {
            _this.onActionUp();
        });
        this.element.mouseover(function () {
            _this.onHoverIn();
        });
        this.element.mouseout(function () {
            _this.onHoverOut();
        });
        this.element.click(function () {
            _this.onClick();
        });
    }

    /**
     * Return the type of the current pin.
     * @returns {null|*}
     */
    getType() {
        return this.type;
    }

    /**
     * Check if the current pin is INPUT type.
     * @returns {boolean}
     */
    isInputType() {
        return this.type === PIN_TYPE_IN;
    }

    /**
     * Check if the current pin is OUTPUT type
     * @returns {boolean}
     */
    isOutputType() {
        return this.type === PIN_TYPE_OUT;
    }

    /**
     * Check if the pin represented in argument can be connected with this pin.
     * @param pin
     * @returns {boolean}
     */
    canConnect(pin) {
        if (this.control == pin.getParent()) return false;
        if (this.type == null || pin.getType() == null) return false;
        if (this.type == pin.getType()) return false;

        let inputPin = this.isInputType() ? this : pin;

        //noinspection RedundantIfStatementJS
        if (!inputPin.canConnect) return false;

        return true;
    }

    /**
     * The the parent control of this pin that belongs to.
     * @returns {*}
     */
    getParent() {
        return this.control;
    }

    /**
     * Used to translate the element during drag-drop.
     * @param x
     * @param y
     */
    translate(x, y) {
        this.element.translate(x, y);
    }

    /**
     * This sets the flag to mark it connectable or not.
     * @param enable
     */
    setCanConnect(enable) {
        this.canConnect = enable;
    }

    /**
     * Used to externally trigger the state change.
     * @param newState
     */
    notifyStateChange(newState) {
        if (newState === this.state) return;
        for (let i = 0; i < this.stateChangeListeners.length; i++) {
            this.stateChangeListeners[i](newState);
        }
    }

    /**
     * Listener is used for input/output pins and triggered when the state is changed.
     * @param listener
     */
    addStateChangeListener(listener) {

        this.stateChangeListeners.push(listener);

        if (this.isOutputType()) {
            this.notifyStateChange(this.control.getValue());
        }
    }

    /**
     * Event for input-pin down action.
     */
    onActionDown() {
        this.element.attr("stroke", "#00f");
        this.element.attr("fill", "#0f0");
    }

    /**
     * Event for input-up action.
     */
    onActionUp() {
        this.element.attr("stroke", "#f00");
        this.element.attr("fill", DEFAULT_FILL_COLOR);
    }

    /**
     * Event for hover-in action.
     */
    onHoverIn() {
        this.element.attr("stroke", "#f00");
    }

    /**
     * Event for hover-out action.
     */
    onHoverOut() {
        this.element.attr("stroke", DEFAULT_STROKE_COLOR);
    }

    onClick() {
        this.board.startFinishConnection(this);
    }
}