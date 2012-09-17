HTML5 Geolocation Library
=========================

## Preamble

#### Authors
* Gideon Farrell [http://www.gideonfarrell.co.uk](http://www.gideonfarrell.co.uk)

#### Requires

* RequireJS
* Mootools/Core/Class
* Mootools/Core/Class/Extras/Events

#### Provides

* Location
* Extra Number methods

#### License

Copyright (c) 2012 Gideon Farrell [<me@gideonfarrell.co.uk>](mailto:me@gideonfarrell.co.uk)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Usage

### Creating a new Location object

	var loc = new Location(latitude, longitude)
	
* latitude (*Number*) must be between **-90** and **+90**
* longitude (*Number*) must be between **-180** and **+180**

### Other factory methods

The **Location** class comes with some factory methods for creating new **Location**s, namely `newLocationFromArray` and `newFromCurrentLocation`.

	var location_array = [lat, lon],
		loc            = Location.newLocationFromArray(location_array);
		
This creates a new **Location** object from an array of latitude and longitude. Useful when de-serialising data (e.g. from JSON).

	var loc = Location.newFromCurrentLocation();
	
This creates a new **Location** object which then tries to get the current location. An *update* event will be fired when the current location is found.

### Manually setting the location

You can change the *latitude* and *longitude* of the **Location** instance by accessing its properties directly, e.g.:

	var loc = new Location(0,0);	// Set latitude and longitude to 0,0
	
	// Setting latitude and longitude directly
	loc.latitude  = 53;
	loc.longitude = 21;
	
Each time *latitude* or *longitude* is set, an *update* event is fired on the instance. If you need to set both properties, however, you probably do not want two events to be fired, thus a convenience property, *position*, which can be used to set both:

	loc.position = [53, 21];

This achieves the same as the above code (without the instantiation, of course) but in one line and with only one event being triggered.

### Finding the distance between locations

To find the distance between two locations (let's call them `loc_a` and `loc_b`) we have two options: either we can use the class level method `distanceBetweenLocations` or the instance level method `distanceTo`. For example, these two give the same result:

	Location.distanceBetweenLocations(loc_a, loc_b);
	
	loc_a.distanceTo(loc_b);
	
### Serialisation of the **Location** object

For data storage and transmission, **Location** provides two serialisation methods: `toString` and `toJSON`:

	var loc = new Location(53, 21);
	
	loc.toString();						// "[53,21]"
	loc.toJSON();						// [53,21]

When retrieved from the serialised format, one should use the factory method `newLocationFromArray`, but the string format must first be parsed by a **JSON** parser to convert it to an array.