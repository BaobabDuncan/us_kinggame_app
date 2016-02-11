/*
 * PhoneGap v1.1.0 is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 * 
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 * Copyright (c) 2011, Codevise Solutions Ltd.
 * Copyright (c) 2011, Proyectos Equis Ka, S.L.
 * 
 */

if (typeof PhoneGap === "undefined") {

if (typeof(DeviceInfo) !== 'object'){
    DeviceInfo = {};
}
/**
 * This represents the PhoneGap API itself, and provides a global namespace for accessing
 * information about the state of PhoneGap.
 * @class
 */
PhoneGap = {
    // This queue holds the currently executing command and all pending
    // commands executed with PhoneGap.exec().
    commandQueue: [],
    // Indicates if we're currently in the middle of flushing the command
    // queue on the native side.
    commandQueueFlushing: false,
    _constructors: [],
    documentEventHandler: {},   // Collection of custom document event handlers
    windowEventHandler: {} 
};

/**
 * List of resource files loaded by PhoneGap.
 * This is used to ensure JS and other files are loaded only once.
 */
PhoneGap.resources = {base: true};

/**
 * Determine if resource has been loaded by PhoneGap
 *
 * @param name
 * @return
 */
PhoneGap.hasResource = function(name) {
    return PhoneGap.resources[name];
};

/**
 * Add a resource to list of loaded resources by PhoneGap
 *
 * @param name
 */
PhoneGap.addResource = function(name) {
    PhoneGap.resources[name] = true;
};

/**
 * Boolean flag indicating if the PhoneGap API is available and initialized.
 */ // TODO: Remove this, it is unused here ... -jm
PhoneGap.available = DeviceInfo.uuid != undefined;

/**
 * Add an initialization function to a queue that ensures it will run and initialize
 * application constructors only once PhoneGap has been initialized.
 * @param {Function} func The function callback you want run once PhoneGap is initialized
 */
PhoneGap.addConstructor = function(func) {
    var state = document.readyState;
    if ( ( state == 'loaded' || state == 'complete' ) && DeviceInfo.uuid != null )
    {
        func();
    }
    else
    {
        PhoneGap._constructors.push(func);
    }
};

(function() 
 {
    var timer = setInterval(function()
    {
                            
        var state = document.readyState;
                            
        if ( ( state == 'loaded' || state == 'complete' ) && DeviceInfo.uuid != null )
        {
            clearInterval(timer); // stop looking
            // run our constructors list
            while (PhoneGap._constructors.length > 0) 
            {
                var constructor = PhoneGap._constructors.shift();
                try 
                {
                    constructor();
                } 
                catch(e) 
                {
                    if (typeof(console['log']) == 'function')
                    {
                        console.log("Failed to run constructor: " + console.processMessage(e));
                    }
                    else
                    {
                        alert("Failed to run constructor: " + e.message);
                    }
                }
            }
            // all constructors run, now fire the deviceready event
            var e = document.createEvent('Events'); 
            e.initEvent('deviceready');
            document.dispatchEvent(e);
        }
    }, 1);
})();

// session id for calls
PhoneGap.sessionKey = 0;

// centralized callbacks
PhoneGap.callbackId = 0;
PhoneGap.callbacks = {};
PhoneGap.callbackStatus = {
    NO_RESULT: 0,
    OK: 1,
    CLASS_NOT_FOUND_EXCEPTION: 2,
    ILLEGAL_ACCESS_EXCEPTION: 3,
    INSTANTIATION_EXCEPTION: 4,
    MALFORMED_URL_EXCEPTION: 5,
    IO_EXCEPTION: 6,
    INVALID_ACTION: 7,
    JSON_EXCEPTION: 8,
    ERROR: 9
    };

/**
 * Creates a gap bridge iframe used to notify the native code about queued
 * commands.
 *
 * @private
 */
PhoneGap.createGapBridge = function() {
    gapBridge = document.createElement("iframe");
    gapBridge.setAttribute("style", "display:none;");
    gapBridge.setAttribute("height","0px");
    gapBridge.setAttribute("width","0px");
    gapBridge.setAttribute("frameborder","0");
    document.documentElement.appendChild(gapBridge);
    return gapBridge;
}

/** 
 * Execute a PhoneGap command by queuing it and letting the native side know
 * there are queued commands. The native side will then request all of the
 * queued commands and execute them.
 *
 * Arguments may be in one of two formats:
 *
 * FORMAT ONE (preferable)
 * The native side will call PhoneGap.callbackSuccess or
 * PhoneGap.callbackError, depending upon the result of the action.
 *
 * @param {Function} success    The success callback
 * @param {Function} fail       The fail callback
 * @param {String} service      The name of the service to use
 * @param {String} action       The name of the action to use
 * @param {String[]} [args]     Zero or more arguments to pass to the method
 *      
 * FORMAT TWO
 * @param {String} command    Command to be run in PhoneGap, e.g.
 *                            "ClassName.method"
 * @param {String[]} [args]   Zero or more arguments to pass to the method
 *                            object parameters are passed as an array object
 *                            [object1, object2] each object will be passed as
 *                            JSON strings 
 */
PhoneGap.exec = function() { 
    if (!PhoneGap.available) {
        alert("ERROR: Attempting to call PhoneGap.exec()"
              +" before 'deviceready'. Ignoring.");
        return;
    }

    var successCallback, failCallback, service, action, actionArgs;
    var callbackId = null;
    if (typeof arguments[0] !== "string") {
        // FORMAT ONE
        successCallback = arguments[0];
        failCallback = arguments[1];
        service = arguments[2];
        action = arguments[3];
        actionArgs = arguments[4];

        // Since we need to maintain backwards compatibility, we have to pass
        // an invalid callbackId even if no callback was provided since plugins
        // will be expecting it. The PhoneGap.exec() implementation allocates
        // an invalid callbackId and passes it even if no callbacks were given.
        callbackId = 'INVALID';
    } else {
        // FORMAT TWO
        splitCommand = arguments[0].split(".");
        action = splitCommand.pop();
        service = splitCommand.join(".");
        actionArgs = Array.prototype.splice.call(arguments, 1);
    }
    
    // Start building the command object.
    var command = {
        className: service,
        methodName: action,
        arguments: []
    };

    // Register the callbacks and add the callbackId to the positional
    // arguments if given.
    if (successCallback || failCallback) {
        callbackId = service + PhoneGap.callbackId++;
        PhoneGap.callbacks[callbackId] = 
            {success:successCallback, fail:failCallback};
    }
    if (callbackId != null) {
        command.arguments.push(callbackId);
    }

    for (var i = 0; i < actionArgs.length; ++i) {
        var arg = actionArgs[i];
        if (arg == undefined || arg == null) {
            continue;
        } else if (typeof(arg) == 'object') {
            command.options = arg;
        } else {
            command.arguments.push(arg);
        }
    }

    // Stringify and queue the command. We stringify to command now to
    // effectively clone the command arguments in case they are mutated before
    // the command is executed.
    PhoneGap.commandQueue.push(JSON.stringify(command));

    // If the queue length is 1, then that means it was empty before we queued
    // the given command, so let the native side know that we have some
    // commands to execute, unless the queue is currently being flushed, in
    // which case the command will be picked up without notification.
    if (PhoneGap.commandQueue.length == 1 && !PhoneGap.commandQueueFlushing) {
        if (!PhoneGap.gapBridge) {
            PhoneGap.gapBridge = PhoneGap.createGapBridge();
        }

        PhoneGap.gapBridge.src = "gap://ready";
    }
}

/**
 * Called by native code to retrieve all queued commands and clear the queue.
 */
PhoneGap.getAndClearQueuedCommands = function() {
  json = JSON.stringify(PhoneGap.commandQueue);
  PhoneGap.commandQueue = [];
  return json;
}

/**
 * Called by native code when returning successful result from an action.
 *
 * @param callbackId
 * @param args
 *        args.status - PhoneGap.callbackStatus
 *        args.message - return value
 *        args.keepCallback - 0 to remove callback, 1 to keep callback in PhoneGap.callbacks[]
 */
PhoneGap.callbackSuccess = function(callbackId, args) {
    if (PhoneGap.callbacks[callbackId]) {

        // If result is to be sent to callback
        if (args.status == PhoneGap.callbackStatus.OK) {
            try {
                if (PhoneGap.callbacks[callbackId].success) {
                       PhoneGap.callbacks[callbackId].success(args.message);
                }
            }
            catch (e) {
                console.log("Error in success callback: "+callbackId+" = "+e);
            }
        }
    
        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
        }
    }
};

