/**
 * author       Mat Hopwood
 * copyright    2014 Mat Hopwood
 * More info    http://booty5.com
 */
"use strict";

/**
 * App is the main application controller and is responsible for general housekeeping and {@link b5.Scene} processing, You should
 * create a single instance of App object and assign it to b5.app. Scenes should then be created to hold your
 * content then added to this instance of the app. App has the following features:
 *
 * - Manages global resources
 * - Manages a collection of Scenes
 * - Managed a collection of Action Lists
 * - Handles touch input and keyboard
 * - Finds which Actor was touched when user touches / clicks the screen
 * - Logic loop processing
 * - Render loop processing
 * - Manages global animation Timelines via a TimelineManager
 * - Controls rescaling of canvas to best fit to different display sizes
 * - Tracks time and measures frame rate
 *
 * <b>Examples</b>
 *
 * Example showing how to set up the main app:
 *
 *      window.onload = function()
 *      {
 *          // Create the app
 *          var app = new b5.App(document.getElementById('mycanvas'));
 *          app.debug = false;
 *          app.setCanvasScalingMethod(b5.App.FitBest);
 *          // Start main loop
 *          app.start();
 *      };
 *
 * Example showing how to set up the main app using a loading screen:
 *
 *      window.onload = function()
 *      {
 *          // Create the app
 *          var app = new b5.App(document.getElementById('mycanvas'));
 *          app.debug = false;
 *          app.setCanvasScalingMethod(b5.App.FitBest);
 *          // Wait for resources to load then start app
 *          app.waitForResources();
 *      };
 *
 * Adding a global app resource example
 *
 *      var material = new b5.Material("static_bounce");
 *      material.restitution = 1;
 *      b5.app.addResource(material, "Material");
 *
 * Finding a global app resource example
 *
 *      var material = b5.app.findResource("static_bounce", "Material");
 *
 * Destroying a global app resource example
 *
 *      // If we do not have a reference to the resource then we can find and remove it
 *      b5.app.destroyResource("static_bounce", "Material");
 *
 *      // If we already have reference to the material then we can destroy it through itself
 *      material.destroy();
 *
 * Setting up a loading screen example
 *
 *      // Set up a loading screen object
 *      b5.app.loading_screen = {
 *           background_fill: "#fffff",         // Loading background fill style
 *           background_image: "loading.png",   // Loading background image
 *           bar_background_fill: "#8080ff",    // Loading bar background fill style
 *           bar_fill: "#ffffff"                // Loading bar fill style
 *      };
 *
 *
 * For a complete overview of the App class see {@link http://booty5.com/html5-game-engine/booty5-html5-game-engine-introduction/theapp/ Booty5 App Overview}
 *
 * @class App
 * @param canvas {object}       The HTML5 canvas that will receive the apps rendering
 * @param web_audio {boolean}   If true then web audio will be used if available
 * @constructor
 * @returns {b5.App} The created App
 *
 * @property {b5.Scene[]}              removals                     - Array of scenes that were deleted last frame (internal)
 * @property {object}                  timer                        - Logic main loop timer (internal)
 * @property {number}                  pixel_ratio                  - Device pixel ratio (internal)
 * @property {number}                  canvas_width                 - The width of the virtual canvas (internal)
 * @property {number}                  canvas_height                - The height of the virtual canvas (internal)
 * @property {number}                  display_width                - The width of the rendering area (internal)
 * @property {number}                  display_height               - The height of the rendering area (internal)
 * @property {number}                  canvas_scale_method          - Virtual canvas scaling method (internal)
 * @property {number}                  canvas_scale                 - Canvas to client scaling (internal)
 * @property {number}                  canvas_cx                    - Canvas x axis centre on display (internal)
 * @property {number}                  canvas_cy                    - Canvas y axis centre on display (internal)
 * @property {boolean}                 order_changed                - Set to true when scenes change order (internal)
 * @property {object}                  last_time                    - Time of last frame (internal)
 * @property {b5.Scene[]}              scenes                       - An array of all Scenes (internal)
 * @property {object}                  canvas                       - The HTML5 canvas (internal)
 * @property {b5.Bitmap[]}             bitmaps                      - Bitmap resources (internal)
 * @property {object[]}                brushes                      - Brush resources (internal)
 * @property {b5.Shape[]}              shapes                       - Shape resources (internal)
 * @property {b5.Material[]}           materials                    - Material resources (internal)
 * @property {b5.Sound[]}              sounds                       - Audio resources (internal)
 * @property {number}                  avg_time                     - Total time since last measure (internal)
 * @property {number}                  avg_frame                    - Counter used to measure average frame rate (internal)
 *
 * @property {boolean}                 touch_supported              - If true then touch input is supported
 * @property {boolean}                 allow_touchables             - if true then app will search to find Actor that was touched (default is true)
 * @property {boolean}                 touched                      - true if the screen is being touched, false otherwise
 * @property {object}                  touch_pos                    - x, y  position of last screen touch
 * @property {number}                  touch_drag_x                 - Amount touch position was last dragged on x axis
 * @property {number}                  touch_drag_y                 - Amount touch position was last dragged on y axis
 * @property {b5.Scene}                focus_scene                  - Scene that has current input focus, if set via _focus_scene then instance of Scene or string based path to Scene can be used
 * @property {b5.Scene}                focus_scene2                 - Scene that has will receive touch events if focus scene does not process them, if set via _focus_scene2 then instance of Scene or string based path to Scene can be used
 * @property {b5.Actor}                touch_focus                  - The Actor that has the current touch focus
 * @property {number}                  dt                           - Last frame time delta
 * @property {number}                  avg_fps                      - Average frames per second of app
 * @property {number}                  total_loaded                 - Total pre-loadable resources that have been loaded
 * @property {number}                  total_load_errors            - Total pre-loadable resource load errors
 * @property {number}                  target_frame_rate            - Frame rate at which to update the game (0 for measured) (default is 50)
 * @property {boolean}                 adaptive_physics             - When true physics update will be ran more than once if frame rate falls below target (default is true)
 * @property {boolean}                 debug                        - Can be used to enable / disable debug trace info (default is false)
 * @property {boolean}                 box2d                        - True if Box2D module is present
 * @property {b5.TimelineManager}      timelines                    - Global animation timeline manager
 * @property {b5.ActionsListManager}   actions                      - Global actions list manager
 * @property {object}                  loading_screen               - Loading screen object
 *      @property {String}                  loading_screen.background_fill               - Loading screen background fill (default is #ffffff)
 *      @property {String}                  loading_screen.background_image              - Loading screen background image (default is loading.png)
 *      @property {String}                  loading_screen.bar_background_fill           - Loading screen loading bar background fill (default is #8080ff)
 *      @property {String}                  loading_screen.bar_fill                      - Loading screen loading bar fill (default is #ffffff)
 * @property {b5.Display}              display                      - Rendering module
 * @property {boolean}                 clear_canvas                 - If true then canvas will be cleared each frame (default is false)
 * @property {boolean}                 use_web_audio                - If true then Web Audio will be used if its available (default is true)
 * @property {boolean}                 use_marm                     - Set true if deploying using the Marmalade SDK (default is false)
 *
 */
