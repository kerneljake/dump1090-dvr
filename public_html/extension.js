// -----------------------------------------------------
//
// This file is so users can modify how the page acts
// without diving to deep in the code.  This way we can
// also try out or hold custom code for ourselves and
// not check it into the repo.
//
// There is a div id'ed as plane_extension for use with
// this javascript file.
// -----------------------------------------------------

var playBtn, liveBtn, thirtySecBtn, fiveMinBtn, oneHourBtn;
var timesOneBtn, timesTwoBtn, timesFiveBtn, timesTenBtn;
var paused = false;

const buttonPressedColor = '#1E90FF';
const buttonUnpressedColor = '#ffffff';
const textActive = '#fff';
const textNormal = '#000';

const cssBtnOn  = {'backgroundColor': buttonPressedColor,   'color': textActive};
const cssBtnOff = {'backgroundColor': buttonUnpressedColor, 'color': textNormal};

const playText = "PLAY&nbsp";
const pauseText = "PAUSE";

function extendedInitalize() {
    // Write your initalization here
    // Gets called just before the 1-sec function call loop is setup

    // larger, faster tooltips, but it's difficult to co-exist with browser's default tooltip
    //$(document).tooltip({show: null, track: true});

    // playback buttons begin here
    var html = '<button class="button" id="playpausebtn">PAUSE</button>' + '&nbsp;' +
	'<button class="button" id="thirtySecBtn">&lt;&lt; 30 SEC</button>' + '&nbsp;' +
	'<button class="button" id="fiveMinBtn">&lt;&lt; 5 MIN</button>' + '&nbsp;' +
	'<button class="button" id="oneHourBtn">&lt;&lt; 1 HR</button>' + '&nbsp;' +
	'<button class="button" id="liveBtn">LIVE</button>' + '&nbsp;' + '&nbsp;' +
	'<br>' +
	'<button class="button" id="timesOneBtn">x1</button>' + '&nbsp;' + '&nbsp;' +
	'<button class="button" id="timesTwoBtn">x2</button>' + '&nbsp;' + '&nbsp;' +
	'<button class="button" id="timesFiveBtn">x5</button>' + '&nbsp;' + '&nbsp;' +
	'<button class="button" id="timesTenBtn">x10</button>' + '&nbsp;' + '&nbsp;' +
	'';
    html += '<div id="head_position"></div>';
    document.getElementById('plane_extension').innerHTML = html;

    $('#liveBtn').animate(cssBtnOn, 200); // start out as live

    // play/pause button
    playBtn = document.getElementById('playpausebtn');
    playBtn.addEventListener("click", playPause);
    function playPause() {
	// save current head position if we paused a live session
	if (0 == head) {
	    head = rightNowSeconds();
	}
	if (!paused) {
	    window.clearInterval(intervalID); // stop refreshing
	    paused = true;
	    playBtn.innerHTML = playText;
	} else {
	    playBtn.innerHTML = pauseText;
	    paused = false;
	    intervalID = window.setInterval(eventLoop, intervalDuration);  // start refreshing
	}
	$('#liveBtn').animate(cssBtnOff, 200);
    }

    // live button
    liveBtn = document.getElementById('liveBtn');
    liveBtn.addEventListener("click", live);
    function live() {
	if (0 == head) {
	    return; // we're already live
	}
	clearAllPlanes();
	head = 0;
	if (!paused) {
	    // we were watching history
	    window.clearInterval(intervalID); // clear out old interval
	}
	intervalDuration = 1000;
	intervalID = window.setInterval(eventLoop, intervalDuration);  // start refreshing
	paused = false;
	// clean up buttons
	playBtn.innerHTML = pauseText;
	liveButtonsReset();
    }

    // 30-second rewind button
    thirtySecBtn = document.getElementById('thirtySecBtn');
    thirtySecBtn.addEventListener("click", rewind.bind(this, 30));

    // 5-minute rewind button
    fiveMinBtn = document.getElementById('fiveMinBtn');
    fiveMinBtn.addEventListener("click", rewind.bind(this, 5*60));

    // 1-hour rewind button
    oneHourBtn = document.getElementById('oneHourBtn');
    oneHourBtn.addEventListener("click", rewind.bind(this, 60*60));

    function rewind(seconds) {
	clearAllPlanes();
	if (head > 0) {
	    head = Math.max(head - seconds, myEpoch());
	} else {
	    head = rightNowSeconds() - seconds;
	}
	$('#liveBtn').animate(cssBtnOff, 200);
    }

    // normal playback speed
    timesOneBtn = document.getElementById('timesOneBtn');
    timesOneBtn.addEventListener("click", speedChange.bind(this, 1000));
    $('#timesOneBtn').click(function() {
	    if (head > 0) {
		$(this).animate(cssBtnOn, 200);
		$('#timesTwoBtn').animate(cssBtnOff, 200);
		$('#timesFiveBtn').animate(cssBtnOff, 200);
		$('#timesTenBtn').animate(cssBtnOff, 200);
	    }
	});

    // times two playback speed
    timesTwoBtn = document.getElementById('timesTwoBtn');
    timesTwoBtn.addEventListener("click", speedChange.bind(this, 500));
    $('#timesTwoBtn').click(function() {
	    if (head > 0) {
		$('#timesOneBtn').animate(cssBtnOff, 200);
		$(this).animate(cssBtnOn, 200);
		$('#timesFiveBtn').animate(cssBtnOff, 200);
		$('#timesTenBtn').animate(cssBtnOff, 200);
	    }
	});

    // times five playback speed
    timesFiveBtn = document.getElementById('timesFiveBtn');
    timesFiveBtn.addEventListener("click", speedChange.bind(this, 200));
    $('#timesFiveBtn').click(function() {
	    if (head > 0) {
		$('#timesOneBtn').animate(cssBtnOff, 200);
		$('#timesTwoBtn').animate(cssBtnOff, 200);
		$(this).animate(cssBtnOn, 200);
		$('#timesTenBtn').animate(cssBtnOff, 200);
	    }
	});

    // times ten playback speed
    timesTenBtn = document.getElementById('timesTenBtn');
    timesTenBtn.addEventListener("click", speedChange.bind(this, 100));
    $('#timesTenBtn').click(function() {
	    if (head > 0) {
		$('#timesOneBtn').animate(cssBtnOff, 200);
		$('#timesTwoBtn').animate(cssBtnOff, 200);
		$('#timesFiveBtn').animate(cssBtnOff, 200);
		$(this).animate(cssBtnOn, 200);
	    }
	});


    function speedChange(delay) {
	if (head > 0) {
	    window.clearInterval(intervalID); // stop refreshing
	    intervalDuration = delay; // ms
	    intervalID = window.setInterval(eventLoop, intervalDuration);  // start refreshing
	    playBtn.innerHTML = pauseText;
	}
    }

    function myEpoch() {
	// the lowest time we can seek to
	return rightNowSeconds() - (3600 * 24);
    }

    function clearAllPlanes() {
	for (var plane in Planes) {
	    if (Planes[plane].marker) {
		Planes[plane].marker.setMap(null);
	    }
	    delete Planes[plane];
	}
	document.getElementById('planes_table').innerHTML = '';
    }

    function rightNowSeconds() {
	return Math.round(new Date().getTime() / 1000);
    }
}

