# SaucySlider.js

SaucySlider is a jQuery plugin that adds horizontal parallax effects to web pages.  These effects are controlled with CSS transitions (and fallbacks for unsupported browsers) for a silky smooth experience.  Elements are grouped into different scenes which the users can navigate to at their discretion.

* Works in all major browsers with support for IE8 and up.
* Requires [jQuery](http://jquery.com/download/) 1.7+

## Getting started

Download SaucySlider.js and the latest version of [jQuery](http://jquery.com/download/).  After ensuring both are linked on your page you can begin to create your markup. After you have laid out your markup and styled your page you then must add special properties to the elements you wish to make parallax.  


#### Designating Scenes

The first property is the "data-scene" attribute.  This attribute designates which scene the particular element belongs to.
```HTML
<!-- Example 1.0 -->
<div class="example-piece" data-scene="0"></div>
```
Scene numbers can be any whole number.  Keep in mind that scene numbers are zero based so the first scene would be data-scene="0".  Later we will also add the scene locations to SaucySlider's JavaScript properties.

#### Creating the Parallax Effects

The next property to add is the "data-layer" attribute.  This is the most important attribute as it controls the parallax effects.
```HTML
<!-- Example 1.1 -->
<div class="example-piece" data-scene="0" data-layer="1"></div>
```

The "data-layer" attribute can be any number and acts as a multiplier to move elements at different speeds and directions.

#### Optional Attributes

The **"data-bg-x"** and **"data-bg-y"** attributes can also be added to move the background position of an element in the same way the "data-layer" attribute moves the whole piece.
```HTML
<!-- Example 1.2 -->
<div class="example-piece" data-scene="0" data-layer="1" data-bg-x="2" data-bg-y="-1.2"></div>
```
The **"data-inner"** attribute can be added to an element to designate that it should parallax relative to its parent.
```HTML
<!-- Example 1.3 -->
<div class="example-piece" data-scene="0" data-layer="1">
  <img src="img.png" data-scene="0" data-layer="3" data-inner>
</div>
```

The **"data-transtion"** attribute allows you to add your own transtion values to elements without having to override SaucySlider's transtions.
```HTML
<!-- Example 2 -->
<div class="example-piece-2" data-scene="0" data-layer="1" data-transition="opacity 0.2s, background-color 300ms"></div>
```



#### Creating the Navigation

The elements used for the navigation are defined in the JavaScript properties. Users can navigate with either a next and previous button, pagers, or both.

## JavaScript Properties

Now its time to set up your JavaScript properties.  Here you will defined where scenes are located, how fast to move between scenes, the name of each scene, and which elements to use for the navigation.  There are also three callback functions that can be used to detect when SaucySlider is moving to a new scene, stopped at a scene, or canceled the scene movement. 

### scenePoints

This property is set to an array of integers designating the pixel value (from the left to right) where each scene is located.  The location of each scene is always in the center of the screen including a location of 0. 
```JS
// Example 1.0
scenePoints: [0, 1400, 2540]
```

### sceneTimes

This property is set to an array of integers designating the time in milliseconds to takes to travel between adjacent scenes.  This means there can only be one value when changing between scenes for both directions.  The length of this array will always be one less than the length of the scenePoints array.
```JS
// Example 1.1
// -----------
// It will take 2 seconds to travel between scene zero and one,
// and 3 seconds to travel between scenes one and two.
sceneTimes  : [2000, 3000],
scenePoints : [0, 1400, 2540]
```

### sceneNames

This property is set to an array of strings.  SaucySlider will put these strings into the URL hash to designate which scene SaucySlider is currently on.  These hashes can also be used to link directly to a scene.
```JS
// Example 1.2
sceneNames  : ['First', 'Second', 'Third'],
sceneTimes  : [2000, 3000],
scenePoints : [0, 1400, 2540]
```

### nextButton

This property is a jQuery object of the element to be used as the next scene button.  The class "off" will be added to this element if there are no more scenes to travel forward to.
```JS
// Example 1.3
nextButton  : $('.next'),
sceneNames  : ['First', 'Second', 'Third'],
sceneTimes  : [2000, 3000],
scenePoints : [0, 1400, 2540]
```

### prevButton

This property is a jQuery object of the element to be used as the previous scene button.  The class "off" will be added to this element if there are no more scenes to travel back to.
```JS
// Example 1.4
prevButton  : $('.prev'),
nextButton  : $('.next'),
sceneNames  : ['First', 'Second', 'Third'],
sceneTimes  : [2000, 3000],
scenePoints : [0, 1400, 2540]
```

### pagers

This property is a jQuery object of each pager button used to change SaucySlider to a specific scene.  When moving to a scene that is not directly adjacent to the current scene all scene times SaucySlider will move through are added, divided by 2.5, and used as the sceneTime for this transition.
```JS
// Example 1.5
pagers      : $('ul.pagers li'),
prevButton  : $('.prev'),
nextButton  : $('.next'),
sceneNames  : ['First', 'Second', 'Third'],
sceneTimes  : [2000, 3000],
scenePoints : [0, 1400, 2540]
```

### sceneMoved

This function fires every time SaucySlider moves to a new scene.  It passes in the value of the scene its moving from and the scene its moving to.
```JS
// Example 2
sceneMoved: function(a){ console.log(a); }

// Result when moving from scene zero to scene one.
{ pastScene: 0, newScene: 1 }
```

### sceneStopped

This function fires every time SaucySlider ends its transition to a new scene.  It passes in the value of the current scene.
```JS
// Example 2
sceneStopped: function(a){ console.log(a); }

// Result when the transition stopped on scene one.
{ currentScene : 1 }
```

### sceneCanceled

This function fires every time the user changes which scene SaucySlider is moving to while a scene transition is already taking place.  It passes in the value of the scene SaucySlider was originally supposed to stop on.
```JS
// Example 2
sceneCanceled: function(a){ console.log(a); }

// Result when the scene transition was canceled while moving to scene one.
{ currentScene : 1 }
```



## All Options

#### JavaScript Properties

| Property      | Default Value | Accepted Values   |
| ------------- | ------------- | ----------------- |
| scenePoints   | [ ]           | Array of integers |
| sceneTimes    | [ ]           | Array of integers |
| sceneNames    | [ ]           | Array of strings  |
| pager         | false         | jQuery Object     |
| nextButton    | false         | jQuery Object     |
| prevButton    | false         | jQuery Object     |
| sceneMoved    | function(){}  | function          |
| sceneStopped  | function(){}  | function          |
| sceneCanceled | function(){}  | function          |

#### HTML Attributes

| Attribute  | Accepted Values  | Definition |
|:---------- | ---------------- |:---------- |
| data-scene | Whole numbers | Designates which scene the element belongs to |
| data-layer | Numbers       | Designates the speed of the element's parallax effects |
| data-bg-x  | Numbers       | Designates the speed of the element's parallax effects for its horizontal background position |
| data-bg-y  | Numbers       | Designates the speed of the element's parallax effects for its vertical background position |
| data-transition | Valid CSS transition values | Used to add other CSS transition values without overriding SaucySlider's transitions |