b5.App = function(canvas, web_audio)
{
    b5.app = this;

    // Internal variables
    this.removals = [];             // Array of scenes that were deleted last frame
    this.touched = false;           // true if the screen is being touched, false otherwise
    this.touch_pos = {x:0, y:0};    // Position of last screen touch
    this.touch_drag_x = 0;          // Amount touch position was last dragged on x axis
    this.touch_drag_y = 0;          // Amount touch position was last dragged on y axis
    this.timer = null;				// Logic main loop timer
    this.last_time = Date.now();    // Time of last frame in ms
    this.dt = 0;                    // Last frame time delta
    this.avg_time = 0;              // Total time since last measure
    this.avg_fps = 60;              // Average frames per second of app
    this.avg_frame = 0;             // Counter used to measure average frame rate
    this.canvas_scale = 1;                      // Canvas to client scaling
    this.pixel_ratio = 1;                       // Device pixel ratio
    this.canvas_width = canvas.width;           // The width of the virtual canvas
    this.canvas_height = canvas.height;         // The height of the virtual canvas
    this.display_width = canvas.width;          // The width of the rendering area
    this.display_height = canvas.height;        // The height of the rendering area
    this.canvas_cx = this.canvas_width >> 1;    // Canvas x axis centre on display
    this.canvas_cy = this.canvas_height >> 1;   // Canvas y axis centre on display
    this.order_changed = true;      // Set to true when scenes change order
    this.total_loaded = 0;          // Total pre-loadable resources that have been loaded
    this.total_load_errors = 0;     // Total pre-loadable resource load errors

    // Public variables
    this.scenes = [];               // An array of Scenes
    this.canvas = canvas;			// The HTML5 canvas
    this.canvas_scale_method = b5.App.FitNone;  // Virtual canvas scaling method
    this.touch_supported = this.isTouchSupported();
    this.allow_touchables = true;	// if true then app will search to find Actor that was touched
    this.target_frame_rate = 60;	// Frame rate at which to update the game (o for measured)
    this.adaptive_physics = false;  // When true physics update will be ran more than once if frame rate falls below target
    this.focus_scene = null;		// Scene that has current input focus
    this.focus_scene2 = null;		// Scene that has will receive touch events if focus scene does not process them
    this.clear_canvas = false;		// If true then canvas will be cleared each frame
    this.touch_focus = null;		// The Actor that has the current touch focus
    this.debug = false;				// Can be used to enable / disable debug trace info
    this.timelines = new b5.TimelineManager();	// Global animation timeline manager
    this.actions = new b5.ActionsListManager(); // Global actions list manager
    this.box2d = typeof Box2D != "undefined";   // True if Box2D module is present
    this.loading_screen = {
        background_fill: "#fffff",              // Loading background fill style
        background_image: "loading.png",        // Loading background image
        bar_background_fill: "#8080ff",         // Loading bar background fill style
        bar_fill: "#ffffff"                     // Loading bar fill style
    };

    this.use_marm = false;                      // Set true if deploying using the Marmalade SDK
    this.use_web_audio = web_audio || true;     // If true then Web Audio will be used if its available (default is true)

    // Resources
    this.bitmaps = [];				// Bitmap resources
    this.brushes = [];				// Brush resources
    this.shapes = [];				// Shape resources
    this.materials = [];			// Material resources
    this.sounds = [];				// Audio resources
    this.onResourceLoaded = function(resource, error)
    {
        this.onResourceLoadedBase(resource, error);
    };

    if (window.devicePixelRatio !== undefined)
        this.pixel_ratio = window.devicePixelRatio;

    // Create the 2D canvas
    this.display = new b5.Display(this.canvas);

    // Init audio
    this.use_web_audio = b5.Sound.init(this);

    // Set up touch / mouse event handlers
    if (window.navigator.msPointerEnabled)
    {   // WP8
        canvas.addEventListener("MSPointerDown", this.onTouchStart, false);
        canvas.addEventListener("MSPointerMove", this.onTouchMove, false);
        canvas.addEventListener("MSPointerUp", this.onTouchEnd, false);
    }
    else
    if (this.touch_supported)
    {
        canvas.addEventListener("touchstart", this.onTouchStart, false);
        canvas.addEventListener("touchmove", this.onTouchMove, false);
        canvas.addEventListener("touchend", this.onTouchEnd, false);
    }
    else
    {
        canvas.addEventListener("mousedown", this.onTouchStart, false);
        canvas.addEventListener("mousemove", this.onTouchMove, false);
        canvas.addEventListener("mouseup", this.onTouchEnd, false);
        canvas.addEventListener("mouseout", this.onTouchEnd, false);
    }
    window.addEventListener("keypress", this.onKeyPress, false);
    window.addEventListener("keydown", this.onKeyDown, false);
    window.addEventListener("keyup", this.onKeyUp, false);

    this.resize = function(event)
    {
        b5.app.setCanvasScalingMethod();
    };
    this.orientationChange = function(event)
    {
//        b5.app.setCanvasScalingMethod();
    };
    window.addEventListener("resize", this.resize);
//    window.addEventListener("orientationchange", this.orientationChange);
};