function liveButtonsReset() {
    $('#liveBtn').animate({backgroundColor: buttonPressedColor, color: textActive}, 200);
    $('#timesOneBtn').animate({backgroundColor: buttonUnpressedColor, color: textNormal}, 200);
    $('#timesTwoBtn').animate({backgroundColor: buttonUnpressedColor, color: textNormal}, 200);
    $('#timesFiveBtn').animate({backgroundColor: buttonUnpressedColor, color: textNormal}, 200);
    $('#timesTenBtn').animate({backgroundColor: buttonUnpressedColor, color: textNormal}, 200);
}

function extendedPulse() {
    // This will get called every second after all the main functions
    const right_now = new Date();
    const right_now_secs = Math.round(new Date().getTime() / 1000);
    var head_time; // what we display

    if (head > 0) {
	head++;
	head_time = new Date(head * 1000);
	if (head > right_now_secs) {
	    // we sped through history and are now in the present
	    // don't call live() here because we don't want to clear planes
	    head = 0;
	    head_time = right_now;
	    window.clearInterval(intervalID); // stop refreshing
	    intervalDuration = 1000;
	    intervalID = window.setInterval(eventLoop, intervalDuration);  // start refreshing
	    liveButtonsReset();
	}
    } else {
	head_time = right_now;
    }

    // update timestamp display
    document.getElementById('head_position').innerHTML = head_time.toString();
}