/**
 * Called by native code when returning error result from an action.
 *
 * @param callbackId
 * @param args
 */
PhoneGap.callbackError = function(callbackId, args) {
    if (PhoneGap.callbacks[callbackId]) {
        try {
            if (PhoneGap.callbacks[callbackId].fail) {
                PhoneGap.callbacks[callbackId].fail(args.message);
            }
        }
        catch (e) {
            console.log("Error in error callback: "+callbackId+" = "+e);
        }
        
        // Clear callback if not expecting any more results
        if (!args.keepCallback) {
            delete PhoneGap.callbacks[callbackId];
        }
    }
};


/**
 * Does a deep clone of the object.
 *
 * @param obj
 * @return
 */
PhoneGap.clone = function(obj) {
    if(!obj) { 
        return obj;
    }

    if(obj instanceof Array){
        var retVal = new Array();
        for(var i = 0; i < obj.length; ++i){
            retVal.push(PhoneGap.clone(obj[i]));
        }
        return retVal;
    }

    if (obj instanceof Function) {
        return obj;
    }

    if(!(obj instanceof Object)){
        return obj;
    }
    
    if (obj instanceof Date) {
        return obj;
    }

    retVal = new Object();
    for(i in obj){
        if(!(i in retVal) || retVal[i] != obj[i]) {
            retVal[i] = PhoneGap.clone(obj[i]);
        }
    }
    return retVal;
};