Object.defineProperty(b5.App.prototype, "_focus_scene", {
    get: function() { return this.focus_scene; },
    set: function(value) { if (this.focus_scene !== value) { this.focus_scene = b5.Utils.resolveObject(value); } }
});
Object.defineProperty(b5.App.prototype, "_focus_scene2", {
    get: function() { return this.focus_scene2; },
    set: function(value) { if (this.focus_scene2 !== value) { this.focus_scene2 = b5.Utils.resolveObject(value); } }
});


// Virtual canvas scaling methods
/**
 * No scaling of rendering or resizing of canvas
 * @constant
 */
b5.App.FitNone = 0;
/**
 * The canvas is resized to fit the client area. Rendering is scaled to fit best on the x-axis,
 * @constant
 */
b5.App.FitX = 1;
/**
 * The canvas is resized to fit the client area. Rendering is scaled to fit best on the y-axis,
 * @constant
 */
b5.App.FitY = 2;
/**
 * The canvas is resized to fit the client area. Rendering is scaled to fit either the x or y axis depending on which retains most information
 * @constant
 */
b5.App.FitBest = 3;
/**
 * The canvas is resized to fit the client area. rendering is not scaled
 * @constant
 */
b5.App.FitSize = 4;

//
// Keyboard handling
//
/**
 * Callback that is called when the user presses a key, key event is passed onto the current focus scene
 * @private
 * @param e {object} The key event
 */
