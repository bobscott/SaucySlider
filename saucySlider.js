/*
    SaucySlider - v1.0
    ===========================
    Bob Scott
    http://robertscott.co
*/

(function ($, window, document, undefined) {

    // Defaults values
    var pluginName = 'saucySlider',
        defaults = {
            scenePoints     : [],                           // Whole number pixel value where each scene starts
            sceneTimes      : [],                           // Miliseconds of transition time between each scene
            sceneNames      : [],                           // The name of each scene to appear in the URL hash
            pager           : false,                        // jQuery object of all pager elements
            nextButton      : false,                        // jQuery object of the element that triggers the move to the next scene
            prevButton      : false,                        // jQuery object of the element that triggers the move to the previous scene
            sceneMoved      : function(a){},                // Callback function when a scene moves
            sceneStopped    : function(a){},                // Callback function when a scene stops
            sceneCanceled   : function(a){}                 // Callback function when a scene is canceled
        };

    // The plugin constructor
    function Plugin(element, options) {
        this.options = $.extend({}, defaults, options);     // Plugin options
        this.stage = element;                               // Reference to the root element that wraps all the pieces 
        this.numScenes = this.options.scenePoints.length;   // The number of scenes in the stage
        this.scene = -1;                                    // Current scene of the slider
        this.sceneMoving = false;                           // Boolean value telling if the slider is moving to another scene
        this.windowResizing = false;                        // Boolean value telling if the browser window is resizing
        this.transitionTimeout = false;                     // setTimeout function that runs a callback when a scene transition ends
        this.resizeTimeout = false;                         // setTimeout function that checks if the browser window is still resizing
        this.transformValue = false;                        // Browser supported transform value for javascript        
        this.transforms = [                                 // Array of possible vendor specific transform values for javascript
            'transform', 
            'webkitTransform', 
            'OTransform', 
            'msTransform', 
            'MozTransform'
        ];
        this.transitionValue = false;                       // Browser supported transition value for javascript
        this.transitions = [                                // Array of possible vendor specific transition values for javascript
            'transition', 
            'webkitTransition', 
            'OTransition', 
            'msTransition', 
            'MozTransition'
        ];
        this.transitionStyle = 'transform';                 // Browser supported transition value for CSS
        this.transitionStylePrefixes = [                    // Array of possible vendor specific transition values for CSS
            '', 
            '-webkit-', 
            '-o-', 
            '-ms-', 
            '-moz-'
        ];

        // IE8 support for Array.indexOf
        if (!Array.prototype.indexOf){Array.prototype.indexOf = function(elt /*, from*/){var len = this.length >>> 0;var from = Number(arguments[1]) || 0;from = (from < 0) ? Math.ceil(from) : Math.floor(from);if (from < 0)from += len;for (; from < len; from++){if (from in this &&this[from] === elt)return from;}return -1;};}

        this.init();    // Initialize SaucySlider
    }

    // Plugin methods
    Plugin.prototype = {

        /**
         * transitionCallback triggers when a scene change completes.
         * It will set the values of the stage from moving to stopped
         * and will trigger the sceneStopped callback function
         */
        transitionCallback: function() {
            clearTimeout(this.transitionTimeout);
            $('html').removeClass('moving').addClass('stopped');
            this.sceneMoving = false;
            this.options.sceneStopped({ currentScene : this.scene });
        },

        /**
         * cancelTransitionCallback cancels the transition callback timeout 
         * and fires the sceneCanceled callback function.
         */
        cancelTransitionCallback: function() {
            clearTimeout(this.transitionTimeout);
            this.options.sceneCanceled({ currentScene : this.scene });
        },

        /**
         * changeScene calculates the speed of a scene change
         * and set all transition values if CSS transitions
         * are supported.  The pager, nav buttons, and URL hash
         * will also be updated to reflect the new scene. The
         * setPiecesPosition function will be called if a scene
         * change is detected.
         */
        changeScene: function(newScene) {
            var $stage = this.stage,                                // Reference to the root element that wraps all the pieces 
                transitionValue = this.transitionValue,             // Browser supported transition value for javascript
                transitionStyle = this.transitionStyle,             // Browser supported transition value for CSS
                sceneTimes = this.options.sceneTimes,               // Miliseconds of transition time *between* each scene -- sceneTimes.length = scenePoints - 1
                sceneName = this.options.sceneNames[newScene],      // The name of each scene to appear in the URL hash
                oldScene = this.scene,                              // The scene number before changing scenes
                numScenes = this.numScenes,                         // The number of scenes in the stage
                skip = newScene - oldScene,                         // The amount of scenes that will be skipped during this scene change
                speed = 0,                                          // The speed of the scene change in miliseconds
                movementCssValue = '',                              // The CSS value for the transition and speed
                customTransition = '',                              // Any other custom CSS transition values to be applied to the piece
                a = oldScene == -1 ? newScene : oldScene;           // Loop counter

            // Check if the scene has changed and is in bounds
            if (skip != 0 && newScene < numScenes && newScene > -1) {

                // Moving to the next scene
                for (a; a < newScene; a += 1){
                    speed += sceneTimes[a];
                }

                // Moving to the previous scene
                for (a = oldScene; a > newScene; a -= 1){
                    speed += sceneTimes[a - 1];
                }

                // Moving more than one scene
                if (Math.abs(skip) > 1) {
                    speed /= 2.5;
                }

                // Set transform value if transitions are supported
                if (transitionValue !== false) {
                    movementCssValue = transitionStyle + ' ' + speed + 'ms';
                    // Loop through each piece and set CSS transition values for transforms
                    $('[data-layer]', $stage).each(function(){
                        customTransition = $(this).attr('data-transition') || '';
                        if (customTransition != '') {
                            $(this)[0].style[transitionValue] = [movementCssValue, customTransition].join(',');
                        } else {
                            $(this)[0].style[transitionValue] = movementCssValue;
                        }
                        // Add a CSS transition value for background position if the background position is supposed to change
                        if ($(this).is('[data-bg-x]') || $(this).is('[data-bg-y]') ) {
                            $(this)[0].style[transitionValue] = $(this)[0].style[transitionValue] + ', background-position ' + speed + 'ms';
                        }
                    });
                }

                // Set active pager
                if (this.options.pager !== undefined) { 
                    this.options.pager.removeClass('on').eq(newScene).addClass('on');
                }

                // Set nav buttons
                $('.nav-button.off').removeClass('off');
                if (newScene == 0) {
                    $(this.options.prevButton).addClass('off');
                } else if (newScene == numScenes - 1) {
                    $(this.options.nextButton).addClass('off');
                }

                // Set scene name in URL hash
                if (sceneName !== undefined) {
                    window.location.hash = sceneName;
                }

                // Add scene number class and speed to the HTML element
                $('html')
                    .addClass('scene-' + newScene)
                    .removeClass('scene-' + oldScene)
                    .attr('data-speed', speed);

                // Cancel the transtion callback if scene is already moving
                if (this.sceneMoving) {
                    this.cancelTransitionCallback();
                }

                // Fire callback function for scene moving
                this.options.sceneMoved({ 
                    pastScene : this.scene, 
                    newScene  : newScene 
                });

                // Set the new scene number
                this.scene = newScene;

                // Move all pieces on the stage into their new locations
                this.setPiecesPosition();
            }
        },

        /**
         * setPiecesPosition calculates the location offset and 
         * background position of every piece and on the stage 
         * based on the current scene location. If transitions 
         * are not supported every piece will be animated with 
         * jQuery's .animate() function.
         */
        setPiecesPosition: function() {
            var that = this,                                    // Local copy of this
                $stage = this.stage,                            // Reference to the root element that wraps all the pieces 
                speed = $('html').attr('data-speed') * 1,       // Time in milliseconds of the scene transition
                currentScene = this.scene,                      // The current scene index value (0 - n)
                scenePoints = this.options.scenePoints,         // The pixel values of all scene locations
                currentPoint = scenePoints[currentScene],       // The pixel value for the current scene location
                halfViewport = $(window).width() / 2,           // Half of the browser's viewport in pixels
                stageLeft = halfViewport - currentPoint,        // The offset of the entire stage to the viewport
                transformValue = this.transformValue,           // Browser supported transform value for javascript
                transitionValue = this.transitionValue;         // Browser supported transition value for javascript

            // Set scene to moving state and trigger transition callback if the window isn't being resized
            if (!this.windowResizing) {
                this.sceneMoving = true;
                $('html').removeClass('stopped').addClass('moving');
                this.transitionTimeout = setTimeout(function(){ that.transitionCallback() }, speed);
            }

            // Set position of all pieces and background images
            $('[data-layer]', $stage).each(function(){
                var thisLayer = $(this).attr('data-layer'),                                            // Reference to the current stage piece
                    thisScene = $(this).attr('data-scene') || $(this).parent().attr('data-scene'),     // The current scene index value (0 - n)
                    thisPoint = scenePoints[thisScene],                                                // The pixel value for the current scene location
                    thisOffset = 0,                                                                    // The pixel value the current piece will be offset by
                    thisBackgroundXdelta = $(this).attr('data-bg-x') || 0,                             // The mutlipler at which the background-x position should change
                    thisBackgroundXoffset = thisBackgroundXdelta * currentPoint + 'px',                // The new pixel value of the background-x postion
                    thisBackgroundXvalue = thisBackgroundXdelta != 0 ? thisBackgroundXoffset : window.getComputedStyle($(this)[0], null).getPropertyValue('background-position').split(' ')[0], // The background-x position value
                    thisBackgroundYdelta = $(this).attr('data-bg-y') || 0,                             // The mutlipler at which the background-y position should change
                    thisBackgroundYoffset = thisBackgroundYdelta * currentPoint + 'px',                // The new pixel value of the background-y postion
                    thisBackgroundYvalue = thisBackgroundYdelta != 0 ? thisBackgroundYoffset : window.getComputedStyle($(this)[0], null).getPropertyValue('background-position').split(' ')[1]; // The background-y position value

                // Calculate piece's new location
                if (thisLayer >= 0){
                    thisOffset = (thisPoint - currentPoint) * thisLayer;
                }else{
                    thisOffset = (thisPoint - currentPoint) * (1 / thisLayer);
                }

                // Add the global left offset to elements that aren't nested
                if (!$(this).is('[data-inner]')) {
                    thisOffset += stageLeft;
                }

                // Set location of each piece on the stage if transitions are supported
                if (transitionValue !== false) {
                    $(this)[0].style[transformValue] = 'translateX(' + thisOffset + 'px)';
                    $(this)[0].style.backgroundPosition = thisBackgroundXvalue + ' ' + thisBackgroundYvalue;
                } else {
                    // Use margin left to set new locations of pieces if browser is resizing
                    if (resizing) {
                        $(this).stop().css({
                            'marginLeft': thisOffset + 'px',
                            'background-position': thisBackgroundXvalue + ' ' + thisBackgroundYvalue
                        });
                    } else {
                        // Use jQuery .animate as an animation fallback if transitions are not suppported
                        $(this).stop().animate({ 
                            'marginLeft': thisOffset, 
                            'backgroundPositionX': thisBackgroundXvalue,
                            'backgroundPositionY': thisBackgroundYvalue
                        }, speed);
                    }
                }
            });
        },

        /**
         * windowResize is bound to the window resize event.
         * If the slider is moving windowResize will stop the 
         * slider and jump directly to the scene it is traveling to.
         */
        windowResize: function() {
            var that = this,
                allowTransitions = function () {
                    that.windowResizing = false;
                    $('html').removeClass('window-resizing');    
                };

            this.windowResizing = true;
            $('html').addClass('window-resizing');

            if (this.sceneMoving) {
                this.cancelTransitionCallback();
                this.transitionCallback();
            }

            this.setPiecesPosition();

            if (this.resizeTimeout !== false) {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(allowTransitions, 10);
            } else {
                this.resizeTimeout = setTimeout(allowTransitions, 10);
            }
        },

        /**
         * init is the initialization function that determines
         * transform and transition support, binds all click events
         * for the UI, binds the window resize event, determines the
         * starting scene from the URL hash, and puts all pieces
         * into place.
         */
        init: function() {
            var styles = document.body.style,
                hash = window.location.hash.split('#')[1],
                startScene = this.options.sceneNames.indexOf(hash) < 0 ? 
                    0 : this.options.sceneNames.indexOf(hash),
                $pager = this.options.pager,
                $nextButton = this.options.nextButton,
                $prevButton = this.options.prevButton,
                that = this, t;

            // Check for transform support
            for (t = 0; t < 5; t++) {
                if (styles[this.transforms[t]] !== undefined) {
                    this.transformValue = this.transforms[t];
                }
            }

            // Check for transition support
            for (t = 0; t < 5; t++) {
                if (styles[this.transitions[t]] !== undefined) {
                    this.transitionStyle = this.transitionStylePrefixes[t] + 'transform';
                    this.transitionValue = this.transitions[t];
                }
            }

            // Set click event for pager
            if ($pager !== false) {
                $pager.click(function(Event){
                    var which = $(Event.currentTarget).index();
                    if (which !== that.scene) {
                        that.changeScene(which);
                    }
                });
            }

            // Set click event for next button
            if ($nextButton !== false) {
                $nextButton.click(function(){
                    that.changeScene(that.scene + 1);
                });
            }

            // Set click event for prev button
            if ($prevButton !== false) {
                $prevButton.click(function(){
                    that.changeScene(that.scene - 1);
                });
            }

            // Bind the window resize event
            $(window).resize(function(){ that.windowResize(); });

            // Move stage and all pieces into place
            this.changeScene(startScene);
        }
    };

    // jQuery plugin setup
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

})( jQuery, window, document );