// Intercept calls to document.addEventListener 
PhoneGap.m_document_addEventListener = document.addEventListener;

// Intercept calls to window.addEventListener
PhoneGap.m_window_addEventListener = window.addEventListener;

/**
 * Add a custom window event handler.
 *
 * @param {String} event            The event name that callback handles
 * @param {Function} callback       The event handler
 */
PhoneGap.addWindowEventHandler = function(event, callback) {
    PhoneGap.windowEventHandler[event] = callback;
}

/**
 * Add a custom document event handler.
 *
 * @param {String} event            The event name that callback handles
 * @param {Function} callback       The event handler
 */
PhoneGap.addDocumentEventHandler = function(event, callback) {
    PhoneGap.documentEventHandler[event] = callback;
}

/**
 * Intercept adding document event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
document.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
           
    // If subscribing to an event that is handled by a plugin
    if (typeof PhoneGap.documentEventHandler[e] !== "undefined") {
        if (PhoneGap.documentEventHandler[e](e, handler, true)) {
            return; // Stop default behavior
        }
    }
    
    PhoneGap.m_document_addEventListener.call(document, evt, handler, capture); 
};

/**
 * Intercept adding window event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
window.addEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();
        
    // If subscribing to an event that is handled by a plugin
    if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
        if (PhoneGap.windowEventHandler[e](e, handler, true)) {
            return; // Stop default behavior
        }
    }
        
    PhoneGap.m_window_addEventListener.call(window, evt, handler, capture);
};

// Intercept calls to document.removeEventListener and watch for events that
// are generated by PhoneGap native code
PhoneGap.m_document_removeEventListener = document.removeEventListener;

// Intercept calls to window.removeEventListener
PhoneGap.m_window_removeEventListener = window.removeEventListener;

/**
 * Intercept removing document event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
document.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();

    // If unsubcribing from an event that is handled by a plugin
    if (typeof PhoneGap.documentEventHandler[e] !== "undefined") {
        if (PhoneGap.documentEventHandler[e](e, handler, false)) {
            return; // Stop default behavior
        }
    }

    PhoneGap.m_document_removeEventListener.call(document, evt, handler, capture);
};

/**
 * Intercept removing window event listeners and handle our own
 *
 * @param {Object} evt
 * @param {Function} handler
 * @param capture
 */
window.removeEventListener = function(evt, handler, capture) {
    var e = evt.toLowerCase();

    // If unsubcribing from an event that is handled by a plugin
    if (typeof PhoneGap.windowEventHandler[e] !== "undefined") {
        if (PhoneGap.windowEventHandler[e](e, handler, false)) {
            return; // Stop default behavior
        }
    }

    PhoneGap.m_window_removeEventListener.call(window, evt, handler, capture);
};

/**
 * Method to fire document event
 *
 * @param {String} type             The event type to fire
 * @param {Object} data             Data to send with event
 */