b5.App.prototype.onKeyPress = function(e)
{
    var app = b5.app;
    if (app.focus_scene != null)
        app.focus_scene.onKeyPressBase(e);
};
/**
 * Callback that is called when the user presses down a key, key event is passed onto the current focus scene
 * @private
 * @param e {object} The key event
 */
b5.App.prototype.onKeyDown = function(e)
{
    var app = b5.app;
    if (app.focus_scene != null)
        app.focus_scene.onKeyDownBase(e);
};
/**
 * Callback that is called when the user releases a key, key event is passed onto the current focus scene
 * @private
 * @param e {object} The key event
 */
b5.App.prototype.onKeyUp = function(e)
{
    var app = b5.app;
    if (app.focus_scene != null)
        app.focus_scene.onKeyUpBase(e);
};

//
// Touch handling
//
/**
 * Utility method that checks to see if touch input is supported
 * @private
 * @returns {boolean} true if touch is supported, false if not
 */
b5.App.prototype.isTouchSupported = function()
{
    var msTouchEnabled = window.navigator.msMaxTouchPoints;
//    var generalTouchEnabled = "ontouchstart" in document.createElement("div");
    var generalTouchEnabled = "ontouchstart" in this.canvas;

    if (msTouchEnabled || generalTouchEnabled)
        return true;
    return false;
};

/**
 * Callback that is called when the user touches the screen, touch position is passed onto focus and secondary focus
 * scenes. If user touched an actor then the actors onBeginTouchBase callback handler will be called.
 * @private
 * @param e {object} Touch event object
 */
