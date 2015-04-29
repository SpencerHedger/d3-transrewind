var transRewind = function() {	
	function _handlestyle(scriptstep, d, rewinding) {
		var step = scriptstep;
		d = d.style(step.property, function(d, i) {
			if(!rewinding) {
				step._origval = d3.select(this).style(step.property);
				return step.value;
			}
			else {
				var orig = step._origval;
				step._origval = null;
				return orig;
			}
		});
	
		return d;
	}

	function _handletransition(trans, d, onBegin, onEnd, rewinding, prevdelay) {
		var o = trans;
		o._transitionCount = 0;

		d = d.transition();
		
		if(o.duration != undefined) d = d.duration(o.duration);
		if(o.ease != undefined) d = d.ease(o.ease);
		
		if(!rewinding) {
			if(o.delay != undefined) d = d.delay(o.delay);
		}
		else if(prevdelay != undefined && prevdelay != null) d = d.delay(prevdelay);
		
		d = d.each('start', function() {
			if(o._transitionCount == 0 && onBegin != undefined && onBegin != null) onBegin(o);
			o._transitionCount++;
		});
		
		d = d.each('end', function() {
			o._transitionCount--;
			if(o._transitionCount == 0 && onEnd != undefined && onEnd != null) onEnd(o);
		});
		
		if(o.style != undefined) {
			if(!rewinding) {
				for(var j=0; j < o.style.length; j++) {
					d = _handlestyle(o.style[j], d, false);
				}
			}
			else {
				for(var j=o.style.length-1; j >= 0; j--) {
					d = _handlestyle(o.style[j], d, true);
				}
			}
		}
		
		return d;
	}

	function _handlescript(script, onBegin, onEnd, rewinding) {
		var o = script;
		var d = d3.select(o.select);
		
		o._scriptCount = 0;
		onBegin(o);
		
		if(!rewinding) {
			for(var j=0; j < o.transitions.length; j++) {
				d = _handletransition(o.transitions[j], d,
							function() { o._scriptCount++; },
							function() { o._scriptCount--; if(o._scriptCount == 0) onEnd(o); }, false);
			}
		}
		else {
			for(var j=o.transitions.length-1; j >= 0; j--) {
				var prevdelay = null;
				if(j < o.transitions.length-1) prevdelay = o.transitions[j+1].delay;
				d = _handletransition(o.transitions[j], d,
							function() { o._scriptCount++; },
							function() { o._scriptCount--; if(o._scriptCount == 0) onEnd(o); }, true, prevdelay);
			}
		}
	}

	function played(s) {
		return (s._played == true);
	}

	function play(s, onBegin, onEnd) {
		if(s._sCount > 0 || s._played == true) return; // Still busy or already played
	
		s._sCount = 0;
		s._played = true;
		
		for(var i=0; i < s.script.length; i++) _handlescript(s.script[i], function() {
				if(s._sCount == 0 && onBegin != undefined && onBegin != null) onBegin(s);
				s._sCount++;
			},
			function() {
				s._sCount--;
				if(s._sCount == 0 && onEnd != undefined && onEnd != null) onEnd(s);
			}, false);
	}

	function rewind(s, onBegin, onEnd) {
		if(s._sCount > 0 || s._played != true) return; // Still busy or not played
		
		s._sCount = 0;
		s._played = false;
		
		for(var i=s.script.length-1; i >= 0; i--) _handlescript(s.script[i], function() {
				if(s._sCount == 0 && onBegin != undefined && onBegin != null) onBegin(s);
				s._sCount++
			},
			function() {
				s._sCount--;
				if(s._sCount == 0 && onEnd != undefined && onEnd != null) onEnd(s);
			}, true);
	}
	
	return {
		played: played,
		play: play,
		rewind: rewind
	};
}();