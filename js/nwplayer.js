//// Where did video.attr() not work, marked with ***:
// 'paused'
// 'duration'
// 'readyState'
// 'currentTime'
// 'mute'
// 'volume'

//// Video helper functions

var is_playing = function(video) {
    // Return true or false depending on whether video is playing
    var paused = video.paused; // ***
    return (paused === undefined) || (paused === false) || (paused === 'false');
};

var is_ready = function(video) {
    return video.readyState > 0;
};

var min_two_digits = function(x) {
    return (x < 10) ? '0' + x : x;
};

// Structure of code based on tutorial at:
// http://dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/

$.fn.nwVideo = function(options) {
    console.log('Converting video player');
    // Build options data structures before iteration
    var defaults = {
        theme: 'simpledark',
        childtheme: ''
    };
    var options = $.extend(defaults, options);
    // Iterate for each player element
    return this.each(function () {
        var $player = $(this);
        // Create highest level div
        var $topdiv = $('<div></div>').addClass('nwplayer-player').addClass(options.theme).addClass(options.childtheme);
        // Controls div
        var $controls = $('<div class="nwplayer-controls">' +
'    <a class="nwplayer-play" title="Play/Pause">play/pause</a>' +
'    <div class="nwplayer-seek" />' +
'    <div class="nwplayer-timer">0:00</div>' +
'    <div class="nwplayer-volume-box">' +
'        <div class="nwplayer-volume-slider" />' +
'        <a class="nwplayer-volume-button" title="Mute/Unmute">mute</a>' +
'    </div>' +
'</div>');
        $player.wrap($topdiv);
        $player.after($controls);
        // Remove existing fallback controls, will be replaced
        $player.removeAttr('controls');

        // Get handles to all elements
        var $container = $player.parent('.nwplayer-player');
        var $controls = $('.nwplayer-controls', $container);
        var $play_button = $('.nwplayer-play', $container);
        var $seek = $('.nwplayer-seek', $container);
        var $timer = $('.nwplayer-timer', $container);
        var $volume_slider = $('.nwplayer-volume-slider', $container);
        var $volume_button = $('.nwplayer-volume-button', $container);

        // Hide our controls until done
        $controls.hide();

        // Play/Pause function
        var playpause_func = function() {
            if(is_playing($player[0])) {
                console.log('pausing');
                $player[0].pause();
                $player.attr('paused', true);
            } else {
                console.log('playing');
                $player[0].play();
                $player.attr('paused', false);
            }
        };
        // Bind play/pause to button
        $play_button.click(playpause_func);
        // Also bind to clicking on video
        $player.click(playpause_func);
        $player.bind('play', function() {
            $player.attr('paused', false);
            $play_button.addClass('nwplayer-pause');
        });
        $player.bind('pause', function() {
            $player.attr('paused', true);
            $play_button.removeClass('nwplayer-pause');
        });
        $player.bind('ended', function() {
            console.log('Video ended');
            $player.attr('paused', true);
            $play_button.removeClass('nwplayer-pause');
        });

        // Position scrubber is a JQuery UI slider
        $seek.updating = false;
        var createScrubber = function() {
            console.log('trying createScrubber()');
            // Wait until player is ready to create scrubber
            if(is_ready($player[0])) {
                var duration = $player[0].duration; // ***
                console.log('Video duration is: ' + duration + 's');
                // Call jQuery UI to make the slider
                $seek.slider({
                    value: 0,
                    step: 0.01,
                    orientation: 'horizontal',
                    range: 'min',
                    max: duration,
                    animate: false,
                    slide: function(event, ui) {
                        $seek.updating = true;
                    },
                    stop: function(event, ui) {
                        console.log('Scrub to ' + ui.value);
                        $seek.updating = false;
                        $player[0].currentTime = ui.value; // ***
                    }
                });
            } else {
                // If not ready, try again in 150ms
                setTimeout(createScrubber, 150);
            }
        };
        createScrubber();

        // Now hook timer up
        var time_format = function(sec) {
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec - 60 * m);
            return m + ':' + min_two_digits(s);
        };
        var tick = function() {
            var time = $player[0].currentTime; // ***
            // Avoid updating slider when already moving due
            // to user click
            if(!$seek.updating) {
                $seek.slider('value', time);
            }
            // Show timer text
            $timer.text(time_format(time));
        };
        $player.bind('timeupdate', tick);

        // Volume control is a jQuery UI slider as well
        $volume_slider.slider({
            value: 1,
            orientation: 'vertical',
            range: 'min',
            max: 1,
            step: 0.05,
            animate: false,
            slide: function(event, ui) {
                console.log('Set volume to ' + ui.value);
                $player[0].muted = false; // ***
                $player[0].volume = ui.value; // ***
            }
        });
        var mute_func = function() {
            if($player[0].muted == true) { // ***
                console.log('unmute');
                $player[0].muted = false; // ***
                $volume_slider.slider('value', $player[0].volume); // ***
                $volume_button.removeClass('nwplayer-mute');
            } else {
                console.log('mute');
                $player[0].muted = true; // ***
                $volume_slider.slider('value', 0);
                $volume_button.addClass('nwplayer-mute');
            }
        };
        $volume_button.click(mute_func);

        // Unhide our magnificent controls
        $controls.show();
    });
};