b5.App.prototype.onTouchStart = function(e)
{
    var app = b5.app;
    if (app.touch_supported)
    {
        e.stopPropagation();
        e.preventDefault();
    }

    // Get touch pos
    var focus1 = app.focus_scene;
    var focus2 = app.focus_scene2;
    var display = app.display;
    app.touched = true;
    if (app.touch_supported && e.changedTouches !== undefined)
        app.touch_pos = display.getCanvasPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    else
        app.touch_pos = display.getCanvasPoint(e.pageX, e.pageY);

    // Handle scene touch
    if (focus1 != null)
        focus1.onBeginTouchBase(app.touch_pos);
    if (focus2 != null)
        focus2.onBeginTouchBase(app.touch_pos);

    // Handle actor touch
    if (app.allow_touchables)
    {
        var actor = app.findHitActor(app.touch_pos);
        if (actor != null)
        {
            app.touch_focus = actor;
            actor.onBeginTouchBase(app.touch_pos);
        }
    }
};

/**
 * Callback that is called when the user stops touches the screen, touch position is passed onto focus and secondary
 * focus scenes. If user is touching an actor then the actors onEndTouchBase callback handler will be called.
 * If the touched actor has the current touch focus then the actors onLostTouchFocus callback will be called
 * @private
 * @param e {object} Touch event object
 */
b5.App.prototype.onTouchEnd = function(e)
{
    var app = b5.app;
    if (app.touch_supported)
    {
        e.stopPropagation();
        e.preventDefault();
    }

    // Get touch pos
    var focus1 = app.focus_scene;
    var focus2 = app.focus_scene2;
    var display = app.display;
    app.touched = false;
    if (app.touch_supported && e.changedTouches !== undefined)
        app.touch_pos = display.getCanvasPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    else
        app.touch_pos = display.getCanvasPoint(e.pageX, e.pageY);

    // Handle scene touch
    if (focus1 != null)
        focus1.onEndTouchBase(app.touch_pos);
    if (focus2 != null)
        focus2.onEndTouchBase(app.touch_pos);

    // Handle actor touch
    if (app.allow_touchables)
    {
        var actor = app.findHitActor(app.touch_pos);
        if (actor != null)
            actor.onEndTouchBase(app.touch_pos);
        if (app.touch_focus != null)
        {
            if (app.touch_focus.onLostTouchFocus !== undefined)
                app.touch_focus.onLostTouchFocus(app.touch_pos);
            app.touch_focus = null;
        }
    }
};
/**
 * Callback that is called when the user moves a touch on the screen, touch position is passed onto focus and secondary
 * focus scenes. If user is touchimg an actor then the actors onMoveTouchBase callback handler will be called.
 * @private
 * @param e {object} Touch event object
 */
b5.App.prototype.onTouchMove = function(e)
{
    var app = b5.app;
    if (app.touch_supported)
    {
        e.stopPropagation();
        e.preventDefault();
    }
    // Get touch pos and drag
    var focus1 = app.focus_scene;
    var focus2 = app.focus_scene2;
    var old_x = app.touch_pos.x;
    var old_y = app.touch_pos.y;
    var display = app.display;
    if (app.touch_supported && e.changedTouches !== undefined)
        app.touch_pos = display.getCanvasPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    else
        app.touch_pos = display.getCanvasPoint(e.pageX, e.pageY);
    app.touch_drag_x = old_x - app.touch_pos.x;
    app.touch_drag_y = old_y - app.touch_pos.y;

    // Handle scene touch
    if (focus1 != null)
        focus1.onMoveTouchBase(app.touch_pos);
    if (focus2 != null)
        focus2.onMoveTouchBase(app.touch_pos);

    // Handle actor touch (could be performance hog)
    if (app.allow_touchables)
    {
        var actor = app.findHitActor(app.touch_pos);
        if (actor != null)
            actor.onMoveTouchBase(app.touch_pos);
    }
};

//
// Scene management
//
/**
 * Adds a scene to this App for processing and display
 * @param scene {b5.Scene} The scene to add
 * @returns {object} The added scene
 */
b5.App.prototype.addScene = function(scene)
{
    this.scenes.push(scene);
    scene.app = this;
    return scene;
};