PhoneGap.fireDocumentEvent = function(type, data) {
    var e = document.createEvent('Events');
    e.initEvent(type);
    if (data) {
        for (var i in data) {
            e[i] = data[i];
        }
    }
    document.dispatchEvent(e);
};

/**
 * Method to fire window event
 *
 * @param {String} type             The event type to fire
 * @param {Object} data             Data to send with event
 */
PhoneGap.fireWindowEvent = function(type, data) {
    var e = document.createEvent('Events');
    e.initEvent(type);
    if (data) {
        for (var i in data) {
            e[i] = data[i];
        }
    }
    window.dispatchEvent(e);
};

/**
 * Method to fire event from native code
 * Leaving this generic version to handle problems with iOS 3.x. Is currently used by orientation and battery events
 * Remove when iOS 3.x no longer supported and call fireWindowEvent or fireDocumentEvent directly
 */
PhoneGap.fireEvent = function(type, target, data) {
    var e = document.createEvent('Events');
    e.initEvent(type);
    if (data) {
        for (var i in data) {
            e[i] = data[i];
        }
    }
    target = target || document;
    if (target.dispatchEvent === undefined) { // ie window.dispatchEvent is undefined in iOS 3.x
        target = document;
    } 

    target.dispatchEvent(e);
};
/**
 * Create a UUID
 *
 * @return
 */
PhoneGap.createUUID = function() {
    return PhoneGap.UUIDcreatePart(4) + '-' +
        PhoneGap.UUIDcreatePart(2) + '-' +
        PhoneGap.UUIDcreatePart(2) + '-' +
        PhoneGap.UUIDcreatePart(2) + '-' +
        PhoneGap.UUIDcreatePart(6);
};

PhoneGap.UUIDcreatePart = function(length) {
    var uuidpart = "";
    for (var i=0; i<length; i++) {
        var uuidchar = parseInt((Math.random() * 256)).toString(16);
        if (uuidchar.length == 1) {
            uuidchar = "0" + uuidchar;
        }
        uuidpart += uuidchar;
    }
    return uuidpart;
};
};


