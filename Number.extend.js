/*
    Number Extensions
    -----------------

    @requires   Mootools/Core
    @file       Number.extend.js
    @package    MooLocation
    @author     Gideon Farrell <me@gideonfarrell.co.uk>
 */

define(['mootools'], function() {
    Number.implement({
        toRadians: function() {
            return this * Math.PI / 180;
        },
        toDegrees: function() {
            return this * 180 / Math.PI;
        },
        round: function(places) {
            if(places === undefined) places = 0;
            var exp = Math.pow(10, places);

            return Math.round( this*exp ) / exp;
        }
    });
});