/**
 * Removes the specified scene from the app destroying it. Note that the scene is not removed immediately, instead it is removed when the end of the frame is reached
 * @param scene {b5.Scene} The scene to add
 */
b5.App.prototype.removeScene = function(scene)
{
    if (this.focus_scene == scene)
        this.focus_scene = null;
    this.removals.push(scene);
};

/**
 * Cleans up all destroyed scenes, this is called by the app to clean up any removed scenes at the end of its update cycle
 * @private
 */
b5.App.prototype.cleanupDestroyedScenes = function()
{
    var dcount = this.removals.length;
    if (dcount > 0)
    {
        var removals = this.removals;
        var scenes = this.scenes;
        var count = scenes.length;
        for (var s = 0; s < dcount; s++)
        {
            var dscene = removals[s];
            for (var t = 0; t < count; t++)
            {
                if (dscene == scenes[t])
                {
                    dscene.release();
                    scenes.splice(t, 1);
                    count--;
                    break;
                }
            }
        }
    }
    this.removals = [];
};

/**
 * Searches this App for the named scene
 * @param name {string} Name of the scene to find
 * @returns {b5.Scene}The found scene object or null for scene not found
 */
b5.App.prototype.findScene = function(name)
{
    var scenes = this.scenes;
    var count = scenes.length;
    for (var t = 0; t < count; t++)
    {
        if (scenes[t].name == name)
            return scenes[t];
    }
    return null;
};

//
// Resource management
//
/**
 * Adds a resource to the global app resource manager
 * @param resource {object} The resource to add
 * @param type {string} Type of resource to add (brush, sound, shape, material, bitmap or geometry)
 */
b5.App.prototype.addResource = function(resource, type)
{
    var res = b5.Utils.getResFromType(this, type);
    if (res != null)
    {
        res.push(resource);
        resource.parent = this;
    }
};

/**
 * Removes a resource from the global app resource manager
 * @param resource {object} The resource to remove
 * @param type {string} Type of resource to add (brush, sound, shape, material, bitmap or geometry)
 */
b5.App.prototype.removeResource = function(resource, type)
{
    var res = b5.Utils.getResFromType(this, type);
    if (res != null)
    {
        var count = res.length;
        for (var t = 0; t < count; t++)
        {
            if (res[t] == resource)
            {
                res.parent = null;
                res.splice(t, 1);
                return;
            }
        }
    }
};

/**
 * Searches the global app resource manager for the named resource
 * @param name {string} Name of resource to find
 * @param type {string} Type of resource to add (brush, sound, shape, material, bitmap or geometry)
 * @returns {object} The found resource or null if not found
 */
b5.App.prototype.findResource = function(name, type)
{
    var res = b5.Utils.getResFromType(this, type);
    if (res == null)
        return null;

    var count = res.length;
    for (var t = 0; t < count; t++)
    {
        if (res[t].name === name)
            return res[t];
    }
    if (this.debug)
        console.log("resource '" + name + "' (" + type + ") not found");

    return null;
};

/**
 * Returns how many resources that are marked as preloaded still need to be loaded
 * @param include_scenes {boolean} If true then resources within scenes will also be counted
 * @returns {number} Number of resources that still need to loaded
 */
b5.App.prototype.countResourcesNeedLoading = function(include_scenes)
{
    var total = 0;
    var res = this.bitmaps;
    var count = res.length;
    for (var t = 0; t < count; t++)
    {
        if (res[t].preload)
            total++;
    }

    res = this.sounds;
    count = res.length;
    for (t = 0; t < count; t++)
    {
        if (res[t].preload)
            total++;
    }

    if (include_scenes)
    {
        var scenes = this.scenes;
        count = scenes.length;
        for (t = 0; t < count; t++)
            total += scenes[t].countResourcesNeedLoading();
    }
    return total;
};