if (!PhoneGap.hasResource("debugconsole")) {
	PhoneGap.addResource("debugconsole");
	
/**
 * This class provides access to the debugging console.
 * @constructor
 */
var DebugConsole = function() {
    this.winConsole = window.console;
    this.logLevel = DebugConsole.INFO_LEVEL;
}

// from most verbose, to least verbose
DebugConsole.ALL_LEVEL    = 1; // same as first level
DebugConsole.INFO_LEVEL   = 1;
DebugConsole.WARN_LEVEL   = 2;
DebugConsole.ERROR_LEVEL  = 4;
DebugConsole.NONE_LEVEL   = 8;
													
DebugConsole.prototype.setLevel = function(level) {
    this.logLevel = level;
};

/**
 * Utility function for rendering and indenting strings, or serializing
 * objects to a string capable of being printed to the console.
 * @param {Object|String} message The string or object to convert to an indented string
 * @private
 */
DebugConsole.prototype.processMessage = function(message, maxDepth) {
	if (maxDepth === undefined) maxDepth = 0;
    if (typeof(message) != 'object') {
        return (this.isDeprecated ? "WARNING: debug object is deprecated, please use console object \n" + message : message);
    } else {
        /**
         * @function
         * @ignore
         */
        function indent(str) {
            return str.replace(/^/mg, "    ");
        }
        /**
         * @function
         * @ignore
         */
        function makeStructured(obj, depth) {
            var str = "";
            for (var i in obj) {
                try {
                    if (typeof(obj[i]) == 'object' && depth < maxDepth) {
                        str += i + ":\n" + indent(makeStructured(obj[i])) + "\n";
                    } else {
                        str += i + " = " + indent(String(obj[i])).replace(/^    /, "") + "\n";
                    }
                } catch(e) {
                    str += i + " = EXCEPTION: " + e.message + "\n";
                }
            }
            return str;
        }
        
        return ("Object:\n" + makeStructured(message, maxDepth));
    }
};

/**
 * Print a normal log message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.log = function(message, maxDepth) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.INFO_LEVEL)
        PhoneGap.exec(null, null, 'com.phonegap.debugconsole', 'log',
            [ this.processMessage(message, maxDepth), { logLevel: 'INFO' } ]
        );
    else
        this.winConsole.log(message);
};

/**
 * Print a warning message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.warn = function(message, maxDepth) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.WARN_LEVEL)
    	PhoneGap.exec(null, null, 'com.phonegap.debugconsole', 'log',
            [ this.processMessage(message, maxDepth), { logLevel: 'WARN' } ]
        );
    else
        this.winConsole.error(message);
};

/**
 * Print an error message to the console
 * @param {Object|String} message Message or object to print to the console
 */
DebugConsole.prototype.error = function(message, maxDepth) {
    if (PhoneGap.available && this.logLevel <= DebugConsole.ERROR_LEVEL)
		PhoneGap.exec(null, null, 'com.phonegap.debugconsole', 'log',
            [ this.processMessage(message, maxDepth), { logLevel: 'ERROR' } ]
        );
    else
        this.winConsole.error(message);
};

PhoneGap.addConstructor(function() {
    window.console = new DebugConsole();
});
};
if (!PhoneGap.hasResource("position")) {
	PhoneGap.addResource("position");

/**
 * This class contains position information.
 * @param {Object} lat
 * @param {Object} lng
 * @param {Object} acc
 * @param {Object} alt
 * @param {Object} altAcc
 * @param {Object} head
 * @param {Object} vel
 * @constructor
 */
Position = function(coords, timestamp) {
	this.coords = Coordinates.cloneFrom(coords);
    this.timestamp = timestamp || new Date().getTime();
};

Position.prototype.equals = function(other) {
    return (this.coords && other && other.coords &&
            this.coords.latitude == other.coords.latitude &&
            this.coords.longitude == other.coords.longitude);
};

Position.prototype.clone = function()
{
    return new Position(
        this.coords? this.coords.clone() : null,
        this.timestamp? this.timestamp : new Date().getTime()
    );
}

Coordinates = function(lat, lng, alt, acc, head, vel, altAcc) {
	/**
	 * The latitude of the position.
	 */
	this.latitude = lat;
	/**
	 * The longitude of the position,
	 */
	this.longitude = lng;
	/**
	 * The altitude of the position.
	 */
	this.altitude = alt;
	/**
	 * The accuracy of the position.
	 */
	this.accuracy = acc;
	/**
	 * The direction the device is moving at the position.
	 */
	this.heading = head;
	/**
	 * The velocity with which the device is moving at the position.
	 */
	this.speed = vel;
	/**
	 * The altitude accuracy of the position.
	 */
	this.altitudeAccuracy = (altAcc != 'undefined') ? altAcc : null; 
};

Coordinates.prototype.clone = function()
{
    return new Coordinates(
        this.latitude,
        this.longitude,
        this.altitude,
        this.accuracy,
        this.heading,
        this.speed,
        this.altitudeAccuracy
    );
};

Coordinates.cloneFrom = function(obj)
{
    return new Coordinates(
        obj.latitude,
        obj.longitude,
        obj.altitude,
        obj.accuracy,
        obj.heading,
        obj.speed,
        obj.altitudeAccuracy
    );
};

/**
 * This class specifies the options for requesting position data.
 * @constructor
 */
PositionOptions = function(enableHighAccuracy, timeout, maximumAge) {
	/**
	 * Specifies the desired position accuracy.
	 */
	this.enableHighAccuracy = enableHighAccuracy || false;
	/**
	 * The timeout after which if position data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = timeout || 10000;
	/**
     * The age of a cached position whose age is no greater than the specified time 
     * in milliseconds. 
     */
	this.maximumAge = maximumAge || 0;
	
	if (this.maximumAge < 0) {
		this.maximumAge = 0;
	}
};

/**
 * This class contains information about any GPS errors.
 * @constructor
 */
PositionError = function(code, message) {
	this.code = code || 0;
	this.message = message || "";
};

PositionError.UNKNOWN_ERROR = 0;
PositionError.PERMISSION_DENIED = 1;
PositionError.POSITION_UNAVAILABLE = 2;
PositionError.TIMEOUT = 3;

};if (!PhoneGap.hasResource("acceleration")) {
	PhoneGap.addResource("acceleration");
 	

/**
 * This class contains acceleration information
 * @constructor
 * @param {Number} x The force applied by the device in the x-axis.
 * @param {Number} y The force applied by the device in the y-axis.
 * @param {Number} z The force applied by the device in the z-axis.
 */
Acceleration = function(x, y, z) {
	/**
	 * The force applied by the device in the x-axis.
	 */
	this.x = x;
	/**
	 * The force applied by the device in the y-axis.
	 */
	this.y = y;
	/**
	 * The force applied by the device in the z-axis.
	 */
	this.z = z;
	/**
	 * The time that the acceleration was obtained.
	 */
	this.timestamp = new Date().getTime();
}

/**
 * This class specifies the options for requesting acceleration data.
 * @constructor
 */
AccelerationOptions = function() {
	/**
	 * The timeout after which if acceleration data cannot be obtained the errorCallback
	 * is called.
	 */
	this.timeout = 10000;
}
};if (!PhoneGap.hasResource("accelerometer")) {
	PhoneGap.addResource("accelerometer");

/**
 * This class provides access to device accelerometer data.
 * @constructor
 */
Accelerometer = function() 
{
	/**
	 * The last known acceleration.
	 */
	this.lastAcceleration = new Acceleration(0,0,0);
}

/**
 * Asynchronously aquires the current acceleration.
 * @param {Function} successCallback The function to call when the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */
Accelerometer.prototype.getCurrentAcceleration = function(successCallback, errorCallback, options) {
	// If the acceleration is available then call success
	// If the acceleration is not available then call error
	
	// Created for iPhone, Iphone passes back _accel obj litteral
	if (typeof successCallback == "function") {
		successCallback(this.lastAcceleration);
	}
};

// private callback called from Obj-C by name
Accelerometer.prototype._onAccelUpdate = function(x,y,z)
{
   this.lastAcceleration = new Acceleration(x,y,z);
};

/**
 * Asynchronously aquires the acceleration repeatedly at a given interval.
 * @param {Function} successCallback The function to call each time the acceleration
 * data is available
 * @param {Function} errorCallback The function to call when there is an error 
 * getting the acceleration data.
 * @param {AccelerationOptions} options The options for getting the accelerometer data
 * such as timeout.
 */

Accelerometer.prototype.watchAcceleration = function(successCallback, errorCallback, options) {
	//this.getCurrentAcceleration(successCallback, errorCallback, options);
	// TODO: add the interval id to a list so we can clear all watches
 	var frequency = (options != undefined && options.frequency != undefined) ? options.frequency : 10000;
	var updatedOptions = {
		desiredFrequency:frequency 
	}
	PhoneGap.exec(null, null, "com.phonegap.accelerometer", "start", [options]);

	return setInterval(function() {
		navigator.accelerometer.getCurrentAcceleration(successCallback, errorCallback, options);
	}, frequency);
};

/**
 * Clears the specified accelerometer watch.
 * @param {String} watchId The ID of the watch returned from #watchAcceleration.
 */
Accelerometer.prototype.clearWatch = function(watchId) {
	PhoneGap.exec(null, null, "com.phonegap.accelerometer", "stop", []);
	clearInterval(watchId);
};

Accelerometer.install = function()
{
    if (typeof navigator.accelerometer == "undefined") {
		navigator.accelerometer = new Accelerometer();
	}
};

Accelerometer.installDeviceMotionHandler = function()
{
	if (!(window.DeviceMotionEvent == undefined)) {
		// supported natively, so we don't have to add support
		return;
	}	
	
	var self = this;
	var devicemotionEvent = 'devicemotion';
	self.deviceMotionWatchId = null;
	self.deviceMotionListenerCount = 0;
	self.deviceMotionLastEventTimestamp = 0;
	
	// backup original `window.addEventListener`, `window.removeEventListener`
    var _addEventListener = window.addEventListener;
    var _removeEventListener = window.removeEventListener;
													
	var windowDispatchAvailable = !(window.dispatchEvent === undefined); // undefined in iOS 3.x
													
	var accelWin = function(acceleration) {
		var evt = document.createEvent('Events');
	    evt.initEvent(devicemotionEvent);
	
		evt.acceleration = null; // not all devices have gyroscope, don't care for now if we actually have it.
		evt.rotationRate = null; // not all devices have gyroscope, don't care for now if we actually have it:
		evt.accelerationIncludingGravity = acceleration; // accelerometer, all iOS devices have it
		
		var currentTime = new Date().getTime();
		evt.interval =  (self.deviceMotionLastEventTimestamp == 0) ? 0 : (currentTime - self.deviceMotionLastEventTimestamp);
		self.deviceMotionLastEventTimestamp = currentTime;
		
		if (windowDispatchAvailable) {
			window.dispatchEvent(evt);
		} else {
			document.dispatchEvent(evt);
		}
	};
	
	var accelFail = function() {
		
	};
													
    // override `window.addEventListener`
    window.addEventListener = function() {
        if (arguments[0] === devicemotionEvent) {
            ++(self.deviceMotionListenerCount);
			if (self.deviceMotionListenerCount == 1) { // start
				self.deviceMotionWatchId = navigator.accelerometer.watchAcceleration(accelWin, accelFail, { frequency:500});
			}
		} 
													
		if (!windowDispatchAvailable) {
			return document.addEventListener.apply(this, arguments);
		} else {
			return _addEventListener.apply(this, arguments);
		}
    };	

    // override `window.removeEventListener'
    window.removeEventListener = function() {
        if (arguments[0] === devicemotionEvent) {
            --(self.deviceMotionListenerCount);
			if (self.deviceMotionListenerCount == 0) { // stop
				navigator.accelerometer.clearWatch(self.deviceMotionWatchId);
			}
		} 
		
		if (!windowDispatchAvailable) {
			return document.removeEventListener.apply(this, arguments);
		} else {
			return _removeEventListener.apply(this, arguments);
		}
    };	
};


PhoneGap.addConstructor(Accelerometer.install);
PhoneGap.addConstructor(Accelerometer.installDeviceMotionHandler);

};

