/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');
const {mapSelector} = require('../selectors/map');
const {createSelector} = require('reselect');

const assign = require('object-assign');

const {changeMousePositionCrs, changeMousePositionState} = require('../actions/mousePosition');

const selector = createSelector([
    mapSelector || {},
    (state) => state.mousePosition || {},
    (state) => {
        if (state.mousePosition.showCenter && state.map) {
            return state.map.center;
        }
        if (state.mousePosition.showOnClick) {
            if (state.mapInfo.clickPoint && state.mapInfo.clickPoint.latlng) {
                return {
                    x: state.mapInfo.clickPoint.latlng.lng,
                    y: state.mapInfo.clickPoint.latlng.lat,
                    crs: "EPSG:4326"
                };
            }
            return {
                crs: "EPSG:4326"
            };
        }
        return state.mousePosition.position;
    }
], (map, mousePosition, position) => ({
    enabled: mousePosition.enabled,
    mousePosition: position,
    crs: mousePosition.crs || map && map.projection || 'EPSG:3857'
}));

const Message = require('./locale/Message');

const CRSSelector = connect((state) => ({
    crs: state.mousePosition && state.mousePosition.crs || state.map && state.map.present && state.map.present.projection || 'EPSG:3857'
}), {
    onCRSChange: changeMousePositionCrs
})(require('../components/mapcontrols/mouseposition/CRSSelector'));

const MousePositionButton = connect((state) => ({
    pressed: state.mousePosition && state.mousePosition.enabled,
    btnConfig: {disabled: (!state.browser.touch) ? false : true}
}), {
    onClick: changeMousePositionState
})(require('../components/buttons/ToggleButton'));

const MousePositionPlugin = connect(selector)(require('../components/mapcontrols/mouseposition/MousePosition'));

module.exports = {
    MousePositionPlugin: assign(MousePositionPlugin, {
        Settings: {
            tool: <CRSSelector
                key="crsSelector"
                enabled={true}
                inputProps={{
                    label: <Message msgId="mousePositionCoordinates" />,
                    buttonBefore: <MousePositionButton
                        isButton={true}
                        text={<Message msgId="enable" />}
                        glyphicon="eye-open"
                    />
                }}
                />,
            position: 2
        }
    }),
    reducers: {mousePosition: require('../reducers/mousePosition')}
};