/**
 * Callback which is called when a preloaded resource is loaded
 * @param resource {object} The resource that was loaded
 * @param error {boolean} true if there was an error during the loading of the resource
 * @private
 */
b5.App.prototype.onResourceLoadedBase = function(resource, error)
{
    if (resource.preload)
        b5.app.total_loaded++;
    if (error)
    {
        if (resource.preload)
            b5.app.total_load_errors++;
        console.log("Error loading resource " + resource.name);
    }
    else
    {
        if (this.debug)
            console.log("Resource loaded " + resource.name);
    }
    resource.loaded = true;
};

/**
 * Waits for all preloaded resources to load before starting the app, also displays a loading screen and loading bar. Use this in place of calling app.start() directly.
 */
b5.App.prototype.waitForResources = function()
{
    // Draw background
    var app = this;
    var disp = app.display;
    var dscale = app.canvas_scale;
    var load_w = 400;
    var load_h = 80;
    disp.setTransform(1, 0, 0, 1, 0, 0);
    disp.setFillStyle(app.loading_screen.background_fill);
    disp.drawRect(0, 0, app.display_width, app.display_height);
    var bg = new Image();
    bg.src = app.loading_screen.background_image;
    bg.onload = function() {
        disp.setTransform(dscale, 0, 0, dscale, app.canvas_cx, app.canvas_cy);
        disp.drawImage(bg, -bg.width >> 1, -bg.height >> 1, bg.width, bg.height);
        disp.setFillStyle(app.loading_screen.bar_background_fill);
        disp.drawRoundRect(-load_w >> 1, (app.canvas_height >> 2) - (load_h >> 1), load_w, load_h, 20, true);
    };

    var total = app.countResourcesNeedLoading(true);
    var tmr = setInterval(function()
    {
        var loaded = b5.app.total_loaded;
        if (loaded >= total)
        {
            if (b5.app.debug)
            {
                console.log("Total resources loaded " + loaded + " of " + total);
                console.log("Total resource load errors " + b5.app.total_load_errors);
            }

            clearInterval(tmr);
            var tmr2 = setInterval(function(){
                // Start main loop
                app.start();
                clearInterval(tmr2);
            }, 1000);
        }
        var w = load_w - 20;
        var h = load_h - 20;
        var perc = loaded / total; if (perc > 1) perc = 1;
        var cw = (w * perc) << 0;
        disp.setFillStyle(app.loading_screen.bar_fill);
        disp.drawRoundRect(-w >> 1, (app.canvas_height >> 2) - (h >> 1), cw, h, 10, true);
    }, 100);
};

//
// Rendering
//
/**
 * Renders the app and all of its contained scenes
 */
b5.App.prototype.draw = function()
{
    var scenes = this.scenes;
    var count = scenes.length;
    for (var t = 0; t < count; t++)
        scenes[t].draw();
};

//
// Update
//
/**
 * Updates the app and all of its contained scenes
 * @param dt {number} The amount of time that has passed since this app was last updated
 */
b5.App.prototype.update = function(dt)
{
    var app = b5.app;
    var scenes = this.scenes;
    var count = scenes.length;
    app.dt = dt;
    app.timelines.update(dt);
    app.actions.execute();
    for (var t = 0; t < count; t++)
        scenes[t].update(dt);
    this.cleanupDestroyedScenes();

    // Re-sort scenes if layers changed
    if (this.order_changed)
    {
        this.order_changed = false;
        b5.Utils.sortLayers(this.scenes);
    }
};

/*b5.App.prototype.mainLoop = function()
{
    if (app.clear_canvas)
        app.display.clear(true);
    app.update(1 / app.target_frame_rate);
    app.draw();
};*/

/**
 * The main app logic loop that updates the apps logic, this is ran on a timer at a rate determined by target_frame_rate
 * @private
 */