/**
 * this represents the mobile device, and provides properties for inspecting the model, version, UUID of the
 * phone, etc.
 * @constructor
 */
Device = function() 
{
    this.platform = null;
    this.version  = null;
    this.name     = null;
    this.phonegap      = null;
    this.uuid     = null;
    try 
	{      
		this.platform = DeviceInfo.platform;
		this.version  = DeviceInfo.version;
		this.name     = DeviceInfo.name;
		this.phonegap = DeviceInfo.gap;
		this.uuid     = DeviceInfo.uuid;

    } 
	catch(e) 
	{
        // TODO: 
    }
	this.available = PhoneGap.available = this.uuid != null;
}

PhoneGap.addConstructor(function() {
	if (typeof navigator.device === "undefined") {
    	navigator.device = window.device = new Device();
	}
});
};





if (!PhoneGap.hasResource("media")) {
	PhoneGap.addResource("media");

/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2010, Nitobi Software Inc.
 * Copyright (c) 2010,2011 IBM Corporation
 */

/**
 * List of media objects.
 * PRIVATE
 */
PhoneGap.mediaObjects = {};

/**
 * Object that receives native callbacks.
 * PRIVATE
 */
PhoneGap.Media = function() {};


/**
 * Get the media object.
 * PRIVATE
 *
 * @param id            The media object id (string)
 */
PhoneGap.Media.getMediaObject = function(id) {
    return PhoneGap.mediaObjects[id];
};

/**
 * Audio has status update.
 * PRIVATE
 *
 * @param id            The media object id (string)
 * @param msg           The status message (int)
 * @param value        The status code (int)
 */
PhoneGap.Media.onStatus = function(id, msg, value) {
    var media = PhoneGap.mediaObjects[id];

    // If state update
    if (msg == Media.MEDIA_STATE) {
        if (value == Media.MEDIA_STOPPED) {
            if (media.successCallback) {
                media.successCallback();
            }
        }
        if (media.statusCallback) {
            media.statusCallback(value);
        }
    }
    else if (msg == Media.MEDIA_DURATION) {
        media._duration = value;
    }
    else if (msg == Media.MEDIA_ERROR) {
        if (media.errorCallback) {
            media.errorCallback(value);
        }
    }
    else if (msg == Media.MEDIA_POSITION) {
    	media._position = value;
    }
};

/**
 * This class provides access to the device media, interfaces to both sound and video
 *
 * @param src                   The file name or url to play
 * @param successCallback       The callback to be called when the file is done playing or recording.
 *                                  successCallback() - OPTIONAL
 * @param errorCallback         The callback to be called if there is an error.
 *                                  errorCallback(int errorCode) - OPTIONAL
 * @param statusCallback        The callback to be called when media status has changed.
 *                                  statusCallback(int statusCode) - OPTIONAL
 * @param positionCallback      The callback to be called when media position has changed.
 *                                  positionCallback(long position) - OPTIONAL
 */
Media = function(src, successCallback, errorCallback, statusCallback, positionCallback) {

    // successCallback optional
    if (successCallback && (typeof successCallback != "function")) {
        console.log("Media Error: successCallback is not a function");
        return;
    }

    // errorCallback optional
    if (errorCallback && (typeof errorCallback != "function")) {
        console.log("Media Error: errorCallback is not a function");
        return;
    }

    // statusCallback optional
    if (statusCallback && (typeof statusCallback != "function")) {
        console.log("Media Error: statusCallback is not a function");
        return;
    }

    // positionCallback optional -- NOT SUPPORTED
    if (positionCallback && (typeof positionCallback != "function")) {
        console.log("Media Error: positionCallback is not a function");
        return;
    }

    this.id = PhoneGap.createUUID();
    PhoneGap.mediaObjects[this.id] = this;
    this.src = src;
    this.successCallback = successCallback;
    this.errorCallback = errorCallback;
    this.statusCallback = statusCallback;
    this.positionCallback = positionCallback;
    this._duration = -1;
    this._position = -1;
};

// Media messages
Media.MEDIA_STATE = 1;
Media.MEDIA_DURATION = 2;
Media.MEDIA_POSITION = 3;
Media.MEDIA_ERROR = 9;

// Media states
Media.MEDIA_NONE = 0;
Media.MEDIA_STARTING = 1;
Media.MEDIA_RUNNING = 2;
Media.MEDIA_PAUSED = 3;
Media.MEDIA_STOPPED = 4;
Media.MEDIA_MSG = ["None", "Starting", "Running", "Paused", "Stopped"];

// TODO: Will MediaError be used?
/**
 * This class contains information about any Media errors.
 * @constructor
 */

MediaError = function() {
	this.code = null,
	this.message = "";
}


MediaError.MEDIA_ERR_ABORTED        = 1;
MediaError.MEDIA_ERR_NETWORK        = 2;
MediaError.MEDIA_ERR_DECODE         = 3;
MediaError.MEDIA_ERR_NONE_SUPPORTED = 4;

/**
 * Start or resume playing audio file.
 */
Media.prototype.play = function(options) {
    PhoneGap.exec(null, null, "com.phonegap.media", "play", [this.id, this.src, options]);
};

/**
 * Stop playing audio file.
 */
Media.prototype.stop = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","stop", [this.id, this.src]);
};

