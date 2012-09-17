/*
    Location Handling Class
    -----------------------

    @provides   Location
    @requires   Mootools, Core/Number.extend
    @file       Location.js
    @package    MooLocation
    @author     Gideon Farrell <me@gideonfarrell.co.uk>
 */

define(['mootools', 'MooLocation/Number.extend'], function() {
    var Location = new Class({
        Implements: [Events],

        /**
         * Constructor
         * @param  {Number} latitude  Latitude of location (+ve => North, -ve => South)
         * @param  {Number} longitude Longitude of Location (+ve => East, -ve => West)
         * @return {void}
         */
        initialize: function(latitude, longitude) {
            var position = [];

            this.tracking = false;          // publicly available indicator
            this._activeTracking = false;   // private indicator for whether or not we are actively tracking
            this._timer = null;             // private timer id (HTML5 Geolocation API)
            this._watchid = null;           // private watch id (HTML5 Geolocation API)

            // Getters and Setters for... 
            // ... 'latitude',
            Object.defineProperty(this, 'latitude', {
                get: function() {
                    return position[0];
                },
                set: function(lat) {
                    if(typeOf(lat) != 'number' || Math.abs(lat) > 90) {
                        throw new Error('Latitude must be a number between 90 and -90.');
                    }
                    position[0] = lat;
                    this.fireEvent('update');
                }
            });

            // ... 'longitude',
            Object.defineProperty(this, 'longitude', {
                get: function() {
                    return position[1];
                },
                set: function(lon) {
                    if(typeOf(lon) != 'number' || Math.abs(lon) > 180) {
                        throw new Error('Longitude must be a number between 180 and -180.');
                    }
                    position[1] = lon;
                    this.fireEvent('update');
                }
            });

            // ... and for 'position'
            Object.defineProperty(this, 'position', {
                get: function() {
                    return position;
                },
                set: function(arr) {
                    if(typeOf(arr) != 'array' || arr.length != 2) {
                        throw new Error('Position must be an array of latitude,longitude.');
                    }
                    var lat = arr[0],
                        lon = arr[1];

                    // While this bit sort of violates the DRY principle it's necessary,
                    // as will be explained below
                    if(typeOf(lat) != 'number' || Math.abs(lat) > 90) {
                        throw new Error('Latitude must be a number between 90 and -90.');
                    }
                    if(typeOf(lon) != 'number' || Math.abs(lon) > 180) {
                        throw new Error('Longitude must be a number between 180 and -180.');
                    }

                    // We set these explicitly w/o our previously defined setters and getters so
                    // that we do not fire the 'update' event three times (once for each property)
                    position[0] = lat;
                    position[1] = lon;

                    this.fireEvent('update');
                }
            });

            this.position = [latitude, longitude];
        },

        toString: function() {
            return '['+this.latitude+','+this.longitude+']';
        },
        toJSON: function() {
            return (this.position);
        }
    });

    /**
     * Gives the distance in KM between two locations
     * @param  {Location} loc_a The first Location object
     * @param  {Location} loc_b The second Location object
     * @return {Number}         Distance in kilometres
     */
    Location.distanceBetweenLocations = function(loc_a, loc_b) {
        if(!instanceOf(loc_a, Location) || !instanceOf(loc_b, Location)) {
            throw new Error('Haversine function requires two Location objects as its arguments in order to calculate the distance between them.');
        }

        // Implementation of the Haversine formula from http://www.movable-type.co.uk/scripts/latlong.html

        var R, dLat, dLon, lat1, lat2, a, c;

        R = 6371; // radius of earth in km

        dLat = (loc_b.latitude-loc_a.latitude).toRadians();
        dLon = (loc_b.longitude-loc_a.longitude).toRadians();
        lat1 = loc_a.latitude.toRadians();
        lat2 = loc_b.latitude.toRadians();

        a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    /**
     * Factory for generating new Locations from an array of [latitude, longitude]
     * @param  {Array}    arr Lat/Lon array
     * @return {Location}     Generated Location object
     */
    Location.newLocationFromArray = function(arr) {
        if(instanceOf(arr, Array) && arr.length == 2) {
            return new Location(arr[0], arr[1]);
        } else {
            throw new Error('Invalid location array given, should be [latitude, longitude].');
        }
    };

    Location.GEO_TIMEOUT = 1000*60*2;
    Location.GEO_THRESHOLD = 25;
    Location.GEO_ERRORS = {
        1: 'Permission denied',
        2: 'Position unavailable',
        3: 'Request timeout'
    };

    Location.implement({
        /**
         * Gives the distance to another Location object
         * @param  {Location} other_location The Location to compare to
         * @return {Number}                  The distance in kilometres
         */
        distanceTo: function(other_location) {
            return Location.distanceBetweenLocations(this, other_location);
        },

        setToCurrent: function() {
            this.trackLocation({continuous: false});
        },

        trackLocation: function(options) {
            options = Object.merge({
                continuous: true,
                mode:       'passive'
            }, options);

            if(navigator.geolocation) {
                if(!this._activeTracking) this.stopTracking();

                if(options.mode == 'active') {
                    this._timer = window.setInterval(this.setToCurrent.bind(this), Location.GEO_TIMEOUT+1000);
                    this._activeTracking = true;
                } else {
                    var l = this;
                    this._watchid = navigator.geolocation.watchPosition(
                        function(position) { // Success function
                            if(position.coords.accuracy < Location.GEO_THRESHOLD) {
                                l.position = [position.coords.latitude, position.coords.longitude];
                                if(options.continuous === false) {
                                    navigator.geolocation.clearWatch(l._watchid);
                                }
                            }
                        },
                        function(error) { // Error function
                            throw new Error('Unable to get geolocation data: ' + Location.GEO_ERRORS[error.code]);
                        },
                        { // Options
                            'enableHighAccuracy': true, 'timeout': Location.GEO_TIMEOUT, 'maximumAge': 0
                        }
                    );
                }
            } else {
                throw new Error('Geolocation is not available in this browser.');
            }

            this.tracking = true;
        },

        stopTracking: function() {
            if(this._watchid !== null) {
                navigator.geolocation.clearWatch(this._watchid);
                this._watchid = null;
            }
            if(this._timer !== null) {
                window.clearInterval(this._timer);
                this._timer = null;
            }

            this._activeTracking = false;
            this.tracking = false;
        }
    });

    /**
     * Gets current location as a Location object
     * @return {Location} Current Location
     */
    Location.newFromCurrentLocation = function() {
        var loc = new Location(0,0);
        loc.setToCurrent();

        return loc;
    };

    return Location;
});