b5.App.prototype.mainLogic = function()
{
    var app = b5.app;
    var now = Date.now();
    var delta = now - app.last_time;
    app.last_time = now;
    if (app.target_frame_rate === 0)
        app.update(delta / 1000);
    else
        app.update(1 / app.target_frame_rate);
    app.avg_time += delta;
    app.avg_frame++;
    if (app.avg_frame == 60)
    {
        app.avg_frame = 0;
        app.avg_fps = 60000 / app.avg_time;
        app.avg_time = 0;
    }
//    if ((app.avg_frame & 59) == 0)
//        console.log(app.avg_fps);
};

/**
 * The main rendering loop that renders the app, this is called each frame by requestAnimationFrame
 * @private
 */
b5.App.prototype.mainDraw = function()
{
    var app = b5.app;
    if (app.clear_canvas)
        app.display.clear(true);
    app.draw();
    requestAnimationFrame(app.mainDraw);
};

/**
 * Starts the app running
 */
b5.App.prototype.start = function()
{
    this.timer = setInterval(this.mainLogic, 1000 / this.target_frame_rate);
    this.mainDraw();
    this.dirty();
};

//
// Utility
//
/**
 * Searches all touchable actors in all app scenes to see if the supplied position hits them
 * @param position {object} The position to hit test
 * @returns {b5.Actor} The actor that was hit or null for no hit
 */
b5.App.prototype.findHitActor = function(position)
{
    var act = null;
    if (this.focus_scene !== null)
        act = this.focus_scene.findHitActor(position);
    if (act === null && this.focus_scene2 !== null)
        act = this.focus_scene2.findHitActor(position);
    return act;
};

/**
 * Dirties the scene and all child actors transforms, forcing them to be rebuilt
 */
b5.App.prototype.dirty = function()
{
    var s = this.scenes;
    var count = s.length;
    for (var t = 0; t < count; t++)
        s[t].dirty();
};

/**
 * Sets the method of scaling rendering to the canvas and how the canvas fits to the client area
 * @param method {number} The method of scaling to use, can be {@link b5.App.FitNone}, {@link b5.App.FitX}, {@link b5.App.FitY}, {@link b5.App.FitBest} or {@link b5.App.FitSize}
 */
b5.App.prototype.setCanvasScalingMethod = function(method)
{
    if (method !== undefined)
        this.canvas_scale_method = method;
    var iw = window.innerWidth;
    var ih = window.innerHeight;
    var sw = this.canvas_width;
    var sh = this.canvas_height;
    var dw = sw;
    var dh = sh;
    var sx = 1;
    var sy = 1;
    this.canvas_scale = 1;
    if (this.canvas_scale_method === b5.App.FitNone)
    {

    }
    else
    if (this.canvas_scale_method === b5.App.FitSize)
    {
        dw = iw;
        dh = ih;
        this.canvas.width = dw * this.pixel_ratio;
        this.canvas.height = dh * this.pixel_ratio;
    }
    else
    {
        dw = iw;
        dh = ih;
        sx = dw / sw;
        sy = dh / sh;
        var scale = 1;
        switch (this.canvas_scale_method)
        {
            case b5.App.FitX:
                scale = sx;
                break;
            case b5.App.FitY:
                scale = sy;
                break;
            case b5.App.FitBest:
                scale = sx < sy ? sx : sy;
                break;
        }
        this.canvas_scale = scale;
        this.canvas.width = dw * this.pixel_ratio;
        this.canvas.height = dh * this.pixel_ratio;
    }
//    this.canvas_cx = this.canvas.width >> 1;
//    this.canvas_cy = this.canvas.height >> 1;
    this.canvas_cx = dw >> 1;
    this.canvas_cy = dh >> 1;

    this.display_width = dw;
    this.display_height = dh;
    this.dirty();
};

b5.App.prototype.parseAndSetFocus = function(scene_name)
{
    new b5.Xoml(this).parseResources(this, [window[scene_name]]);
    this.order_changed = true;
    this.focus_scene = this.findScene(scene_name);
};