/**
 * Pause playing audio file.
 */
Media.prototype.pause = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","pause", [this.id, this.src]);
};

/**
 * Seek or jump to a new time in the track..
 */
Media.prototype.seekTo = function(milliseconds) {
    PhoneGap.exec(null, null, "com.phonegap.media", "seekTo", [this.id, this.src, milliseconds]);
};

/**
 * Get duration of an audio file.
 * The duration is only set for audio that is playing, paused or stopped.
 *
 * @return      duration or -1 if not known.
 */
Media.prototype.getDuration = function() {
    return this._duration;
};

/**
 * Get position of audio.
 *
 * @return
 */
Media.prototype.getCurrentPosition = function(successCB, errorCB) {
	var errCallback = (errorCB == undefined || errorCB == null) ? null : errorCB;
    PhoneGap.exec(successCB, errorCB, "com.phonegap.media", "getCurrentPosition", [this.id, this.src]);
};

// iOS only.  prepare/load the audio in preparation for playing
Media.prototype.prepare = function(successCB, errorCB) {
	PhoneGap.exec(successCB, errorCB, "com.phonegap.media", "prepare", [this.id, this.src]);
}

/**
 * Start recording audio file.
 */
Media.prototype.startRecord = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","startAudioRecord", [this.id, this.src]);
};

/**
 * Stop recording audio file.
 */
Media.prototype.stopRecord = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","stopAudioRecord", [this.id, this.src]);
};

/**
 * Release the resources.
 */
Media.prototype.release = function() {
    PhoneGap.exec(null, null, "com.phonegap.media","release", [this.id, this.src]);
};

};
