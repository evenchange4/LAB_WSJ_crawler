
/* /assets/r20131.3.2-4/pqc/components/Overlay.js */;
var Overlay = Class.create(
{
	initialize: function(spec)
	{
		this.overlayJSON = spec.options;
		this.overlayJSON.openjs = this.processAfterOpening.bind(this);

		this.clientId = spec.options.eid;
		this.loaded = false;
		this.loadOnce = spec.loadOnce;
		this.overlayZoneId = spec.oZoneId;
		this.updateURL = spec.updateURL;
		this.loadingMessage = spec.loadMsg;
		this.clientValidation = spec.clientValid;
		this.autofocus = spec.autofocus;
		if (spec.showImmediately) {
			// no need to observe anything, if we are responding immediately, it is likely to 
			// some type of user input.
			this.showOverlay();	
			return; 
		}		
		if (spec.ownObs) {
			var triggerElem = $(spec.triggerId);
			if (triggerElem) {
				triggerElem.observe('click', this.trigger.bindAsEventListener(this));
			}
			Overlay.box.addOverlay(this.clientId, this);
		} else {
			if (! Overlay.StorageTriggers &&  spec.triggerId) {
				Event.observe(document, 'click', this.clickOnTrigger.bindAsEventListener(this));
			}
			Overlay.box.addOverlay(this.clientId, this, spec.triggerId);
		}
	},
	trigger: function(event)
	{
		event.stop();
		this.showOverlay();
        return false;
	},
	clickOnTrigger: function(event) {
		if (event.isLeftClick() || event.button == 0) {
			var trigger = event.findElement();
			while (trigger && (!trigger.id || trigger.id == "")) {
				trigger = trigger.parentNode;
			}		
			if (trigger) {
				 var overlayid = Overlay.StorageTriggers.get(trigger.id);
				 if (overlayid) {
					 event.stop();
					 Overlay.box.showOverlay(overlayid);
				 }
			}
		}
	},
	showOverlay: function()
	{
		if (this.updateURL && !this.loaded)
		{
			var zoneElement = $(this.overlayZoneId);
			zoneElement.update(this.loadingMessage);
			var zoneObject = Tapestry.findZoneManagerForZone(this.overlayZoneId);
			if (zoneObject) {
	            var successHandler = function(transport) {
	                zoneObject.processReply(transport.responseJSON);
	    			if ($('t-autoloader-icon') == null)
	    				Overlay.box.resizeOverlay();
	    			else {
	    				var intervalTime = 2;

						this.intervalID = setInterval(function() {
							if ($('t-autoloader-icon') == null) {
								Overlay.box.resizeOverlay()
								clearInterval(this.intervalID);
							}
						}.bind(this), intervalTime);
	    			}
					
				}.bind(this);
				Tapestry.ajaxRequest(this.updateURL, successHandler);
				if (this.loadOnce) {
					this.loaded = true;
				}
			}
		} else {
			if (this.clientValidation) {
				// Hide any errors when opening an overlay, but not ajax loading, an overlay.
				$(this.clientId).select('input', 'select', 'textarea').invoke('removeDecorations');
			}
			var errorWrap = $('error-wrapper'); 
			if (errorWrap) {
				errorWrap.hide(); 
			}
		}
		// Show the overlay.
		TINY.box.show(this.overlayJSON);
	},
	resizeOverlay: function()
	{
		TINY.box.size(1);
	},
	hideOverlay: function()
	{
		TINY.box.hide();
	},
	updateTitle: function(titleArea)
	{
		this.overlayJSON.title = titleArea.innerHTML;
	},
	setCloseCallback: function(callback)
	{
		this.closeCallBack = callback;
	},
	processAfterOpening: function()
	{
		if (this.autofocus) {
			try {
				var aElem = $(this.overlayJSON.afocus);
				if(aElem) {
					aElem.focus();
				}
				
			} catch (e) {	/* prevent IE8 not ready js error; */	}
		}
		document.fire("lightview:opened")
	}
});	

Tapestry.Initializer.overlay = function(spec)
{
	 new Overlay(spec);
}


Overlay.Storage = {
  UID: 1
};

Overlay.StorageTriggers;


Overlay.box = function() {
	var currentOverlay;
	return {
		showOverlay : function(element) {
			var ov = this.getOverlay(element);
			if (ov) {
				ov.showOverlay();
				currentOverlay = ov;
			}
		},
		resizeOverlay : function(width, height) {
			TINY.box.size(1, width, height);
		},
		hideOverlay : function() {
			TINY.box.hide();
			currentOverlay = null;
		},
		changeTitle : function(newTitle, element) {
			var titleArea = $('pq_layer').up().down('div.ttitle');
			var titleElem = titleArea.down('span.overlayTitle');
			if (titleElem) {
				titleElem.innerHTML = newTitle;
			}
			if (element) {
				var ov = this.getOverlay(element);
				if (ov)
					ov.updateTitle(titleArea);
			}
		},
		changeCloseCallback : function(callback, element) {
			if (element) {
				var ov = this.getOverlay(element);
				if (ov) {
					ov.setCloseCallback(callback);
				}
			}
			TINY.box.closejs( callback );
		},
		getOverlay : function(id) {
			return  Overlay.Storage[id];
		},
		addOverlay : function(id, value, trigger) {
			Overlay.Storage[id] = value;
			if (trigger) {
				if (!Overlay.StorageTriggers)
					Overlay.StorageTriggers = $H();
				Overlay.StorageTriggers.set(trigger, id);
			}
		}
	}
}();

//TODO: create a tapestry component (ajaxOverlayLink) which ensures that the overlay is
//indeed the first item in the list (or creates a div with the appropriate subclass
//to identify the overlay
function hideBasicZone() {
	$$('#basicOverlayZone > div').hide();
}

function openInZone(href, zoneId) {
	Tapestry.ajaxRequest(href, function(transport) {
		var zoneManager = Tapestry.findZoneManagerForZone( zoneId );
		if (zoneManager) {
			zoneManager.processReply(transport.responseJSON);
		}
	});
}

document.observer.observe('click', '.basicOverlayLink', function(e, el) {
     openInZone(el.href, 'basicOverlayZone', el.rel?el.rel:"")
});

/* /assets/r20131.3.2-4/pqc/javascript/tinybox2/tinybox.js */;
TINY = {};

TINY.box = function() {
	var j, m, b, g, v, p = 0;
	var oldParent, content = 0;
	return {
		show : function(o) {
			v={opacity:30,close:1,animate:1,fixed:1,mask:1,maskid:'',boxid:'',topsplit:2,url:0,post:0,height:0,width:0,html:0,iframe:0};
			for (s in o) {
				v[s] = o[s];
			}
			if (!p) {
				j = document.createElement('div'); j.className = 'tbox';
				k = document.createElement('div'); k.className = 'tspacer';
				et = document.createElement('div'); et.className = 'etitle';
				t = document.createElement('div'); t.className = 'ttitle';
				h = document.createElement('div'); h.className = 'clear';
				p = document.createElement('div'); p.className = 'tinner';
				b = document.createElement('div'); b.className = 'tcontent';
				m = document.createElement('div'); m.className = 'tmask';
				g = document.createElement('div'); g.className = 'tclose'; g.v = 0;
				document.body.appendChild(m);
				document.body.appendChild(j);
				j.appendChild(k);
				k.appendChild(t);
				k.appendChild(et);
				k.appendChild(h);
				k.appendChild(p);
				p.appendChild(b);
				g.onclick = TINY.box.hide;
				window.onresize = TINY.box.resize
			} else {
				j.style.display = 'none';
				clearTimeout(p.ah);
				if (g.v) {
					k.removeChild(g);
					g.v = 0
				}
			}
	        $$('object', 'embed').each(function(node) { node.style.visibility = 'hidden' });
	        g.title = 'Close';
			p.id = v.boxid;
			m.id = v.maskid;
			j.style.position = v.fixed ? 'fixed' : 'absolute';
			if (v.html && !v.animate) {
				p.style.backgroundImage = 'none';
				b.innerHTML = v.html;
				b.style.display = '';
				p.style.width = v.width ? v.width + 'px' : 'auto';
				p.style.height = v.height ? v.height + 'px' : 'auto'
			} else {
				b.style.display = 'none';
				if (!v.animate && v.width && v.height) {
					p.style.width = v.width + 'px';
					p.style.height = v.height + 'px'
				} else {
					p.style.width = p.style.height = '100px'
				}
			}
			if (v.title) {
				t.innerHTML = v.title;
			}
			if (v.extraHeader) {
				et.innerHTML = v.extraHeader;
			} else {
				et.innerHTML = "";
			}
			if (v.mask) {
				this.mask();
				this.alpha(m, 1, v.opacity)
			} else {
				this.alpha(j, 1, 100)
			}
			if (v.autohide) {
				p.ah = setTimeout(TINY.box.hide, 1000 * v.autohide)
			} else {
				document.onkeyup = TINY.box.esc
			}
		},
		fill : function(c, u, k, a, w, h) {
			if (u) {
				if (v.image) {
					var i = new Image();
					i.onload = function() {
						w = w || i.width;
						h = h || i.height;
						TINY.box.psh(i, a, w, h)
					};
					i.src = v.image
				} else if (v.iframe) {
					this.psh('<iframe src="' + v.iframe + '" width="' + v.width	+ '" frameborder="0" height="' + v.height + '"></iframe>', a, w, h)
				} else {
					var x = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
					x.onreadystatechange = function() {
						if (x.readyState == 4 && x.status == 200) {
							p.style.backgroundImage = '';
							TINY.box.psh(x.responseText, a, w, h)
						}
					};
					if (k) {
						x.open('POST', c, true);
						x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
						x.send(k)
					} else {
						x.open('GET', c, true);
						x.send(null)
					}
				}
			} else {
				// Fill box with the element eid, storing parent.
				if (v.eid) {
					var elem = document.getElementById(v.eid);
					if (elem) {
						content = elem;
						oldParent = elem.parentNode;
						this.psh(elem, a, w, h);
						return;
					}
				}
				this.psh(c, a, w, h)
			}
		},
		psh : function(c, a, w, h) {
			if (typeof c == 'object') {
				b.appendChild(c)
			} else {
				b.innerHTML = c
			}
			this.size(a, w, h)
		},
		esc : function(e) {
			e = e || window.event;
			if (e.keyCode == 27) {
				TINY.box.hide()
			}
		},
		hide : function() {
			TINY.box.alpha(j, -1, 0, 3);
			document.onkeypress = null;
			if (v.closejs) {
				var closejs = v.closejs;
				if (typeof closejs == 'function') {
					v.closejs();
				} else {				
					var f = eval(closejs);
					f();
				}
			}
	        $$('object', 'embed').each(function(node) { node.style.visibility = 'visible' });
			document.fire("lightview:hidden");
		},
		closejs : function(closejs) {
			v.closejs = closejs;
		},
		resize : function() {
			TINY.box.pos();
			TINY.box.mask()
		},
		mask : function() {
			m.style.height = this.total(1) + 'px';
			m.style.width = this.total(0) + 'px'
		},
		pos : function() {
			var t;
			if (typeof v.top != 'undefined') {
				t = v.top
			} else {
				t = (this.height() / v.topsplit) - (k.offsetHeight / 2);
				t = t < 20 ? 20 : t
			}
			if (!v.fixed && !v.top) {
				t += this.top()
			}
			j.style.top = t + 'px';
			j.style.left = typeof v.left != 'undefined' ? v.left + 'px' : (this.width() / 2) - (j.offsetWidth / 2) + 'px'
		},
		alpha : function(e, d, a) {
			clearInterval(e.ai);
			if (d) {
				e.style.opacity = 0;
				e.style.filter = 'alpha(opacity=0)';
				e.style.display = 'block';
				TINY.box.pos()
			}
			e.ai = setInterval( function() {
				TINY.box.ta(e, a, d)
			}, 20)
		},
		ta : function(e, a, d) {
			var o = Math.round(e.style.opacity * 100);
			// Replace any moved content.
			if (oldParent && content) {
				oldParent.appendChild(content);
			}
			if (o == a) {
				clearInterval(e.ai);
				if (d == -1) {
					e.style.display = 'none';
					e == j ? TINY.box.alpha(m, -1, 0, 2) : b.innerHTML = p.style.backgroundImage = ''
				} else {
					if (e == m) {
						this.alpha(j, 1, 100)
					} else {
						j.style.filter = '';
						TINY.box.fill(v.html || v.url || v.eid, v.url || v.iframe || v.image, v.post, v.animate, v.width, v.height)
					}
				}
			} else {
				var n = a - Math.floor(Math.abs(a - o) * .5) * d;
				e.style.opacity = n / 100;
				e.style.filter = 'alpha(opacity=' + n + ')'
			}
		},
		size : function(a, w, h) {
			if(p){
			var x = p.style.width, y = p.style.height, fh = false;
			if (!w || !h) {
				p.style.width = w ? w + 'px' : '';
				p.style.height = h ? h + 'px' : '';
				b.style.display = '';
				if (!h) {
					var hh = document.viewport.getHeight()-p.offsetTop*2;
					if (hh<p.offsetHeight) {h = parseInt(hh);fh = true;} else h = parseInt(p.offsetHeight);
				}
				if (!w) {
					var ww = document.viewport.getWidth()-p.offsetLeft*2;
					w = (ww<p.offsetHeight ? parseInt(ww) : parseInt(p.offsetWidth));
				}
				b.style.display = 'none'
			}
			p.style.width = x;
			p.style.height = y;
			if (a) {
				clearInterval(p.si);
				var wd = parseInt(p.style.width) > w ? -1 : 1, hd = parseInt(p.style.height) > h ? -1 : 1;
				if (!p.style.height) p.style.height = '1px';
				p.si = setInterval( function() { TINY.box.ts(w, wd, h, hd, fh) }, 20)
			} else {
				p.style.backgroundImage = 'none';
				if (v.close) {
					k.appendChild(g);
					g.v = 1
				}
				p.style.width = w + 'px';
				p.style.height = h + 'px';
				b.style.display = '';
				this.pos();
				if (v.openjs) {
					v.openjs()
				}
			}
			}
		},
		ts : function(w, wd, h, hd, fh) {
			var cw = parseInt(p.style.width), ch = parseInt(p.style.height);
			if (cw == w && ch == h) {
				clearInterval(p.si);
				p.style.backgroundImage = 'none';
				b.style.display = 'block';
				if (!fh && !v.height) {
					p.style.height = '';
				}
				if (p.viewportOffset) {
					p.style.maxHeight = Math.max(parseInt(document.viewport.getHeight() - p.viewportOffset().top - p.offsetTop), ch) + 'px';
				}
				else {
					p.style.maxHeight = Math.max(parseInt(document.viewport.getHeight() - p.offsetTop), ch) + 'px';
				}
				if (v.close) {
					k.appendChild(g);
					g.v = 1
				}
				if (v.openjs) {
					v.openjs()
				}
			} else {
				if (cw != w) {
					p.style.width = (w - Math.floor(Math.abs(w - cw) * .6) * wd) + 'px'
				}
				if (ch != h) {
					p.style.height = (h - Math.floor(Math.abs(h - ch) * .6)	* hd) + 'px'
				}
			}
			this.pos()
		},
		top : function() {
			return document.documentElement.scrollTop || document.body.scrollTop
		},
		width : function() {
			return self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
		},
		height : function() {
			return self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		},
		total : function(d) {
			var b = document.body, e = document.documentElement;
			return d ? Math.max(Math.max(b.scrollHeight, e.scrollHeight), Math.max(b.clientHeight, e.clientHeight)) 
					 : Math.max(Math.max(b.scrollWidth, e.scrollWidth), Math.max(b.clientWidth,	e.clientWidth))
		}
	}
}();
/* /assets/r20131.3.2-4/pqc/javascript/prototip/js/event.simulate.js */;
/**
* Event.simulate(@element, eventName[, options]) -> Element
*
* - @element: element to fire event on
* - eventName: name of event to fire (only MouseEvents and HTMLEvents interfaces are supported)
* - options: optional object to fine-tune event properties - pointerX, pointerY, ctrlKey, etc.
*
* $('foo').simulate('click'); // => fires "click" event on an element with id=foo
*
**/
(function(){
  
  var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|mouse(?:down|up|over|move|out))$/
  }
  var defaultOptions = {
    pointerX: 0,
    pointerY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
  }
  
  Event.simulate = function(element, eventName) {
    var options = Object.extend(defaultOptions, arguments[2] || { });
    var oEvent, eventType = null;
    
    element = $(element);
    
    for (var name in eventMatchers) {
      if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
      throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');

    if (document.createEvent) {
      oEvent = document.createEvent(eventType);
      if (eventType == 'HTMLEvents') {
        oEvent.initEvent(eventName, options.bubbles, options.cancelable);
      }
      else {
        oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
          options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
          options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
      }
      element.dispatchEvent(oEvent);
    }
    else {
      options.clientX = options.pointerX;
      options.clientY = options.pointerY;
      oEvent = Object.extend(document.createEventObject(), options);
      element.fireEvent('on' + eventName, oEvent);
    }
    return element;
  }
  
  Element.addMethods({ simulate: Event.simulate });
})()
/* /assets/r20131.3.2-4/pqc/components/InfoBubble.js */;
var InfoBubble = Class.create(
{
	initialize: function(spec)
	{	
		this.triggerId = spec.triggerId;
		this.contentId = spec.contentId;
		
		this.options = spec.options;
		this.clearTip = Boolean(spec.clearTip);
		this.updateURL = spec.updateURL;
		this.bubbleZoneID = spec.infoBubbleZoneId;
		this.loadOnce = spec.loadOnce;
		this.disablePrintReadOnly = spec.disablePrintReadOnly;
		this.showOnLoad = spec.showOnLoad;
		if(this.disablePrintReadOnly){
			this.windowsCtrlPrintMsg = spec.windowsCtrlPrintMsg;
		}
		
		if (this.options.showOn == 'mousemove') {
			if (!InfoBubble.StorageMouseMove) {
				Event.observe(document, "mousemove", this.handleMouseMove.bind(this));
				InfoBubble.StorageMouseMove = $H();
			}
			InfoBubble.StorageMouseMove.set(this.triggerId, this);
			this.eventToUse = 'mouseover';
		} else {
			if (!InfoBubble.StorageClick) {
				Event.observe(document, "click", this.handleClick.bind(this));
				InfoBubble.StorageClick = $H();
			}
			InfoBubble.StorageClick.set(this.triggerId, this);
			this.eventToUse = 'click';
		}
		
		if (!InfoBubble.StorageKey) {
			InfoBubble.StorageKey = $H();
			Event.observe(document, "keypress", this.handleKeypress.bind(this));
		}
		InfoBubble.StorageKey.set(this.triggerId, this);
		
	},
	handleKeypress: function(event) {
		if (event.keyCode == 32 || event.charCode == 32) { //SPACE KEY
			var trigger = event.findElement();
			if (trigger) {
				var tip = InfoBubble.StorageKey.get(trigger.id);
				if (tip == null) {
					 if ((trigger.classList && trigger.classList.contains('infobubble')) || (trigger.className && trigger.className.indexOf('infobubble') != -1)) {
						 	trigger = $(trigger).up('div');
						 	if (trigger)
						 		tip = InfoBubble.StorageKey.get(trigger.id);
					 }
				}
				if (tip) {
					Event.stop(event);
					 tip.simulateEvent(event);
				}
			}
		}
	},
	
	handleMouseMove: function(event) {
		var trigger = event.findElement();
		if (trigger) {
			 var tip = InfoBubble.StorageMouseMove.get(trigger.id);
			 if (!tip) {
				 if ((trigger.classList && trigger.classList.contains('infobubble')) || (trigger.className && trigger.className.indexOf('infobubble') != -1)) {
				 	trigger = $(trigger).up('div');
				 	if (trigger)
				 		tip = InfoBubble.StorageMouseMove.get(trigger.id);
				 }
			 }
			 if (tip) {
				 InfoBubble.StorageMouseMove.unset(trigger.id);
				 tip.displayTip(event);
			 }
		}
	},
	handleClick: function(event) {
		var trigger = event.findElement();
		if (trigger) {
			 var tip = InfoBubble.StorageClick.get(trigger.id);
			 if (tip) {
				 InfoBubble.StorageClick.unset(trigger.id);
				 tip.displayTip(event);
			 }
		}
	},
	displayTip: function(event) {
		
		
		this.targetElm = $(this.contentId);
		if (this.targetElm) {
			if (!this.trigger)
				this.trigger = $(this.triggerId);
			
			$T(this.trigger).zoneId = this.bubbleZoneID;
			
			try{
				new Tip(this.triggerId, this.targetElm, this.options);
				if (this.updateURL)
					this.trigger.observe('prototip:shown', this.ajaxLoadTip.bindAsEventListener(this));
				
				if (this.disablePrintReadOnly) {
					this.badKeys = new Object();
					this.badKeys.single = new Object();
					this.badKeys.alt = new Object();
					
					this.badKeys.ctrl = new Object();
					this.badKeys.ctrl['88'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['86'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['80'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['67'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['65'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['97'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['99'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['112'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['118'] = this.windowsCtrlPrintMsg;
					this.badKeys.ctrl['120'] = this.windowsCtrlPrintMsg;

					if (!this.clearTip)
						this.trigger.observe('prototip:hidden', this.reEnableMouseSelection.bindAsEventListener(this));
				}
				
				this.simulateEvent(event);
				
			} catch (err) {
				alert(err);
			}

			
		}

	},
	simulateEvent: function(event) {
		if (!this.trigger)
			this.trigger = $(this.triggerId);
		
		if (this.options.showOn == 'mousemove') {
			this.trigger.simulate( 'mouseover');
			this.trigger.simulate( 'mousemove');
		} else
			this.trigger.simulate( this.options.showOn );//);
	},
	createAndShow: function(event) {
		new Tip(this.triggerId, this.targetElm, this.options);
		return false;
	},
	reEnableMouseSelection: function(event){
		document.onselectstart = function () {return true} // ie
		document.onmousedown = function () {return true}  // mozilla
		document.stopObserving('keydown',this.keyDownEventHandler(this));
		document.stopObserving('keypress',this.keyPressEventHandler(this));
		return false;
	},
	callNewTip: function(event) {
		if(this.disablePrintReadOnly){
			document.onselectstart = function () {return true} // ie
			document.onmousedown = function () {return true}  // mozilla	
			document.stopObserving('keydown',this.keyDownEventHandler(this));
			document.stopObserving('keypress',this.keyPressEventHandler(this));
		}
		Tips.remove(this.triggerId);
		new Tip(this.triggerId, this.targetElm, this.options);
		return false;
	},
	ajaxLoadTip: function(event) {
		if(this.disablePrintReadOnly){
			document.onselectstart = function () { return false; } // ie
			document.onmousedown = function () { return false; }  // mozilla
			var browserHeader=navigator.userAgent;
			var firefoxVersion=browserHeader.indexOf("Firefox");
			if (firefoxVersion>=0){
				document.observe('keypress',this.keyPressEventHandler.bindAsEventListener(this));
			}
			else{
				document.observe('keydown',this.keyDownEventHandler.bindAsEventListener(this));
			}			
		}
		Event.stop(event);
		if (!this.loaded)
		{
			var zoneObject = Tapestry.findZoneManager( this.trigger );
			if (!zoneObject)
				return;

			zoneObject.updateFromURL(this.updateURL);
			if (this.loadOnce) {
				this.loaded = true;
			}
		}		
		return false;
	},
	keyDownEventHandler: function(e) {
		this.keyCode = (document.all) ? e.keyCode : e.which;
		this.ctrlKey = e.ctrlKey;
		this.metaKey = e.metaKey;
		this.altKey = e.altKey;
		
		// Find out if we need to disable this key combination
		var badKeyType = "single";
		if (this.ctrlKey) {
			badKeyType = "ctrl";
		} else if (this.altKey) {
			badKeyType = "alt";
		}
		else if(this.metaKey){
			badKeyType = "ctrl";
		}
		if (this.checkKeyCode(badKeyType, this.keyCode)) {
			return this.cancelKey(e, this.keyCode, this.getKeyText(badKeyType, this.keyCode));
		}
	},
	keyPressEventHandler: function(e) {
		this.keyCode = (document.all) ? e.keyCode : e.which;
		this.ctrlKey = e.ctrlKey;
		this.altKey = e.altKey;
		this.metaKey = e.metaKey;
		
		// Find out if we need to disable this key combination
		var badKeyType = "single";
		if (this.ctrlKey) {
			badKeyType = "ctrl";
		} else if (this.altKey) {
			badKeyType = "alt";
		}
		else if(this.metaKey){
			badKeyType = "ctrl";
		}
		if (this.checkKeyCode(badKeyType, this.keyCode)) {
			return this.cancelKey(e, this.keyCode, this.getKeyText(badKeyType, this.keyCode));
		}
	},
	
	checkKeyCode: function(type, code){
		if (this.badKeys[type][code]) {
			return true;
		} else {
			return false;
		}
	},
	
	cancelKey: function(e, keyCode, keyText) {
		
		//Alert window only appears for CTRL + P
		if(e.type!= undefined && (keyCode == "112" || keyCode == "80")){
			alert(keyText);	
		}
		Event.stop(e);
		return false;
	},
	
	getKeyText: function(type, code){
		return this.badKeys[type][code];
	}	
});

InfoBubble.StorageMouseMove;
InfoBubble.StorageClick;
InfoBubble.StorageKey;

Tapestry.Initializer.infoBubble = function(spec)
{
	new InfoBubble(spec);
}
/* /assets/r20131.3.2-4/pqc/components/PauseSession.js */;
var PauseSession = Class.create(
{
	initialize: function(spec)
	{
		this.trigger = $(spec.triggerId);
		this.fireForm = $(spec.fireFormId);
		
		this.trigger.observe('click', this.executeSubmit.bindAsEventListener(this));
	},
	executeSubmit: function(event)
	{
		this.fireForm.fire('pq:submitForm');
	}
});	

Tapestry.Initializer.pauseSession = function(spec)
{
	var pauseS = new PauseSession(spec);
}


/* /assets/r20131.3.2-4/core/corelib/components/linksubmit.js */;
//
// Overridden linksubmit.js file to fix problem using linksubmit on a zone update.  Delete when TAP779 is deployed.
//


//  Copyright 2008,2009 The Apache Software Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Tapestry.LinkSubmit = Class.create({

    initialize: function(spec)
    {
        this.form = $(spec.formId);
        this.element = $(spec.clientId);
        this.asAjax = spec.asAjax;
        this.element.observe("click", this.onClick.bindAsEventListener(this));
    },

    createHidden : function()
    {
        this.hiddenValue = new Element("input", { "type":"hidden",
        	"id": this.element.id + "-hidden",
            "name": this.element.id + "-hidden",
            "value": this.element.id});

        if($(this.element.id + '-hidden') == null)
            this.element.insert({after:this.hiddenValue});
    },
    
    removeHidden : function()
    {
    	if (this.hiddenValue)
    		this.hiddenValue.remove();
    },

    onClick : function(event)
    {
        // Tapestry.debug("LinkSubmit #{id} clicked.", this.element);

        Event.stop(event);

        var onsubmit = this.form.onsubmit;
        
        this.createHidden();
        
        if (onsubmit == undefined || onsubmit.call(window.document, event))
        {   
        	if(this.asAjax == 'true'){
        		this.form.fire(Tapestry.FORM_PROCESS_SUBMIT_EVENT);
        	} else {
        		this.form.submit();
        	}
        }
        
        this.removeHidden();

        return false;
    }
});

Tapestry.Initializer.linkSubmit = function(formId, clientId)
{
    new Tapestry.LinkSubmit(formId, clientId);
}
/* /assets/r20131.3.2-4/core/corelib/components/ProgressiveDisplay.js */;
// Copyright 2009 The Apache Software Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Tapestry.Initializer.progressiveDisplay = function(spec)
{
    var mgr = new Tapestry.ZoneManager(spec);

    mgr.updateFromURL.bind(mgr).defer(spec.url);
};
/* /assets/r20131.3.2-4/app/base/SelectLimitersEvent.js */;

/*
For pages that show when the user adds a filter.
*/

var SelectLimitersEvent = Class.create( {
	initialize : function(spec) {
		if (!spec.professional) { return false; }
		this.dateLimiter = spec.dateLimiter;
		//managed element arrays
		this.filterInputEls = [];
		this.filterSelectEls = [];
		this.filterSpanEls = [];
		//complete dom arrays
		var allInputEls = $$("input");
		var allSelectEls = $$("select");
		var allSpanEls = $$("span");

		//Use these rules to determine if we should ignore this element.
		var rulesForIgnoringInputs = [
			function(el) { return el === $("includeDuplicate"); },
			function(el) { return el === $("selectAllCheckbox_recentSearch"); },
			function(el) { return (el.parentNode && el.parentNode.id.indexOf("background_") !== -1); }
		];

		//Returns whether the element passed in is on the ignore list.
		var isIgnoredElement = function(el){
			if (!el) { return false }
			for (var i= 0,l=rulesForIgnoringInputs.length; i<l; i++){
				var found = rulesForIgnoringInputs[i](el);
				if (found) { return true; }
			}
			return false;
		};

		//Bind events to input type="checkbox"
		var cnt = 0;
		for (var i=0,l=allInputEls.length; i<l; i++){
			var el = allInputEls[i];
			if (el.type == 'checkbox' && !isIgnoredElement(allInputEls[i])){
				this.filterInputEls[cnt] = el;
				el.observe('change',this.handleChange.bindAsEventListener(this));
				el.observe('click',this.handleChange.bindAsEventListener(this));
				cnt++;
			}
		}

		//Bind events to select menus.
		cnt = 0;
		for (i=0,l=allSelectEls.length; i<l; i++){
			var el = allSelectEls[i];
			if (el.id.indexOf("select_multiDateRange") !== -1){
				this.filterSelectEls[cnt] = allSelectEls[i];
				$(this.filterSelectEls[cnt]).observe('change',this.handleChange.bindAsEventListener(this));
				cnt++;
			}
		}

		//Bind events to span elements.
		cnt = 0;
		for (i=0,l=allSpanEls.length; i<l; i++){
			var el = allSpanEls[i];
			if (el.id.indexOf("toAccessFromJs") !== -1){
				this.filterSpanEls[cnt] = allSpanEls[i];
				$(this.filterSpanEls[cnt]).firstDescendant().observe('change',this.handleChange.bindAsEventListener(this));
				cnt++;
			}
		}

		this.handleChange(window.event||null);
	},

	/* show filtering indicator if a selection is adding a filter. */
	handleChange: function() {
		var isFilter = false;

		if (this.filterInputEls.length > 0){
			for (var i=0; i<this.filterInputEls.length; i++){
				if (this.filterInputEls[i].checked){
					isFilter = true;
					break;
				}
			}
		}
		
		if (this.filterSelectEls.length > 0){
			for (i=0; i<this.filterSelectEls.length; i++) {
			    if ($(this.filterSelectEls[i]).value != this.dateLimiter) {
			    	isFilter = true;
					break;
			    }
			}
		}
		
		if (this.filterSpanEls.length > 0){
			for (i=0; i<this.filterSpanEls.length; i++) {
			    if ($(this.filterSpanEls[i]).firstDescendant().value != '') {
			    	isFilter = true;
					break;
			    }
			}
		}

		$("limiterTxt")[isFilter ? "show" : "hide"]();
	}
});

Tapestry.Initializer.selectLimitersEvent = function(spec) {
	//This is in global namespace so it can be called by SearchLimitersCheckboxGroup.js
	window.selectLimitersEvent = new SelectLimitersEvent(spec);
};
/* /assets/r20131.3.2-4/app/components/EmailItem.js */;
function showEmailItemMessageOverlayForMultipleItems(msg1, msg2, msg3, flag, msg4){
	$('multiEmailMsg').innerHTML = msg1;
	$('noteLabel').innerHTML = msg2;
	$('noteText').innerHTML = msg3;
	Overlay.box.showOverlay('multipleItemsMsgOverlay');
	if(flag == 'true'){
		$('alertNote').innerHTML = msg4 ;
		$('noteText').innerHTML = '*' + msg3 ;
	}else{
		$('noteText').innerHTML = msg3 ;
	}
}
function showEmailItemMessageOverlay(msg) {
	$('emailMsg').innerHTML = msg;
	Overlay.box.showOverlay('emailMsgOverlay');
}

function showTooManyItemsMessageOverlay(msg) {
	$('tooManyItemsMsg').innerHTML = msg;
	Overlay.box.showOverlay('tooManyItemsMsgOverlay');
}

function showEmailOverlay(fromCiteThis,title, num, subject) {	
	if(fromCiteThis == 'CiteThis'){
		document.getElementById('emailFields').style.display = 'none';
		document.getElementById('emailFormat').style.display = 'none';
		document.getElementById('fileFormat').style.display = 'block';
		document.getElementById('subject').value = 'My ProQuest citation list'; 
	}else{
		document.getElementById('emailFields').style.display = 'block';
		document.getElementById('emailFormat').style.display = 'block';
		document.getElementById('fileFormat').style.display = 'none';
		document.getElementById('subject').value = subject;
	}
	if(num > 0){
		document.getElementById('email_cont').style.display = 'block';
	}else{
		document.getElementById('email_cont').style.display = 'none';
	}
	document.getElementById('valueOfCite').value=fromCiteThis;	
	$('emailTitle').innerHTML = title;	
	Overlay.box.showOverlay('emailOverlay');
}

function onChangeEmailInclude(selectedFormat, clientId){ 	
    if(selectedFormat.value=='ORIGINAL_FILE') 
    	$('emailtip'+clientId).show();
   else
    	$('emailtip'+clientId).hide();  
}



function openPdf(){
	if ($('pdfdivembed') && $('pdfdivembed').visible() == false)
		$('pdfdivembed').show();
}

Tapestry.Validator.pqemailseparator = function(field, message) {
	field.addValidator(function(value){
		if(!Tapestry.Validator.pqemailseparator.validate(value)) throw message;
	});
}

Tapestry.Validator.pqemailseparator.validate = function(emailStr) {
	if(emailStr.length == 0) {
		return true;
	}
	else {
		if(emailStr.indexOf(" ") != -1)return false;
	}
	return true;
}



function toggleVideoFormats(display) {
	videoFormatsDiv = $('videoFormats');
	if(videoFormatsDiv) {
		if(display == 'hide') videoFormatsDiv.hide();
		else videoFormatsDiv.show();
	}
}

function setImageIndex()
{
	if	($('imageIndex') && $$('.pageIndex') && $$('.pageIndex').length>0)
	{
		$('imageIndex').value = $$('.pageIndex')[0].value;
		if ($('imageIndex').value == "0")
		{
			$('imageIndex').value = "1";
		}
	}
	else if ($('imageIndex') && $$('.currentPage') && $$('.currentPage').length>0)
	{
		$('imageIndex').value = $$('.currentPage')[0].value;
		if ($('imageIndex').value == "0")
		{
			$('imageIndex').value = "1";
		}
	}
	
	if($('pageViewRange') != null){//input field in Flash
		$('imageIndex').value = $('pageViewRange').value;
	}
	return true;
}
/* /assets/r20131.3.2-4/app/components/PreviewOptionsBar.js */;
//empty.
/* /assets/r20131.3.2-4/app/components/FieldBrowseIndex.js */;

var FieldBrowseIndex = Class.create({
	initialize: function(spec) {
		
		this.selectedTerms = $H();
		this.fieldLabel = spec.fieldLabel;
		this.indexSearchTermFieldId = spec.indexSearchTermField;
		this.browseIndexJavascriptID =spec.browseIndexJavascriptID;
		if (spec.selectedTerms) {
			for(var i=0; i<spec.selectedTerms.length; i++) {
				this.selectedTerms.set(spec.selectedTerms[i], 1);
			}
			this.setupTerms();
		}
			
		FieldBrowseIndex.topListVisible = false;
		FieldBrowseIndex.bottomListVisible = false;
		
		document.observe('pq:selectionCheckboxSuccess', this.termSelected.bindAsEventListener(this));
		document.observe('lightview:opened', this.openOverlay.bindAsEventListener(this));

	},
	
		showDiv : function(message ,selectedItems) {
				$('selectionMsg_' + this.browseIndexJavascriptID).show();
				$('selectedSubjects_' + this.browseIndexJavascriptID).innerHTML = message;
				var items = selectedItems;
				var arryItems = items.split('#');
				var item = null;
				for(var x=0;x<arryItems.length-1;x++){
					arryItems[x] = "<li>" + arryItems[x] + "</li>";
					if(item == null){
						item = arryItems[x];
					} else {
						item = item + arryItems[x];
					}
					 
				}
				$('list_'+ this.browseIndexJavascriptID).innerHTML = item;
			}
	,
	openOverlay: function(event) {
		if (!this.indexSearchTermField)
			this.indexSearchTermField = $(this.indexSearchTermFieldId) ;
		if (this.indexSearchTermField && this.indexSearchTermField.activate) {
			this.indexSearchTermField.activate();
		}
	},

	setupTerms: function() {
		var terms = this.selectedTerms.keys();
		if (terms.length == 0) {
			$$('div.selectedMessage').invoke('hide');
		} else {
			$$('div.selectedMessage').invoke('show');
			$$('div.selectedMessage').each(function(div) {
				div.setStyle({display: 'inline'});
			}, this);
		}
		
		$$('span.numSelectedTerms').each(function(div) {
			div.innerHTML = terms.length-1;
		}, this);
		
		$$('span.selectedTerms ul').each(function(div) {
			var listHtml = "";
			for(var i=0; i<terms.length-1; i++) {
				listHtml += "<li>" + terms[i] + "</li>";
			}
			div.innerHTML = listHtml;
		}, this);
	},
	
	termSelected: function(event) {
		if (event.memo.fieldLabel == this.fieldLabel) {
			if (event.memo.selected) {
				this.selectedTerms.set(event.memo.selectedTerm, 1);
			} else {
				this.selectedTerms.unset(event.memo.selectedTerm);
			}
			this.setupTerms();
		}
	}
	
});

function deferedShow(id) {
	Overlay.box.showOverlay(id);
}

function setJointType(){
	var radioButtons = $$('.radio');
	for (var i = 0; i < radioButtons.length; i ++) {
		var id = radioButtons[i].id;
		var location = id.indexOf('_');
		if(id.substring(0 , location) == 'and'){
			radioButtons[i].checked = true;
		}else if(id.substring(0 , location) == 'or'){
			radioButtons[i].checked = false;
		}
	}
}

function setCookie()
{
	var radioButtons = $$('.radio');
	for (var i = 0; i < radioButtons.length; i ++) {
		var id = radioButtons[i].id;
		var location = id.indexOf('_');
		
		if(id.substring(0 , location) == 'and' && radioButtons[i].checked == true){
			document.cookie = "joinType=AND";
		}else{	
			deleteCookie();
		}
	}
}

function deleteCookie(){
	var d = new Date();
	document.cookie = "joinType = AND;expires=" + d.toGMTString() + ";" + ";";
}

function getCookie(c_name)
{
	var nameEq = c_name + "=";
	var arr = document.cookie.split('; ');
	for(var i=0; i<arr.length; i++)
	{
		var c = arr[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEq) == 0) {
			return c.substring(nameEq.length, c.length);
		}
	}
	return null;
}

//Class methods
Object.extend(FieldBrowseIndex, {
	
	lookUpClick: function() {
		setCookie();
		
		$('browseIndexProgress').show();	
		$('indexUpdateForm').hide();		
	},

	update: function() {
		if (FieldBrowseIndex.instance) {
			FieldBrowseIndex.instance.setupTerms();
		}
	},
	
	showHideTopClicked: function(linkId, divId) {
		FieldBrowseIndex.topListVisible = !FieldBrowseIndex.topListVisible;
		if(FieldBrowseIndex.topListVisible) {
			$(divId).show();
			$(linkId).innerHTML = FieldBrowseIndex.hideLabel;
		} else {
			$(divId).hide();
			$(linkId).innerHTML = FieldBrowseIndex.viewLabel;
		}
	},

	showHideBottomClicked: function(linkId, divId) {
		FieldBrowseIndex.bottomListVisible = !FieldBrowseIndex.bottomListVisible;
		if(FieldBrowseIndex.bottomListVisible) {
			$(divId).show();
			$(linkId).innerHTML = FieldBrowseIndex.hideLabel;
		} else {
			$(divId).hide();
			$(linkId).innerHTML = FieldBrowseIndex.viewLabel ;
		}
	}/*,
	
	lookUpClick: function(event) {
		$('progress').show();	
		$('indexUpdateForm').hide();		
	}
	*/
});

Tapestry.Initializer.fieldBroweIndex = function(spec) { 
	FieldBrowseIndex.instance = new FieldBrowseIndex(spec); 
};

function insertAtCaretFBI(obj, text) {
	var start = null;
	var temp = '';
	if (obj.selectionStart >= 0) {
		start = obj.selectionStart;
		var end = obj.selectionEnd;
		if (start == obj.value.length) {
			temp = obj.value + ' ' + text;
			obj.value = temp;
			obj.focus();
			start = temp.length;
		} else {
			obj.value = obj.value.substr(0, start) + text
					+ obj.value.substr(end, obj.value.length);
			start = start + text.length;
			obj.focus();
		}
		if(document.selection){
			var range = document.selection.createRange();
			range.moveStart("character", start);
			range.select();
		}else{
			obj.setSelectionRange(start, start);
		}

	} else if (document.selection) {
		obj.focus();
		var range = document.selection.createRange();
		if (range.parentElement() != obj) {
			temp = text + ' ' + obj.value;
			obj.value = temp;
			return false;
		}
		range.text = text + ' ';
		range.select();

	} else {
		obj.value += text;
		obj.focus();
	}
}
/* /assets/r20131.3.2-4/app/components/ImageViewOptionsBar.js */;
var ImageViewOptionsBar = Class.create( {

	initialize : function(spec) {
		this.loggInStatus = spec.mrLoggedIn;
		$('addtoMR').observe('click',
				this.optionBarCheckBox.bindAsEventListener(this, spec));
		this.optionBarCheckBox(this, spec);
		
		if($('signInOverlayLink') != null){
			$('signInOverlayLink').observe('click',
			this.signInOverlayLinkCheck.bindAsEventListener(this, spec));
			//this.signInOverlayLinkCheck(this, spec);	
		}

	},
	optionBarCheckBox : function(event, spec) {
		var checkboxStatus = $('addtoMR').checked;
		var zone = $('signInZone');
		if (!spec.mrLoggedIn && checkboxStatus) {
			zone.style.display="";
		}
		else{
			zone.style.display="none";
		}

	}.bind(this),
	signInOverlayLinkCheck : function(event, spec) {
		var checkboxStatus = $('addtoMR').checked;
		if(checkboxStatus){
			$('signInLoginForm').signInDestinationPage.value = spec.signInOverlayDestPage;
			Overlay.box.showOverlay('signInFormOverlay');	
		}
	}

});

function getPageIndex() {
	var pageInputElem = $$(".pageIndex")[0];
	if (!pageInputElem && $$('input#currentPage'))
	{
		pageInputElem = $$('input#currentPage')[0];
	}
	if (pageInputElem) {
		var printLinkElem = $("printLink");
		if (printLinkElem.href.indexOf('?') == -1) {
			printLinkElem.href = printLinkElem.href + "?";
		} else {
			printLinkElem.href = printLinkElem.href + "&";
		}
		
		if($('pageViewRange') != null) {//If the user is viewing in two pages this will give two pages, else just one page.
			printLinkElem.href = printLinkElem.href + "imageId="+ $('pageViewRange').value;
		} else{
			printLinkElem.href = printLinkElem.href + "imageId="
			+ pageInputElem.value;
		}
	}
}

Tapestry.Initializer.imageViewOptionsBar = function(spec) {
	new ImageViewOptionsBar(spec);
}
/* /assets/r20131.3.2-4/app/components/PageLayoutPdf.js */;
var dragMode=false;
var obj=""
function toDragMode(what)
{
  dragMode=true;
  obj=what;
}
function startMoving(e)
{
  if(!dragMode) return false;
  obj.style.height=(e.clientY-20) + 'px';
}
function stopMoving()
{
  dragMode=false;
  obj="";
}


/* /assets/r20131.3.2-4/app/components/SimilarRecords.js */;
var SimilarRecords = Class.create(
{
	initialize: function()
	{
		this.triggerFirst = $('showMoreFirst');
		this.triggerFirst.observe('click', this.showMoreClick.bindAsEventListener(this));
		
		$$('#columnBar .b').each(function(item) { item.setStyle({bottom: '0px'}); });
	},
	
	showMoreClick: function(event) {
		this.triggerFirst.hide();
		$('showMoreSimilarRecs').show();
		
		$$('#columnBar .b').each(function(item) { item.setStyle({bottom: '0px'}); });
	}
});

Tapestry.Initializer.similarRecords = function()
{
	similarRecords = new SimilarRecords();
}
/* /assets/r20131.3.2-4/app/components/SaveAsFile.js */;
function handleReload()
{
	setTimeout("window.location.reload()", 7000);
}

var chosenFields = new Array();

function initChosenFields(fields) {
	var temp = fields;
	if (temp.length>0) {
		temp = temp.substring(1);
	}
	while (temp.indexOf(',') != -1) {
		var pos = temp.indexOf(',');
		var index = chosenFields.length;
		chosenFields[index] = temp.substring(0,pos);
		temp = temp.substring(pos+1);
	}
	if (temp != "") {
		chosenFields[chosenFields.length] = temp;
	}
	for (var i=(chosenFields.length-1); i>=0; i--) {
		var ckId = "fieldCheckbox" + String(chosenFields[i]).replace(/\s/g, "");
		if ($(ckId)) {
			$(ckId).checked = true;
		}
	}	
}

function updateChosenField(field,checked,id){
	if (checked) {
		var index=chosenFields.length;
		chosenFields[index] = field;
	} else {
		dropField(field);
	}
	renderChosenFields(id);
}

function dropField(field){
	var tempFields = new Array();
	x=0;
	for (var i=(chosenFields.length-1); i>=0; i--) {
		var o = chosenFields[i];
		if (o!=field) {
			tempFields[x] = o;
			x++;
			}
		}
	chosenFields = tempFields;	
}

function untickField(field, id){
	dropField(field);
	renderChosenFields(id);
	var checkbox = "fieldCheckbox"+field.replace(/\s/g, "");
	$(checkbox).checked=false;
}

function showCustomFieldsList(id){
	Overlay.box.changeTitle('Custom format');
	if ($('saveAsFileResultsCount')) {
		$('saveAsFileResultsCount').hide();
	}
	if ($('chosenFieldsDiv_'+ id)) {
		$('chosenFieldsDiv_'+ id).show();
		var selectedFieldCountDiv = $('selectedFieldCount_'+ id);
		if (selectedFieldCountDiv.innerHTML == '0') {
			if ($('errorButton_'+ id))
				$('errorButton_'+ id).show();
			if ($('customButton_'+ id))
				$('customButton_'+ id).hide();
			if ($('continueButtons_'+ id))
				$('continueButtons_'+ id).hide();	
		} else {
			if ($('errorButton_'+ id))
				$('errorButton_'+ id).hide();
			if ($('continueButtons_'+ id))
				$('continueButtons_'+ id).show();
			if ($('customButton_'+ id))
				$('customButton_'+ id).hide();			
		}
	}
	if ($('SaveAsFileMainPage_'+ id))
		$('SaveAsFileMainPage_'+ id).hide();	
	TINY.box.size(1,680,395);
}

function resetCustomFields(id) {
	chosenFields = new Array();
	if ($('saveAsFileResultsCount_' + id)) {
		$('saveAsFileResultsCount_' + id).show();
	}
	if ($('chosenFieldsDiv_'+ id))
		$('chosenFieldsDiv_'+ id).hide();
	if ($('SaveAsFileMainPage_'+ id))
		$('SaveAsFileMainPage_'+ id).show();
	if ($('errorButton_'+ id))
		$('errorButton_'+ id).hide();
	if ($('continueButtons_'+ id))
		$('continueButtons_'+ id).hide();
	if ($('customButton_'+ id))
		$('customButton_'+ id).show();
}

function showCustomContinueButton(id){
	if ($('customButton_'+ id))
		$('customButton_'+ id).show();
	if ($('continueButtons_'+ id))
		$('continueButtons_'+ id).hide();
}

function hideCustomContinueButton(id){
	if ($('customButton_'+ id))
		$('customButton_'+ id).hide();
	if ($('continueButtons_'+ id))
		$('continueButtons_'+ id).show();
}

function removeAll(id){
	for (var i=(chosenFields.length-1); i>=0; i--) {
		var o = chosenFields[i];
		untickField(o, id);
	}
	chosenFields = new Array();
	renderChosenFields(id);
}

function showErrorMessage(id){
	if ($('mustSelectOneError_' + id))
		$('mustSelectOneError_' + id).show();
}

function hideErrorMessage(id){
	if ($('mustSelectOneError_' + id))
		$('mustSelectOneError_' + id).hide();
}

function renderChosenFields(id) {
	chosenFields = chosenFields.sort();
	var html = "";
	var fieldList = "";
	for (var i=(chosenFields.length-1); i>=0; i--) {
		var o = chosenFields[i];
		html = "<a href=\"javascript:untickField('"+o+"', '"+ id +"')\">&#215;</a> "+o+"<br />" + html;
		fieldList = fieldList+","+o;
	}
	if (chosenFields.length>0) {
		hideErrorMessage(id);
		$('continueButtons_'+ id).show();
		$('errorButton_'+ id).hide();
	} else {
		$('continueButtons_'+ id).hide();
		$('errorButton_'+ id).show();		
	}
	$('selectedFieldCount_' + id).innerHTML = chosenFields.length;
	$('chosenFieldsList_' + id).innerHTML = html;
	$('chosenFieldsHidden_' + id).value = fieldList;
}

/* /assets/r20131.3.2-4/app/components/RelatedDocumentParts.js */;

function toggleRelDocs() {
	var relDocDiv = $('eisWrapper');
	Effect.toggle(relDocDiv, 'blind', {duration: 1.0});
	var linkText = $('linkTxt');
	if(linkText) {
		var text = linkText.innerHTML;
		linkText.innerHTML = (text == 'Show' ? 'Hide' : 'Show');
		var showHideLink = $('showHideLink');
		showHideLink.className = (showHideLink.className == 'show_less' ? 'show_all' : 'show_less');
	}
	return false;
}

/* /assets/r20131.3.2-4/app/components/SupplementalFiles.js */;
function toggleSuppFiles() {
	var suppDiv = $('showHideDiv');
	Effect.toggle(suppDiv, 'blind', {duration: 1.0});
	var linkText = $('linkTxt');
	if(linkText) {
		var text = linkText.innerHTML;
		linkText.innerHTML = (text == 'Show' ? 'Hide' : 'Show');
		var showHideLink = $('showHideLink');
		showHideLink.className = (showHideLink.className == 'show_less' ? 'show_all' : 'show_less');
	}
	return false;
}
/* /assets/r20131.3.2-4/app/components/Tagging.js */;
var Tagging = Class.create({
	
	initialize: function(spec) {
		this.isCloud = spec.isCloud;
		this.signedIn = spec.signedIn;
		this.cloudDiv = $("cloudDisplay");
		this.listDiv = $("listDisplay");
		this.displayAsCloudLink = $("tagCloudLink");
		this.displayAsListLink = $("tagListLink");
		this.displayTagsDiv = $("displayTestTagsId");
		this.indicator = $(spec.indicator);
		this.myTagsUrl = spec.myTagsUrl;
		this.destination = spec.destination;
		this.publicProfileOverlay = spec.publicProfileOverlay;
		this.addTagField = $(spec.addTagField);
		
		if (Cookies.read("addTag") != null) {
			if($('add_tags_link') && this.signedIn == 'true'){
				this.showAddTag();
			}
			if(this.signedIn == 'false'){
				Cookies.remove("addTag");
			}
		}
		
		if(this.addTagField){
			this.addTagField.observe('pq:addNewTagName', this.addNewTagName.bindAsEventListener(this));
		}
		
		if($('addtaglink')){
			$('addtaglink').observe('click', this.onClickAddTagLink.bindAsEventListener(this));
		}

		if($('mytagslink')){
			$('mytagslink').observe('click', this.onClickMyTagsLink.bindAsEventListener(this));
		}

		// Look out for signed in events - may be relevant to us
		$('signInLinkZone').observe('pq:signedIn', this.onCheckSignIn.bindAsEventListener(this));
	},
	
	addNewTagName: function(event) {
		event.stop();
		var tag = event.memo;
		
		var tagField = this.addTagField;
		if(tagField == null) {
			tagField = $('addTagDiv').down('.SearchWithinSearch');
		}
		if(tagField == null) return;
		var currentValue = tagField.value;
		var tags = currentValue.split(",");
		var duplicateFound = false;
		for(i = 0; i < tags.length; i++) {
			var t = tags[i];
			if(t.trim() == tag.trim()) duplicateFound = true;
		}
		if(duplicateFound) {
			var msgOverlay = $('profTagMsgOverlay');
			msgOverlay.innerHTML = '<br><br>You have already added the tag <font color="red">' + tag + '</font>';
			Overlay.box.showOverlay('profTagMsgOverlay');
			return;
		}
		if(currentValue == '') {
			tagField.value = tag;
		}
		else {
			var temp = currentValue.trim();
			if(temp.substring(temp.length - 1) == ',') {
				tagField.value = currentValue + tag;
			}
			else {
				tagField.value = currentValue + "," + tag;
			}
		}
	},
	
	onClickAddTagLink: function(event) {
		if (this.signedIn == 'true') {
			// Do nothing
		}
		else {
			event.stop();
			$('signInLinkZone').fire('pq:signInNoRefresh', this.destination);			
		}
	},

	onClickMyTagsLink: function(event) {
		if (this.signedIn == 'true') {
		}
		else {
			event.stop();
			$('signInLinkZone').fire('pq:signInNoRefresh', this.destination);			
		}
	},
	
	showAddTag: function() {
		$('add_tags_link').hide();
		Effect.toggle('tags_interaction_std', 'blind', {duration: 0.5});
		if(document.getElementById('addTagField') != null) {
			setTimeout("document.getElementById('addTagField').focus()",501);
		}
	},
	
	onCheckSignIn: function(event) {
		if(navigator.userAgent.indexOf("Safari") != -1){
			window.location.reload();
			return;
		}
		this.signedIn = 'true';
		$('tagRefreshForm').request({
			onComplete: function(t) {
				var zoneManager = Tapestry.findZoneManager('tagRefreshForm');
				if (!zoneManager) {
					return;
				}
				zoneManager.processReply(t.responseJSON);
	
				if (event.memo == 'tagging') {
					this.showAddTag();
				}
			}
		});
		
		if(event.memo == 'tagging2'){
			window.location= this.myTagsUrl;
		}
	},
    
	onCloudClick: function(theEvent) {
		theEvent.stop();
		this.cloudDiv.show();
		this.listDiv.hide();
		this.displayAsCloudLink.hide();
		this.displayAsListLink.show();
	},
	
	onListClick: function(theEvent) {
		theEvent.stop();
		this.cloudDiv.hide();
		this.listDiv.show();
		this.displayAsCloudLink.show();
		this.displayAsListLink.hide();
	}
	
});

Tapestry.Initializer.tagging = function(spec) {
	new Tagging(spec);
}

function clearForm(){
	if(document.getElementById('addTagField') != null) {
	  document.getElementById("addTagField").value = '';
	}
}

function handleAcceptedTag(){
	var node = document.getElementById("allowTags");
	var copyNode = $('blockedWordOverlay').down('.copyAllowTagsClass');
	copyNode.innerHTML = node.innerHTML;
	copyNode.innerHTML = copyNode.innerHTML.replace("[","");
	copyNode.innerHTML = copyNode.innerHTML.replace("]","");			        
	var str = copyNode.innerHTML.split(",");
	var part_num=0;		
	var org_str = '';
	while(part_num < str.length)
	{
		org_str = org_str+str[part_num]+'<br />';
		part_num+=1;
	}
	copyNode.innerHTML = org_str;
	$('allowedTagMsg').show();
	if(str.length == 1 && (str[0].length == 0 || str[0].length == 1)) {
		$('allowedTagMsg').hide();
	}
}

function showAllProfileTags() {
	var moreProfileTagsDiv = document.getElementById('moreProfileTags');
	if(moreProfileTagsDiv) {		
		moreProfileTagsDiv.style.display = 'inline';
	}
	var showAllDiv = document.getElementById('showAllDiv');
	if(showAllDiv) {
		showAllDiv.style.display = 'none';
	}
}

function showLessProfileTags() {
	var moreProfileTagsDiv = document.getElementById('moreProfileTags');
	if(moreProfileTagsDiv) {		
		moreProfileTagsDiv.style.display = 'none';
	}
	var showAllDiv = document.getElementById('showAllDiv');
	if(showAllDiv) {
		showAllDiv.style.display = 'inline';
	}
}


function showInvalidTagsOverlay(invalidTags) {
	invalidTags = invalidTags.replace(/&amp;/g, "&");
	if($('invalidTagsOverlay')) {
		Overlay.box.showOverlay('invalidTagsOverlay');
	  }
	 if(invalidTags && document.getElementsByName('fixTagField')[0]) {
		var fixTagField = document.getElementsByName('fixTagField')[0];
		if(fixTagField.value != '') {
			fixTagField.value = '';
		}
		fixTagField.value = invalidTags;
	  }
}
function tagHandler(){
	Overlay.box.hideOverlay();
	$('addTagForm').request({
		onComplete: function(t) {
			var zoneManager = Tapestry.findZoneManager('addTagForm');
			if (!zoneManager) {
				return;
			}
			zoneManager.processReply(t.responseJSON);
		}
	});	
}

           


/* /assets/r20131.3.2-4/app/components/WhoTagged.js */;
var WhoTagged = Class.create({
	initialize: function(spec) {
	this.whoTaggedLinkID = spec.whoTaggedLinkID;
	$(this.whoTaggedLinkID).observe('click', this.trigger.bindAsEventListener(this));
},
	
trigger: function(event) {
	Overlay.box.showOverlay('whoTaggedOverlay');
	if( $('progress') != null ){
		$('progress').show() ;
	}
}

});

var whotagged;
Tapestry.Initializer.whotagged = function(spec) { 
	whotagged = new WhoTagged(spec); 
};
/* /assets/r20131.3.2-4/app/components/ExternalLink.js */;

var ExternalLink = Class.create({
	initialize: function(spec) {
		this.linkTarget = spec.linkTarget;
		this.linkTargetTitle = spec.linkTargetTitle;
		this.clientId = spec.clientId;
		this.linkItem = $(this.clientId);
		this.linkItem.observe('click', this.openwindow.bindAsEventListener(this));
	},

	openwindow: function(event) {
		Event.stop(event);
		window.open(this.linkTarget, this.linkTargetTitle, "location=0,toolbar=no,status=yes,scrollbar=yes,navigationbar=no");
	}

});


Tapestry.Initializer.externalLink = function(spec) { 
	new ExternalLink(spec); 
};


function getIdlWin(url,title)
{
	var newWindow=window.open("", "mywindow", "width=690,height=600,toolbars=no,menubar=no,location=no,scrollbars=yes,resizable=yes,status=yes");
	var tmp = newWindow.document;
	tmp.write('<html><head><title>'+title+'</title>');
	tmp.write('<link type="text/css" rel="stylesheet" href="http://'+  document.location.host + '/styles/PageLayout.css" />');
	tmp.write('<style type="text/css">body, #container {background: white; } iframe{border: none;}</style>');
	tmp.write('</head><body>');
	
	tmp.write('<div id="container" class="fullscreen">');
	tmp.write('<div><a href="javascript:self.opener.getIdlWin(\'' + url + '\',\''+title+'\');">&lt;&lt; Company Report</a></div>');
	tmp.write('<div><iframe id="myframe" src= "'+url+'" width="670" height="550" /></div>');
	
	tmp.write('</div>');
	
	tmp.write('</body></html>');
	tmp.close();
}

/* /assets/r20131.3.2-4/app/components/RefWorksDocExport.js */;
var RefWorksDocExport = Class.create(
{	
	initialize: function(config) {
		this.selectReferenceStyleEventURL = config.selectReferenceStyleEventURL;
		this.selectId = config.selectId;
		this.zoneId = config.zoneId;
		this.exportFormID = config.ExportFormID;
		this.continueId = config.continueId;
		this.uniqueItemId = config.uniqueItemId;
		this.refWorksLogEventURL = config.refWorksLogEventURL;
		this.isCheckBox = config.isCheckBox;
		this.isDialog= config.isDialog;
		this.fulltext = config.fulltext;
		this.briefCitation = config.briefCitation;
		this.resultsList = config.resultsList;
		this.citation = config.citation;
		this.Abstract = config.Abstract;
		this.briefCitationAbstract = config.briefCitationAbstract;
		this.deselectChBoxId = config.deselectChBoxId;
		this.exportStyle=config.exportStyle;

		$(config.selectId).observe('change', this.setReferenceStyle.bindAsEventListener(this));
		if (config.isTransactional == false) {
			$(config.continueId).observe('click', this.refWorksLogEvent.bindAsEventListener(this));
		}
		if (config.isDialog == true) {
			$(config.includeSelectId).observe('change', this.setIncludeStyle.bindAsEventListener(this));
			this.includeSelect = $(config.includeSelectId);
			if(this.includeSelect.value == "RESULT" || config.isTransactional == false){
				$('submitWithAjax').hide();
				$('submitWithOutAjax').show();			
			}
	
			if (this.includeSelect.value == 'FULL_TEXT') {
				$('refIncludeMessage').show();
			}
		}

	},

	setReferenceStyle: function(event) {
		var zoneObject = Tapestry.findZoneManagerForZone(this.zoneId);
		zoneObject.updateFromURL(this.selectReferenceStyleEventURL, {style:selectedReference});
	},
	
	handleReload:function()
	{
		setTimeout("window.location.reload()", 10000);
	}
	,
	handleReloadforRefWorks:function()
	{
		setTimeout("window.location.reload()", 10000);
	}
	,
	setIncludeStyle: function(event) {
		var selected = this.includeSelect.value;
		if (selected == "FULL_TEXT") {
			$('refIncludeMessage').show();
		} else {
			$('refIncludeMessage').hide();
		}
	},
	refWorksSubmitEvent:function()
	{
			this.refWorksLogEvent(this);
			return true;
	}
	,
	refWorksLogEvent: function(event) {
		if($(this.selectId).value == "RefWorks"){
			var styleValue = "";
			if ($(this.includeSelect) != null){
				styleValue = $(this.includeSelect).options[$(this.includeSelect).selectedIndex].value;
			}
			var deSelect = false;
			if ($(this.deselectChBoxId) != null) {
				deSelect = $(this.deselectChBoxId).checked;
			}
			new Ajax.Request(this.refWorksLogEventURL, {
				method: 'post',
				parameters: { 'uniqueItemId' : this.uniqueItemId , 
					'includeExportStyle' : styleValue,
					'deSelect' : deSelect}
			});
			testIfCheckBox(this.isCheckBox);
		} else {
			//$(this.exportFormID).submit();
			setTimeout("Overlay.box.hideOverlay();",1000);
			if(this.exportStyle == "RefWorks"){
				this.handleReloadforRefWorks();
			}
			else{
				this.handleReload();
			}
			
		}
	}
});

Tapestry.Initializer.refWorksDocExport = function(spec)
{
	refWorksDocExport =new RefWorksDocExport(spec);
};

var selectedReference = "";
function updateField(value)
{
	selectedReference = value;
}


function hideLearnMoreOverlayExport() {
	Overlay.box.showOverlay('learnMoreOverlayExport');
}

function loadPage(){
	setTimeout("window.location.reload()", 10000);
}

function closeRefWorksExportOverlay() {
	Event.stopObserving(window, 'beforeunload');
	setTimeout("Overlay.box.hideOverlay();",2000);
}

function testIfCheckBox(isCheckBox){
	if(isCheckBox == true){
		submitedFromLink();
	}
}

function onChangeRefworks(obj, includeStyle) {
	obj.value = includeStyle;
}
/* /assets/r20131.3.2-4/app/components/RightToLeftInformation.js */;
var RightToLeftInformation = Class.create(
{
	initialize: function(spec)
	{
		this.overlayId = spec.overlayId;
		setTimeout(this.showOverlay.bind(this), 400);
	},
	
	showOverlay: function() {
		Overlay.box.showOverlay( this.overlayId );
	},
	setDoNotAsk: function() {
		if ($('arabicBrowserInfoForm').arabicChkResults.checked) {
			var exp=new Date();
			var numdays=7;
			exp.setTime(exp.getTime()+(1000*60*60*24*numdays)) ;
			document.cookie='donotremindarabic=yes; expires='+exp.toGMTString();
		} else {
			document.cookie='donotremindarabic=yes;';
		}
		
		Overlay.box.hideOverlay();
	}

});


var rightToLeftInformation;

Tapestry.Initializer.rightToLeftInformation = function(spec)
{
	rightToLeftInformation = new RightToLeftInformation(spec);

};

/* /assets/r20131.3.2-4/app/components/AddThis.js */;
var AddThis = Class
		.create({

			initialize : function(spec) {
				this.documentURL = spec.documentURL;
				this.escapedTitle = spec.escapedTitle;
				
				var addthis_target = $('addthis_target');

				var script_share = document.createElement('script');
				script_share.type = 'text/javascript';
				script_share.text = 'var addthis_share = {url: "'
						+ this.documentURL + '", title: "' + this.escapedTitle
						+ '"};' + 'var addthis_config = {ui_click: ' + true
						+ '}';
				addthis_target.appendChild(script_share);

				var script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = 'http://s7.addthis.com/js/250/addthis_widget.js#username=xa-4c740f6b0c567ec9';
				addthis_target.appendChild(script);
				
				Event.observe('addthis_target', 'click', this.regiterAndHidePdf.bindAsEventListener(this));
				},
				
			regiterAndHidePdf: function(event) {
	          Event.stop(event);
	          if(addthis) {
	        	  Event.observe(addthis, 'addthis.menu.close', this.fireShowPdf.bindAsEventListener(this));
	          }
	          $('addthis_target').fire('pq:hidePdf');
	          return false;
			},
			
			fireShowPdf: function(event) {
			 $('addthis_target').fire('pq:showPdf');
		     return false;
			}
		});

Tapestry.Initializer.addThis = function(spec) {
	addThis = new AddThis(spec);
};
/* /assets/r20131.3.2-4/app/components/SearchWithIndexTerms.js */;

function toggleIndexSearchTerms() {
	var indexSearchTerms = $('indexSearchTerms');
	if(indexSearchTerms) {
		Effect.toggle(indexSearchTerms, 'Blind', {duration:1});
		var indexSearchTermsLink = $('indexSearchTermsLink');
		toggleSectionIndicator(indexSearchTermsLink);
		toggleSection('similarRecs', 'showMoreSimilarRecs');
	}
	return false;
}

function toggleSimilarRecs() {
	var similarRecs = $('similarRecs');
	if(similarRecs) {
		Effect.toggle(similarRecs, 'Blind', {duration:1});
		var showMoreSimilarRecs = $('showMoreSimilarRecs');
		toggleSectionIndicator(showMoreSimilarRecs);
		toggleSection('indexSearchTerms','indexSearchTermsLink');
	}
	return false;
}

function toggleIndexSearchTermsIfVisible() {
	var indexSearchTerms = $('indexSearchTerms');
	if(indexSearchTerms && isVisible(indexSearchTerms)) {
		indexSearchTerms.toggle();
		var indexSearchTermsLink = $('indexSearchTermsLink');
		toggleSectionIndicator(indexSearchTermsLink);
	}
}

function toggleSection(section, sectionLink) {
	var sectionElem = $(section);
	if(sectionElem) {
		if(isVisible(sectionElem)) {
			Effect.toggle(sectionElem, 'Blind', {duration:1});
			var showMoreSimilarRecs = $(sectionLink);
			if(showMoreSimilarRecs) {
				toggleSectionIndicator(showMoreSimilarRecs);
			}
		}
	}
}

function isVisible(element) {
	if(element) {
		return(element.style.display != 'none');
	}
	return false;
}

function toggleSectionIndicator(element) {
	if(element) {
		element.toggleClassName('indicator_menu_left');
		element.toggleClassName('indicator_menu_down_left');
	}
}

// Function that reads the user selections on the document view search with index terms form and 
// applies those to the overlay.

function applySelectionsToOverlay() {
	var selections = getUserSelections();
	if(!selections.blank()) {
		var elem = $('overlayListMarker');
		var liArray = elem.nextSiblings();
		for(var i = 0; i < liArray.length; i++) {
			var e = liArray[i];
			var subHeader = getSubHeader(e, true);
			subHeader = subHeader.replace("|", "").trim();
			if(!subHeader.blank()) {
				var selectionArray = getSelectionsForSubHeader(subHeader, selections);
				var cbArray = e.nextSiblings();
				for(var j = 0; j < selectionArray.length; j++) {
					var selected = selectionArray[j];
					var cb = cbArray[j];
					if(cb) {
						var fChild = cb.firstChild;
						if(fChild && fChild.nodeName == 'INPUT') {
							if(selected == '1') {
								fChild.checked = true;
							}
							else if(selected == '0') {
								fChild.checked = false;
							}
						}
					}
				}
			}
		}
	}
}

function getSelectionsForSubHeader(subHeader, selections) {
	if(subHeader.blank() || selections.blank()) return;
	if(selections.indexOf(subHeader) != -1) {
		var arr = selections.split("|");
		for(var i = 0; i < arr.length; i++) {
			var fieldAndOptions = arr[i];
			if(!fieldAndOptions.blank()) {
				var fldArr = fieldAndOptions.split(":");
				var field = fldArr[0];
				if(field == subHeader) {
					var options = fldArr[1];
					var optArray = options.split(",");
					return optArray;
				}
			}
		}
	}
}

function getUserSelections() {
	var st = "";
	var elem = $$('li.indexFieldSubHeader')[0];
	if(elem) {
		st += getSubHeader(elem, false);
		var arr = elem.nextSiblings();
		for(var i =0; i < arr.length; i++) {
			var e = arr[i];
			if(e && e.nodeName == 'LI') {
				var fChild = e.firstChild;
				if(fChild && fChild.nodeName == 'INPUT') {
					if(st.length > 0  &&  !st.endsWith(":")) st+= ",";
					st+= fChild.checked ? "1" : "0";
				}
				else {
					st += getSubHeader(e);
				}
			}
		}
		return st;
	}
}

// SubHeader: index field name.
function getSubHeader(elem, withOutDelimiters) {
	if(elem) {
		var chld = elem.firstChild;
		if(chld && chld.nodeName == 'STRONG') {
			var txt = chld.innerHTML;
			if(!txt.blank()) {
				if(withOutDelimiters) {
					return txt;
				}
				else {
					return "|" + txt + ":";
				}
			}
		}
	}
	return "";
}
/* /assets/r20131.3.2-4/app/components/ItemInSharedList.js */;
var ItemInSharedList = Class.create(
{
	initialize: function()
	{
		this.arrow=$('similarRecordsInSharedListArrow');
		if ($('show_all_similar_sharedlists_recs') != null) {
			this.showLink=$('show_all_similar_sharedlists_recs');
			this.showLink.observe('click', this.clickLink.bindAsEventListener(this));
			this.arrow.observe('click', this.clickArrow.bindAsEventListener(this));
		} else {
			this.arrow.toggleClassName("off");
			this.arrow.toggleClassName("");
		}
	},
	
	clickLink: function(event) {
		this.showLink.hide();
		$$('li.simRecsSharedList').each(function(s){s.show();});
		this.arrow.toggleClassName("off");
		this.arrow.toggleClassName("on");
	},
		
	clickArrow: function(event) {
		this.arrow.toggleClassName("off");
		this.arrow.toggleClassName("on");
		if (this.arrow.hasClassName("off")) {
			this.showLink.show();			
		}
		if (this.arrow.hasClassName("on")) {
			this.showLink.hide();
		}
		if (this.arrow.hasClassName("on")) {
			$$('li.simRecsSharedList').each(function(s){s.show();});
		} else {
			$$('li.simRecsSharedList').each(function(s,index){
				if (index == 0) {				
					s.show();
				} else {								
					s.hide();
				}
			});	
		}
	}
});

Tapestry.Initializer.itemInSharedList = function()
{
	itemInSharedList = new ItemInSharedList();
}
/* /assets/r20131.3.2-4/app/components/alertrss/AlertRss.js */;

Tapestry.Validator.pqemailseparator = function(field, message) {
	field.addValidator(function(value){
		if(!Tapestry.Validator.pqemailseparator.validate(value)) throw message;
	});
}

Tapestry.Validator.pqemailseparator.validate = function(emailStr) {
	if(emailStr.length == 0) {
		return true;
	}
	else {
		if(emailStr.indexOf(",") != -1) return false;
	}
	return true;
}

function numberRangeCheck(obj)
{
	var len=250;
	var length = obj.value.length;
	if (length > len) {
		obj.value = obj.value.substring(0, len);
	} 
}
/* /assets/r20131.3.2-4/app/components/alertrss/SearchEmailAlertLinks.js */;
var SearchEmailAlertLinks = Class.create({
	
	initialize: function(spec) {
		this.params = spec;
	},
	
	openOverlay: function(spec) {
		$('signInLinkZone').fire('pq:createAlert', this.params);
	}
	
});


Tapestry.Initializer.searchEmailAlertLinks = function(spec) {

	var searchEmailAlertLinks = new SearchEmailAlertLinks(spec);
	searchEmailAlertLinks.openOverlay(spec);
	
};

/* /assets/r20131.3.2-4/app/components/alertrss/SearchEmailAlertCreateDialog.js */;
document.createElement("footer"); //IE CSS fix or footer element.

var searchEmailAlertCreateDialog = {
	initialize: function() {
		isPatentsAlert = false; //PQ-9840; property set to hide custom option for patents; set in TML
	},
	//PQ-3483: select alert name when create alert dialog opens.
	// Note: we have to wait for the form to come into view before this works. Hence the timeout.
	selectAlertNameField: function(){
		if (document.alertDeliveryDetailsForm && document.alertDeliveryDetailsForm.alertName){
			setTimeout(function(){
				try {
					document.alertDeliveryDetailsForm.alertName.focus();
					document.alertDeliveryDetailsForm.alertName.select();
				} catch(e) { /* Expect errors in IE 8 and under. */}
			}, 1000);
		}
	},

	checkMultiAddrField: function (selectedElement) {
		this.clientId = pqUtil.getClientId(selectedElement);
		var multiAddrField = $('multipleEmailAddressField'+this.clientId);
		var deliverCheck = $('emailDeliveryMultiple' + this.clientId);
		multiAddrField.disabled = !deliverCheck.checked && !pqUtil.isInputEmpty(multiAddrField);
	},

	checkMultiDeliveryFlag: function(selectedElement) {
		this.clientId = pqUtil.getClientId(selectedElement);
		var multiAddrField = $('multipleEmailAddressField'+this.clientId);
		var deliverCheck = $('emailDeliveryMultiple' + this.clientId);
		deliverCheck.checked = !pqUtil.isInputEmpty(multiAddrField);
	},

	showHitHighlight: function(obj, id) {
		var exportAsText = document.getElementById('textExport').checked;
		var sendAs = document.getElementById('sendAs');
		var divId = 'hithilight_' + id;
		if (exportAsText) {
			sendAs.value = 'text';
			$(divId).show();
		} else {
			sendAs.value = 'html';
			$(divId).show();
		}
	},

	frequencySelection: function(selectedFrequency, zoneId) {
		var everyFourHours = $('everyFourHours_' + zoneId);
		var daily = $('daily_' + zoneId);
		var weekly = $('weekly_' + zoneId);
		var monthly = $('monthly_'+ zoneId);

		switch (selectedFrequency.value){
			case 'EveryFourHours':
				if (everyFourHours) { everyFourHours.show(); }
				if (daily) { daily.hide(); }
				if (weekly) { weekly.hide(); }
				if (monthly) { monthly.hide(); }
				break;
			case 'Daily':
				if (everyFourHours) { everyFourHours.hide(); }
				if (daily) { daily.show(); }
				if (weekly) { weekly.hide(); }
				if (monthly) { monthly.hide(); }
				break;
			case 'Weekly':
				if (everyFourHours) { everyFourHours.hide(); }
				if (daily) { daily.show(); }
				if (weekly) { weekly.show(); }
				if (monthly) { monthly.hide(); }
				break;
			case 'Monthly':
				if (everyFourHours) { everyFourHours.hide(); }
				if (daily) { daily.show(); }
				if (weekly) { weekly.hide(); }
				if (monthly) { monthly.show(); }
				break;
			default:
				if (everyFourHours) { everyFourHours.hide(); }
				if (daily) { daily.hide(); }
				if (weekly) { weekly.hide(); }
				if (monthly) { monthly.hide(); }
		}
	},

	fullTextOnly: function() {
		
		var documentDetails = $$('select[name=documentDetails]');
		if (documentDetails.length === 0) { return; }
		documentDetails = documentDetails[0];
		for (var i=0,l=documentDetails.options.length; i<l; ++i) {
			if ('FULL_TEXT' === documentDetails.options[i].value) {
				documentDetails.selectedIndex = i;
				break;
			}
		}
		documentDetails.disabled = true;
		$$('label.includeFamilyInformation').addClassName("includeFamilyInformation-sendAs-isXml");
		$('preferencesStep').addClassName("sendAs-isXml");
	},

	freeSelectContent: function() {
		var documentDetails = $$('select[name=documentDetails]');
		if (documentDetails.length === 0) { return; }
		documentDetails[0].disabled = false;
		$('preferencesStep').removeClassName("sendAs-isXml");
		$$('label.includeFamilyInformation').removeClassName("includeFamilyInformation-sendAs-isXml");
	},

	onChangeSendAs: function(selectedFormatEl, zoneId) {
		var selectedFormat = selectedFormatEl.value.toLowerCase();
		if (selectedFormat == 'xml2_0') {
			this.fullTextOnly();
		} else {
			this.freeSelectContent();
		}
		if (selectedFormat == 'xml') {
			$('obsoleteXml_' + zoneId).show();
		} else {
			$('obsoleteXml_' + zoneId).hide();
		}
		switch (selectedFormat) {
			case 'html':
				$('hithilight_' + zoneId).show();
				searchEmailAlertCreateDialog.provideCustomDisplayFormatOption(true);
				break;
			case 'pdf':
			case 'rtf':
			case 'text':
				$('hithilight_' + zoneId).hide();
				searchEmailAlertCreateDialog.provideCustomDisplayFormatOption(true);
				break;
			default:
				$('hithilight_' + zoneId).hide();
				searchEmailAlertCreateDialog.provideCustomDisplayFormatOption(false);
		}
		searchEmailAlertCreateDialog.updateFieldNames($$('select[name=documentDetails]')[0]);
	},

	updateFieldNames: function(el) {
		if (!el) { el = $$('select[name=documentDetails]')[0]; }
		if ($(el).value.toLowerCase() === 'custom') {
			$$(".alertsBlock").addClassName("custom");
		} else {
			$$(".alertsBlock").removeClassName("custom");
		}
	},

	// PQ-5377: Add or remove the "Custom" option from the "Display Format" menu.
	provideCustomDisplayFormatOption: function(includeCustom){
		var alertPreferencesForm = $$('form[id^=alertPreferencesForm]');
		if (alertPreferencesForm.length === 0) { return; }
		alertPreferencesForm = alertPreferencesForm[0];
		var displayFormatEl = alertPreferencesForm.documentDetails;
		var options = displayFormatEl.options;
		var hasCustom = false;
		for (var i= 0,l=options.length; i<l; i++){
			if (options[i].text == 'Custom') {
				if (includeCustom){
					hasCustom = true;
				} else {
					displayFormatEl.remove(i);
				}
				break;
			}
		}
		if (!this.isPatentsAlert && includeCustom && !hasCustom) {
			var customOption = document.createElement('option');
			customOption.value = 'custom';
			customOption.text = 'Custom';
			displayFormatEl.add(customOption);
		}
	},

	/* Controls behavior of Include <select> */
	onChangeInclude: function(selectMenu, zoneId){
		var clientId = pqUtil.getClientId(selectMenu);
		if (selectMenu.value == 'Newly_added_documents_and_updated_documents'){
			$('selectFieldsWrapper_' + zoneId).addClassName("opened");
			$('patentsAnyField'+ clientId).value = 'patentsAnyField';
		} else {
			$('selectFieldsWrapper_' + zoneId).removeClassName("opened");
		}
		var radios = selectMenu.form.select('[name=radiogroup]');
		for (var i=0,l=radios.length; i<l; ++i){
			if (radios[i].checked) { this.enablePatentsFieldsSelection(radios[i]); }
		}
	},

	toggleAlertTip: function(alerthelptip, pricinghelptip) {
		if (alerthelptip != null) { alerthelptip.show(); }
		if (pricinghelptip != null) { pricinghelptip.hide(); }
	},

	togglePricingTip: function(alerthelptip, pricinghelptip) {
		if (alerthelptip != null) { alerthelptip.hide(); }
		if (pricinghelptip != null) { pricinghelptip.show(); }
	},

	showDeliveryMethod: function(ctrlSelected, zoneId) {
		var selected;
		if (typeof ctrlSelected != 'string') {
			selected = ctrlSelected.value;
		} else {
			selected = ctrlSelected;
		}

		var emailDelivery = $('emailDelivery_' + zoneId);
		var ftpDelivery = $('ftpDelivery_' + zoneId);
		if (selected == 'email') {
			if (emailDelivery) { emailDelivery.show(); }
			if (ftpDelivery) { ftpDelivery.hide(); }
		} else if (selected == 'ftp') {
			if (ftpDelivery) { ftpDelivery.show(); }
			if (emailDelivery) { emailDelivery.hide(); }
		} else {
			if (emailDelivery) { emailDelivery.show(); }
			if (ftpDelivery) { ftpDelivery.hide(); }
		}
	},

	/*
	 Handle event for enabling field selection.
	 */
	enablePatentsFieldsSelection: function(fieldsSelection){
		var overlay = $(fieldsSelection.form);
		var selectFieldsWrapper = overlay.select(".dySrchLimiter")[0];
		var checkboxes = selectFieldsWrapper.select("[type=checkbox]");
		var patentFieldsSelected = fieldsSelection.value === 'patentsSelectedField';
		selectFieldsWrapper[patentFieldsSelected ? "addClassName" : "removeClassName"]("fieldLevelAlerts");
		checkboxes.each(function(el){
			el.disabled = !patentFieldsSelected;
		});
	},


	/*
	 Clear session functions
	 */

	//clearSearchSetsFromSessionUrl comes from the TML
	clearSavedSearchSetsFromSession: function() {
		if (searchEmailAlertCreateDialog.overlayEventsActive){
			Tapestry.ajaxRequest(searchEmailAlertCreateDialog.clearSearchSetsFromSessionUrl);
			searchEmailAlertCreateDialog.overlayEventsActive = false;
		}
	},

	//clearSessionOnEsc is attached to the esc key to clear the modify alert session state.
	clearSessionOnEsc: function(evt){
		if (evt.keyCode == 27 && searchEmailAlertCreateDialog.overlayEventsActive){
			searchEmailAlertCreateDialog.clearSavedSearchSetsFromSession();
		}
	},

	//Attach click event to overlay close icon.
	attachCloseOverlayEvents: function(){
		if (!searchEmailAlertCreateDialog.overlayEventsAttached || !searchEmailAlertCreateDialog.overlayEventsActive){
			var overlayClose = $$(".tbox .tclose");
			if (overlayClose.length > 0){
				clearInterval(searchEmailAlertCreateDialog.closeOverlayEventAttachInterval);
				$(document.body).observe("keyup", searchEmailAlertCreateDialog.clearSessionOnEsc);
				overlayClose[0].observe('click', function() { searchEmailAlertCreateDialog.clearSavedSearchSetsFromSession(); });
				searchEmailAlertCreateDialog.overlayEventsAttached = true;
				searchEmailAlertCreateDialog.overlayEventsActive = true;
			}
		}
	},

	//Attach events when overlay opens.
	initializeCloseOverlayEvents: function(){
		searchEmailAlertCreateDialog.closeOverlayEventAttachInterval = setInterval(
			function() { searchEmailAlertCreateDialog.attachCloseOverlayEvents(); }
			,100
		);
	}
};

/* /assets/r20131.3.2-4/app/components/alertrss/SearchEmailAlertCreate.js */;
var SearchEmailAlertCreate = Class.create({
	initialize : function(spec) {
	},

	showHitHighlight : function(obj, id) {
		var exportAsText = document.getElementById('textExport').checked;
		var divId = 'hithilight_' + id;
		if (exportAsText) {
			$(divId).hide();
		} else {
			$(divId).show();
		}
	}

});

var searchAlert;
Tapestry.Initializer.searchAlert = function(spec) {
	searchAlert = new SearchEmailAlertCreate(spec);
};

function disableCreateButton(createButtonId) {
	$(createButtonId).writeAttribute('disabled', 'disabled');
	$(createButtonId).removeClassName('btnNew btnSelectedBG');
	$(createButtonId).addClassName('btnDisabled');
	return true;
}

function onChangeFrequency(id, zoneId) {
	if (id.value == 'Weekly' && id.checked)
		$('weekly_' + zoneId).show();
	else
		$('weekly_' + zoneId).hide();
}

/* /assets/r20131.3.2-4/app/components/citation/CiteThis.js */;
var CiteThisLoader = Class.create({
	initialize: function(spec) {
		this.loadingMessage = spec.loading;
		this.linkClientId = spec.citeThisClientID;
		this.checkSelection = spec.selection;
		this.location = spec.location;
		
		$(this.linkClientId).observe("click", this.update.bindAsEventListener(this));
	},
	
	update: function(event) {
		if($$('.prototip')) {
			Tips.hideAll();
			document.onselectstart = function() {return true} //ie
			document.onmousedown = function () {return true} //mozilla
		}
	},
	
	updateClicked: function(event) {
		var citationUpdateZone = 'citation_update_zone_' + this.location;
		if ($(citationUpdateZone))
			$(citationUpdateZone).innerHTML = this.loadingMessage;
		return true;
	}
});

var citeThisLoader;
Tapestry.Initializer.citeThisLoader = function(spec) { 
	citeThisLoader = new CiteThisLoader(spec); 
};

function updatingClicked(locationId) {
	var newChild = document.createElement("div");
	newChild.innerHTML = "<div class='loading'>Please wait - loading.</div>";
	var updateZoneParentId = "update_zone_parent_" + locationId;
	var citationUpdateZoneId = "citation_update_zone_" + locationId;
	var container = document.getElementById(updateZoneParentId);
	var oldChild = document.getElementById(citationUpdateZoneId);
	container.replaceChild(newChild,oldChild);
	return true;
}

function overlayResizeDownload(id){
	Overlay.box.showOverlay(id);
}

function overlayResizeEmail(id){
	Overlay.box.showOverlay(id);
}

function overlayResizePrint(id){
	Overlay.box.showOverlay(id);
}

function deselectClicked(eventUrl) {
	new Ajax.Request(eventUrl);
}

function styleChanged(eventUrl, style) {
	new Ajax.Request(eventUrl + "/" + style);
}

function deselect(eventUrl) {
	
	new Ajax.Request(eventUrl,
	{
		method: 'post',				
		onFailure: function(t)
		{
			alert('Error communicating with the server');					
		},
		onException: function(t, exception)
		{
			alert('Exception communicating with the server');
		},
		onSuccess: function(t)
		{	
			var response = t.responseText;
			Overlay.box.hideOverlay();
			if (response == 'deleted' || isBrowserIE9()) {			
				window.location.reload();
			}
		}.bind(this)
	});
	
}

function isBrowserIE9(){
	return Prototype.Browser.IE && (parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 9);
}
/* /assets/r20131.3.2-4/app/components/citation/TextPlusGraphicsContainer.js */;
/*var TextPlusGraphicsContainer = Class.create({
	
	initialize: function(spec) {
		this.fixThumbnailSizes(spec.squareSize);
	},

	fixThumbnailSizes: function(size) {
		var thumbs = $$('img.textPlusGraphicsImageClass');
		if (thumbs) {
			thumbs.each(function(thumb) {
				if( thumb.width > size || thumb.height > size ){
					if (thumb.width > thumb.height) {
						thumb.style.height = Math.floor(thumb.height * (size/thumb.width)) + "px";
						thumb.style.width = size + "px";
						//alert( thumb.style.height + "," +thumb.style.width) ;
					}
					else {
						thumb.style.width = Math.floor(thumb.width * (size/thumb.height)) + "px";
						thumb.style.height = size + "px";
						//alert( thumb.style.height + "," +thumb.style.width) ;
					}
				}
			});
		}
	}

});

Tapestry.Initializer.textPlusGraphicsContainer = function(spec) {
	new TextPlusGraphicsContainer(spec);
}*/

function setImageCaptionWidth() {
	if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
		var mainContentLeft = $('mainContentLeft');
		if (mainContentLeft != null) {
			var arr = mainContentLeft.getElementsByClassName('inlineImageCaption');
			if(arr.length > 0) {
				for(var index = 0; index < arr.length; index++) {
					var captionElement = arr[index];
					var associatedImage = captionElement.previous();
					captionElement.style.width = associatedImage.width + "px";
				}
			}
		}
	}
}
/* /assets/r20131.3.2-4/app/components/citation/TranslateFieldLink.js */;
var TranslateFieldLink = Class.create({
	initialize: function(spec) {
       setTimeout(this.delayedInitialize.bind(this,spec), 1000);
    },
	delayedInitialize: function(spec) {
		
		this.translated = spec.translated;
		
		// Ajax request URLs
		this.translateURL = spec.translateURL;
		this.revertURL = spec.revertURL;
		this.cancelURL = spec.cancelURL;
		
		this.fieldDiv = $(spec.field + "_field_" + spec.itemUniqueId);
		this.translationDiv = $(spec.field + "_translation_" + spec.itemUniqueId);
		this.translationContainer = $(spec.field + "_translation_container_" + spec.itemUniqueId);
		this.translateLink = $(spec.field + "_translate_link_" + spec.uniqueId);
		this.revertLink = $(spec.field + "_revert_link_" + spec.uniqueId);
		this.translateSpan = $(spec.field + "_translate_span_" + spec.uniqueId);
		this.revertSpan = $(spec.field + "_revert_span_" + spec.uniqueId);
		this.translateOptionsDiv = $(spec.field + "_translate_options");
		this.indicator = spec.field + "_loader_overlay_" + spec.uniqueId;
		this.defaultSourceLanguage=spec.defaultSourceLanguage;
		this.abstract_sourcelanguage=spec.abstract_sourcelanguage;
		this.fulltext_sourcelanguage=spec.fulltext_sourcelanguage;
		// Item fields - used in translate requests
		this.itemId = spec.itemId;
		this.field = spec.field;
		this.resultsId = spec.resultsId;
		this.resultNumber = spec.resultIndex;
		
		// Language fields - used to manipulate dropdowns
		this.languages = spec.languages;
		var sourceLanguageCode = spec.sourceLanguageCode;
		this.destinationLanguageCode = spec.destinationLanguageCode;
		
		// Progress flags
		this.cancel = false;
		this.inProgress = false;

		this.translateLink.observe('click', this.markClick.bindAsEventListener(this));
		this.revertLink.observe('click', this.revertClick.bindAsEventListener(this));
		$(spec.field + "_translate_cancel").observe('click', this.cancelClick.bindAsEventListener(this));
		this.translateSpan.show();
		this.revertSpan.hide();
		
		if (this.translated) {
			this.translateSpan.hide();
			this.revertSpan.show();
			// this.stripHits(this.translationDiv);
			this.translationContainer.show();
			this.revertLink.show();
			this.fieldDiv.hide();
			this.translateLink.hide();
			// Hide the hit navigation switch
			this.hideHitNavSwitch(this.field);
		}
		
		// Initialise the drop-downs
		this.sourceLanguageSelect = $(spec.field + "_sourcelanguage_"+this.itemId);
		if (sourceLanguageCode) {
			this.sourceLanguageSelect.select('option').each(function(option) {
				if (option.value == sourceLanguageCode) {
					option.selected = true;
					}
			});
		}
		else {
			sourceLanguageCode = this.sourceLanguageSelect.select('option')[3].value;
			}
		this.sourceLanguageSelect.value=spec.defaultSourceLanguage; //default selected value in source language drop down
		sourceLanguageCode = this.sourceLanguageSelect.value;
		this.sourceLanguageSelect.observe('change', this.updateDestinationLanguages.bindAsEventListener(this));
	
		this.destinationLanguageSelect = $(spec.field + "_destinationlanguage_"+this.itemId);
		this.initializeDestinationLanguages(sourceLanguageCode, this.destinationLanguageCode);
		$$('#' + spec.field  + "_translate_options_" + spec.uniqueId + ' .btnNew').observe('click', this.translateClick.bindAsEventListener(this));
		
		// Look out for lightview open events - need to check whether to close the progress box immediately
// This is broken with new overlay component.
//		document.observe('lightview:opened', this.checkOverlay.bindAsEventListener(this));
		
		// Look out for destination language change events - may need to update our destination language
		if	($('fulltext_translation_container')) {
			this.destinationLanguageSelect.observe('change', function(event) {
				$('fulltext_translation_container').fire('pq:translateDestLanguageChange', spec.field); 
			});

			$('fulltext_translation_container').observe('pq:translateDestLanguageChange', 
					this.checkDestinationLanguageSelection.bindAsEventListener(this));
		}
	},
	
	updateDestinationLanguages: function() {
		var options = this.sourceLanguageSelect.options;
		for (var i = 0; i < options.length; i ++) {
			if (options[i].selected) {
				this.initializeDestinationLanguages(options[i].value, this.destinationLanguageCode);
				break;
			}
		}
	},
	
	initializeDestinationLanguages: function(sourceLanguageCode, destinationLanguageCode) {
		// Clear the destination drop-down
		this.destinationLanguageSelect.select('option').invoke('remove');
		
		for (var i = 0; i < this.languages.length; i ++) {
			if (this.languages[i].code == sourceLanguageCode) {
				for (var j = 0; j < this.languages[i].targetLanguages.length; j ++) {
					var targetLanguage = this.languages[i].targetLanguages[j];
					var option = new Element('option', {'value': targetLanguage.code}).update(targetLanguage.name);
					if (destinationLanguageCode && targetLanguage.code == destinationLanguageCode) {
						option.selected = true;
					}
					this.destinationLanguageSelect.insert(option);
				}
			}
		}
		
	},
	
	checkDestinationLanguageSelection: function(event) {
		if (event.memo != this.field) {
			var updatedSelect = $(event.memo + '_destinationlanguage');
			if (updatedSelect) {
				var selectedValue;
				for (var i = 0; i < updatedSelect.options.length; i ++) {
					var option = updatedSelect.options[i];
					if (option.selected) {
						selectedValue = option.value;
						break;
					}
				}
				
				for (i = 0; i < this.destinationLanguageSelect.options.length; i ++) {
					option = this.destinationLanguageSelect.options[i];
					if (option.value == selectedValue) {
						option.selected = true;
						break;
					}
				}
			}
		}
		
	},
	
	markClick: function(theEvent) {
		this.cancel = false;
		if (this.translated) {
			this.translationContainer.hide();
			this.fieldDiv.show();
			this.revertClick(theEvent);
			this.translated = false;
		}
		else {
			// this.translateOptionsDiv.show();
		}
	},
	
	/**
	 * Process events fired when an overlay is displayed. This checks whether the
	 * displayed overlay is the progress indicator, and whether a translation is in progress.
	 * If the indicator is visible and shouldn't be, it is closed.
	 * This is useful when handling cached translations, which return more quickly than the
	 * indicator can appear and can lead to the indicator remaining on screen after the translation 
	 * has completed. 
	 */
	checkOverlay : function(event) {
		// Check whether the indicator is open and whether it should be open - if not, close it
		if ($(this.indicator).visible() && !this.inProgress) {
			this.stopIndicator();
		}
	},
	
	/**
	 * Display the progress indicator.
	 */
	startIndicator : function() {
		Overlay.box.showOverlay(this.indicator);
	},

	/**
	 * Hide the progress indicator.
	 */
	stopIndicator : function() {
		Overlay.box.hideOverlay();
	},
	
	/**
	 * Get the currently selected option from a drop down.
	 */
	findSelectedOption: function(dropdown) {
		var retVal = "";
		
		var options = dropdown.select('option');
		for (var i = 0; i < options.length; i ++) {
			if (options[i].selected) {
				retVal = options[i].value;
				break;
			}
		}
		
		return retVal;
	},

	/**
	 * Handle the translate click event.
	 */
	translateClick: function(event) {
		event.stop();
		this.translateLink.prototip.hide();
		this.cancel = false;
		this.inProgress = true;

		// Gather the source and destination languages
		var sourceLang = this.findSelectedOption(this.sourceLanguageSelect);
		var destLang = this.findSelectedOption(this.destinationLanguageSelect);

		// Start the indicator wheel; this is stopped during the Ajax request block,
		// otherwise it stops immediately
		this.startIndicator();
		
		// Do the Ajax call
		this.translateRequest = new Ajax.Request(this.translateURL,
		{
			method: 'post',
			parameters: {
				'srcLang' : sourceLang, 'destLang' : destLang, 'field': this.field, 
				'resultsId': this.resultsId, 'resultIndex': this.resultNumber, 
				'itemId': this.itemId
			},
			onFailure: function(t)
			{
				alert('Error communicating with the server');
			},
			onException: function(t, exception)
			{
				alert('Error communicating with the server');
			},
			onSuccess: function(t)
			{	
				if (!this.cancel) {
					this.translateLink.hide();
					this.translateSpan.hide();
					this.revertSpan.show();
					// Process the response.
					var response = t.responseText;
					if (response.indexOf("Exception:") == 0) {
						this.translateLink.show();
						var errors = response.split(":");
						throw errors[1];
					}
					if (!response.blank()) {
						this.revertLink.show();
						this.translationDiv.update(response);
						// this.stripHits(this.translationDiv);
						this.translationContainer.show();
						this.fieldDiv.hide();
						this.translated = true;

						// Hide the hit navigation switch
						this.hideHitNavSwitch(this.field);
					}
					else {
						this.translateLink.show();
					}
				}
			}.bind(this),
			onComplete: function(t) {
				this.inProgress = false;
				this.stopIndicator();
			}.bind(this)
		});
		
	},
	
	/**
	 * Handle the revert click event.
	 */
	revertClick: function(theEvent) {
		new Ajax.Request(this.revertURL, {
			method: 'post',
			parameters: {				
				'field': this.field, 'itemId': this.itemId
			},
			onFailure: function(t)
			{
				alert('Error communicating with the server');
			},
			onException: function(t, exception)
			{
				alert('Error communicating with the server');
			},
			onSuccess: function(t)
			{	// No response processing required - just reset the display
				this.translationContainer.hide();
				this.fieldDiv.show();
				this.translateLink.show();
				this.revertLink.hide();
				this.translated = false;
				this.translateSpan.show();
				this.revertSpan.hide();
				
				// Show the navigation switch
				if ($(this.field + "_hitnav_switch")) {
					$(this.field + "_hitnav_switch").show();
				}
			}.bind(this)
		});
	},
	
	/**
	 * Handle the cancel event. This mainly sets the cancel flag, which
	 * is looked for by the translation event processor, but also aborts
	 * the translation Ajax call, and sends a cancel request to the server (this
	 * doesn't immediately abort the translation, but will interrupt long
	 * translations).
	 */
	cancelClick : function(event) {
		this.cancel = true;
		this.inProgress = false;
		Event.stop(event);
		this.stopIndicator();
		
		if (this.translateRequest) {
			this.translateRequest.transport.abort();
			if (!this.translateRequest._complete) {
				this.wasCancelled = true;
			}
		}
		
		// Interrupt the translation process, if possible
		new Ajax.Request(this.cancelURL, {
			method: 'post',
			parameters: {
				'field': this.field, 'itemId': this.itemId
			}
		});
	},
	
	hideHitNavSwitch : function(field) {
		// Hide the hit navigation switch
		if ($(field + "_hitnav_switch")) {
			$(field + "_hitnav_switch").hide();
		}
	}
	
//	stripHits: function(translation) {
//		translation.select('.hit').each(function(hitspan) {
//			hitspan.removeClassName('hit');
//		});
//	}		
	
});

Tapestry.Initializer.translateFieldLink = function(spec) {
	new TranslateFieldLink(spec);
};
/* /assets/r20131.3.2-4/app/components/citation/PinkynailsContainer.js */;
var PinkynailsContainer = Class.create({
	
	initialize: function(spec) {
	
		if (spec.squareSize != null)
			this.fixThumbnailSizes(spec.squareSize);
		if (spec.linkId != null) {
			this.itemIndex = spec.itemIndex;
			this.allImages = spec.allImages;
			this.uniqueId = spec.uniqueId;
			this.spacerImage = spec.spacerImage;
			
			this.illustrata = spec.illustrata;
			if (!this.illustrata) {
				this.showAllImagesZoneId = spec.showAllImagesZoneId;
				this.showAllImagesZone = $(spec.showAllImagesZoneId);
			}
			
			this.linkId = spec.linkId;
			this.link = $(this.linkId);
			this.link.observe('click', this.shoMoreImages.bindAsEventListener(this));
			
			this.linkLessId = spec.linkLessId;
			this.linkLess = $(this.linkLessId);
			this.linkLess.observe('click', this.showLessImages.bindAsEventListener(this));
			
			this.linkPlusId = spec.linkPlusId;
			this.linkPlus = $(this.linkPlusId);
			this.linkPlus.observe('click', this.showMorePlusImages.bindAsEventListener(this));
			
			this.pinkyDivId = spec.pinkyDivId;
			this.pinkyDiv = $(this.pinkyDivId);
			
		}
	},

	fixThumbnailSizes: function(size) {
		var thumbs = $('img.pinkynail');
		if (thumbs) {
			thumbs.each(function(thumb) {
				if (thumb.width > thumb.height) {
					thumb.style.width = size;
					thumb.style.height = "";
				}
				else {
					thumb.style.height = size;
					thumb.style.width = "";
				}
			});
		}
	},
	
	shoMoreImages: function(event) {
		this.link.hide();
		this.linkPlus.hide();
		this.linkLess.show();
		if (!this.illustrata) {
			this.showAllImagesZone.show();
			this.pinkyDiv.removeClassName('pinkieInnerContainer');

			this.pinkyDiv.select('span[class=pinkieInnerSpan]').each(function (item, index){
				var img = new Element('img');
				img.observe('load', this.imageLoaded.bindAsEventListener(this));
				img.src = this.allImages.images[index].url;
				img.alt = this.allImages.images[index].alt;

				var link = new Element('a');
				link.href = this.allImages.images[index].link;
				link.title = this.allImages.images[index].title;
				link.addClassName('plink');
				link.update(img);

				item.appendChild(link);
			}.bind(this));
		} else {
			this.pinkyDiv.select('div[class=nailHolderLoading]').each(function (item, index){
				item.show();
			}.bind(this));
			
			this.pinkyDiv.select('img[class=pinkynailimageview]').each(function (item, index){
				item.observe('load', this.pinkyLoaded.bindAsEventListener(this));
				item.src = this.allImages[index];
			}.bind(this));
		}
		
	},
	
	imageLoaded: function(event) {
		var img;
		img = event.findElement();
		img.up(0).up(0).previousSiblings()[0].hide();
		var nailholder = img.up(0).up(0).up(0);
		nailholder.removeClassName('nailHolderLoading');
		nailholder.addClassName('nailHolder');
		img.up(0).up(0).show();
	},
	
	pinkyLoaded: function(event) {
		var img;
		img = event.findElement();
		img.up(0).up(0).up(0).previousSiblings()[0].hide();		
		img.up(0).up(0).up(0).show();
	},
	
	showLessImages: function(event) {
		this.linkPlus.show();
		this.linkLess.hide();
		
		if (!this.illustrata) {
			this.showAllImagesZone.hide();
			this.pinkyDiv.addClassName('pinkieInnerContainer');
		} else {
			this.pinkyDiv.select('div[class=nailHolderLoading]').each(function (item, index){
				item.nextSiblings()[0].hide();
			}.bind(this));
		}
	},
	
	showMorePlusImages: function(event) {
		this.linkPlus.hide();
		this.linkLess.show();
		
		if (!this.illustrata) {
			this.showAllImagesZone.show();
			this.pinkyDiv.removeClassName('pinkieInnerContainer');
		} else {
			this.pinkyDiv.select('div[class=nailHolderLoading]').each(function (item, index){
				item.nextSiblings()[0].show();
			}.bind(this));
		}
	}

});

Tapestry.Initializer.pinkynailsContainer = function(spec) {
	new PinkynailsContainer(spec);
}
/* /assets/r20131.3.2-4/app/components/citation/DocViewLink.js */;
var DocViewLink = Class.create(
{
	initialize: function(spec)
	{	
		this.clientId = spec.clientId;
		this.zoneId = spec.zoneId;
		this.submitURL = spec.submitURL;

		//TODO: this should not be bound to *EVERY* click in the application
		Event.observe(document, "click", this.handleClick.bind(this));
	},
	
	handleClick: function(event) {
		if (event.isLeftClick() || event.button == 0) {
			var link = this.getLink(event);
			if (link && link.hasAttribute('href') && (link.readAttribute('href').lastIndexOf("docview/") > 0 ))
				this.callBack(event, link);
		}
	},
	
	getLink: function(event) {
		var link = event.findElement();
		if (link) {
			if (link.pathname)
				return link;
			else {
				link = $(link).up('a');
				if (link && link.pathname)
					return link;
			}
		}
	},
	
	callBack: function(event, link) {
		Event.stop(event);

		var zoneObject = Tapestry.findZoneManagerForZone(this.zoneId);
		if (!zoneObject)
			return;
		
		var path = link.readAttribute('href');
		var origPath = path;
		var questionidx = path.indexOf('?');
		
		if (questionidx > 0)
			path = path.substring( path.lastIndexOf("docview/") + 8, questionidx );
		else
			path = path.substring( path.lastIndexOf("docview/") + 8);
		
		var url = this.submitURL.replace('$$', path);

		//This reinstates the query params that were stripped off earlier
		if (questionidx > 0) {
			zoneObject.updateFromURL(url,origPath.substring(questionidx + 1).toQueryParams());
		} else {
			zoneObject.updateFromURL(url);
		}
		return false;
	}
	
});


Tapestry.Initializer.docViewLink = function(spec)
{
	new DocViewLink(spec);
};


/* /assets/r20131.3.2-4/app/components/citation/TranslationContainer.js */;
var TranslationContainer = Class.create({
	initialize : function(spec) {
		this.translationDiv = $(spec.field + "_translation_" + spec.uniqueId);
		this.translationContainer = $(spec.field + "_translation_container_"
				+ spec.uniqueId);

		// Used to show any translations on the Print View page
		if (!this.translationDiv.empty()) {
			this.translationContainer.show();
		}
	}
});

Tapestry.Initializer.translationContainer = function(spec) {
	new TranslationContainer(spec);
};
/* /assets/r20131.3.2-4/app/components/citation/view/ShowLimit.js */;
var GroupByGroupSl = Class.create({
                initialize: function(spec){
	                this.showMoreLinkId = $(spec.showMoreLinkId) ;
	                this.showLessLinkId = $(spec.showLessLinkId) ;
	                this.divElements = $$('.' + spec.divsClass) ;
	                
	                if(this.showMoreLinkId) {
	                	Event.observe(this.showMoreLinkId, 'click', this.showdivgroup.bindAsEventListener(this));
	                }
	                if(this.showLessLinkId) {
	                	Event.observe(this.showLessLinkId,'click', this.hidedivgroup.bindAsEventListener(this));
	                }
				},
				
				showdivgroup: function() {
                    this.divElements.each(function(element) {
                    	  element.show();
                    });
                    this.showLessLinkId.show();
                    this.showMoreLinkId.hide();
                    return false;
                },
                
                hidedivgroup: function() {
                	this.divElements.each(function(element) {
                  	  	  element.hide();
                	});
                    this.showLessLinkId.hide();
                    this.showMoreLinkId.show();
                    return false;
                }
}) ;

Tapestry.Initializer.showLimit = function(spec){
		 new GroupByGroupSl(spec);
}
/* /assets/r20131.3.2-4/app/components/docview/Abstract.js */;
var Abstract = Class.create({
  initialize: function(spec) {
	  
	  this.uniqueID = spec.uniqueID;
	  this.abstractTrigger = $("abstractTrigger_"+this.uniqueID);
	  
	  if (this.abstractTrigger) {
		  this.abstractTrigger.observe('click', this.toggleAbstract.bindAsEventListener(this));
	  }
	  

  },
  
  toggleAbstract: function(){
	 
  	var section = $("abstractDiv_"+this.uniqueID);
  	
  		if(section){
	    	if(section.getStyle('display') == 'block'){
	    		section.hide();
	    		this.abstractTrigger.removeClassName("indicator_collapse").addClassName("indicator_expand");
	    		$("abstractHeader").addClassName("collapsed");
	    	} else {
	    		section.show();
	    		this.abstractTrigger.removeClassName("indicator_expand").addClassName("indicator_collapse");
	    		$("abstractHeader").removeClassName("collapsed");
	    	}
  		}
  	}

});

var abstract;
Tapestry.Initializer.Abstract = function(spec) { 
	abstract = new Abstract(spec); 
};

Tapestry.Initializer.AbstractCompleteBlock = function() {
    var t = $('hitnavigationswitch');
		if (t != null)
			t.fire("hitnav:refresh");							
};

Tapestry.Initializer.AbstractSummaryBlock = function() {
	
	var t = $('hitnavigationswitch');
	if (t != null) {
		t.fire("hitnav:refresh");
	}
};

/* /assets/r20131.3.2-4/app/components/docview/FullText.js */;
var FullText = Class.create({

		initialize: function(spec) {
			
			this.displayTextPlusGraphics = spec.displayTextPlusGraphics;
			this.displayFormatValue = spec.displayFormatValue;
			this.fullTextToggle = spec.fullTextToggle;
			this.fieldDiv = spec.fieldDiv;
			this.fullTextTrigger = $("fulltextTrigger_" + spec.uniqueid);
			this.fullTextHeader =  $("fullTextHeader");
			this.section = $("fulltextDiv_"+spec.uniqueid);
			
			
			if (this.fullTextTrigger) {
				this.fullTextTrigger.observe('click', this.toggleFulltext.bindAsEventListener(this));
			}
			
			/*This if condition is for when we want the full text section to be collapsed. By default the full text section
			 * is expanded.
			 * When clicking through from the results page to the doc view via the citation/abstract link, fullTextToggle
			 * will be true and we do not want the full text section to be expanded. Therefore we collapse it.
			 */
			if (!this.allowAnchor()) {
				if (this.fullTextToggle) {
					this.toggleFulltext();
		    	} 
			}
		},
  
		toggleFulltext: function(){
			if (this.section){
				
		    	if (this.section.getStyle('display') == 'block'){
		    		this.section.hide();
			    		this.fullTextTrigger.removeClassName("indicator_collapse").addClassName("indicator_expand");
			    		this.fullTextHeader.addClassName("collapsed");
			    			    		
			    		
			    		if (!this.displayTextPlusGraphics) {	
				 				var altTextId = $('hitnavigationswitch_altText');
				 				if (altTextId){
				 					if ($(this.fieldDiv).select('.hit').size() == 0){	
				 						altTextId.hide();
				 					} else {
				 						altTextId.show();
				 					}
				 				}
			    		} else if (this.displayTextPlusGraphics) {
				    		if ($(this.fieldDiv).select('.hitNavigationSwitch').size() == 0) {
					    		var altTextId = $('hitnavigationswitch_altText');
					    		if (altTextId){
					    			altTextId.hide();
					    		}
				    		}
			    			
			    		}	

		    	} else {
		    		this.section.show();
		    		this.fullTextTrigger.removeClassName("indicator_expand").addClassName("indicator_collapse");
		    		this.fullTextHeader.removeClassName("collapsed");
		    		var ftLink = $("displayFullText");
			    	if (ftLink) {
			    		var zoneObject = Tapestry.findZoneManagerForZone('fullTextZoneId');
			    		if (zoneObject != null)
			    		{
				    		zoneObject.updateFromURL(ftLink.href, "");
			    		}
			    	}
		    	}
			}
		},
		
		/* Method tests for the presence of an anchor in the URL. Example '#2'. */
		allowAnchor: function() {
			
			return /#\d*/.test(window.location.href);
		}
		
});

				
	
var fullText;
Tapestry.Initializer.FullText = function(spec) { 
	fullText = new FullText(spec); 
};	

var FullTextDisplay;
Tapestry.Initializer.FullTextDisplay = function() {
    var t = $('hitnavigationswitch');
	if (t != null)
		t.fire("hitnav:refresh");							
};
			    
			    
			    
			    
			    
			    
			    
			    
			    


/* /assets/r20131.3.2-4/app/components/docview/FullCitation.js */;
var FullCitation = Class.create({
  initialize: function(spec) {

	  this.uniqueID = spec.uniqueID;
	  this.indexingTrigger = $("indexingTrigger_"+this.uniqueID);
	  
	  if (this.indexingTrigger) {
		  this.indexingTrigger.observe('click', this.toggleIndexing.bindAsEventListener(this));
	  }
  },
  
  toggleIndexing: function(e) {
  	
	  var section = $("indexingSectionDiv_"+this.uniqueID);
  	
  		if(section){
	    	if(section.getStyle('display') == 'block') {
	    		section.hide();
	    		this.indexingTrigger.removeClassName("indicator_collapse").addClassName("indicator_expand");
	    	} else {
	    		section.show();
	    		this.indexingTrigger.removeClassName("indicator_expand").addClassName("indicator_collapse");
	    	}
  		}
  }

});

var fullCitation;
Tapestry.Initializer.FullCitation = function(spec) { 
		fullCitation = new FullCitation(spec); 
};
/* /assets/r20131.3.2-4/app/components/docview/HeaderTitle.js */;
function checkForImage(uri) {
	new Ajax.Request(uri, {
		method :'post',
		parameters : {
			'imgFlag' :'false'
		},
		onSuccess : function(t) {
		}
	});
}

/* /assets/r20131.3.2-4/app/components/docview/IntelliDocBase.js */;
function getIdlWin(url,title)
{
	var newWindow=window.open("", "mywindow", "width=690,height=600,toolbars=no,menubar=no,location=no,scrollbars=yes,resizable=yes,status=yes");
	var tmp = newWindow.document;
	tmp.write('<html><head><title>'+title+'</title>');
	tmp.write('<link type="text/css" rel="stylesheet" href="http://'+  document.location.host + '/styles/PageLayout.css" />');
	tmp.write('<style type="text/css">body, #container {background: white; } iframe{border: none;}</style>');
	tmp.write('</head><body>');
	
	tmp.write('<div id="container" class="fullscreen">');
	tmp.write('<div><a href="javascript:self.opener.getIdlWin(\'' + url + '\',\''+title+'\');">&lt;&lt; Company Report</a></div>');
	tmp.write('<div><iframe id="myframe" src= "'+url+'" width="670" height="550" /></div>');
	
	tmp.write('</div>');
	
	tmp.write('</body></html>');
	tmp.close();
}
/* /assets/r20131.3.2-4/app/components/database/DatabasePageLinkEvent.js */;
var DatabasePageLinkEvent = Class.create({
	
	initialize: function(spec) {
		this.formId = spec.formId;
		var link = $(spec.linkId);
		link.observe('pq:submitForm', this.fireEvent.bindAsEventListener(this, false));
		
		if (this.formId)
			new Form.Observer(this.formId, 10, this.fireEvent.bindAsEventListener(this, true));
		
	},
	
	fireEvent: function(event, background) {
		$(this.formId).request({
			method: 'post',
			parameters: { 'dbPageLinkClick': 'true', 'background' : background }
		});
	}
	
});

Tapestry.Initializer.databasePageLinkEvent = function(spec) {
	new DatabasePageLinkEvent(spec);
};
/* /assets/r20131.3.2-4/app/components/database/DatabaseCheckbox.js */;
var PersistentCheckbox = Class.create(
{
	initialize: function(config) {
		this.checkboxId = config.checkboxId;
		this.selectUrl = config.selectUrl;
		this.item = config.item;
		this.subjects = config.subjects;
		this.markClass = config.markClass;

		if (!PersistentCheckboxstorage["x"]) {
			PersistentCheckboxstorage["x"] = "observe";
			Event.observe(document, "click", this.handleClickOnCheckbox.bind(this));
		}
		PersistentCheckboxstorage[ this.checkboxId ] = this;
	},
	
	handleClickOnCheckbox: function(event) {
		var trigger = event.findElement();
		if (trigger && trigger.type == 'checkbox' &&  trigger.id.startsWith('dbcb_')) {
			var checkbox = PersistentCheckboxstorage[trigger.id];
			if (checkbox) {
				checkbox.handleClick(event);
			}
		}
	},

	handleClick: function(theEvent) {
		var url = this.selectUrl;
		if (!this.checkbox)
			this.checkbox = $(this.checkboxId);
		var startOfQueryStr = url.indexOf("?");
		if (startOfQueryStr != -1) {
			if (this.checkbox.checked != null)
				url = url.substring(0, startOfQueryStr) +  "/" + this.checkbox.checked + url.substring(startOfQueryStr);
		} else {
			if (this.checkbox.checked != null)
				url = url +  "/" + this.checkbox.checked;
		}
		theEvent.stop();
			
		new Ajax.Request(url,
			{
				method: 'post',
				parameters: {item: this.item, subjects: this.subjects},
				evalJSON: true,
				onFailure: function(t)
				{
					alert('Error communicating with the server');
				},
				onException: function(t, exception)
				{
					alert('Exception communicating with the server');
				},
				onSuccess: function(t)
				{	// Process the response.
					var resp = t.responseJSON;
					if (resp) {
						var selectAll = resp.selectAll;
						
						if (resp.items && resp.items.length >= 1){
							this.handleAjaxResponse(resp);
						}
					}
				}.bind(this)
			});
	},

	handleAjaxResponse: function(resp) {
		var items = resp.items;
		var selected = resp.method == "add";
		var selectAll = resp.selectAll;
		
		items.each(
			function(item) {
				var cbId = "dbcb_" + item;
				var divId = "dbitem_" + item;
				if (! $(cbId)) {
					//alert("Not found: " + cbId);
				} else {
					$(cbId).checked=selected;
					
					if ($(divId)) {
						if (selected) {
							$(divId).addClassName('item_selectedDB').removeClassName('item_unselectedDB');
						} else {
							$(divId).removeClassName('item_selectedDB').addClassName('item_unselectedDB');
						}
					}
				}

			}
		);
		
		if ($('selectAllDivEnabled') != null) {
			var selectAll = resp.selectAll;
			if (selectAll != null) {
				if (!selectAll) {
					['selectAllDivEnabled'].each(Element.show);
					['selectAllDivDisabled'].each(Element.hide);
				}
				else {
					['selectAllDivEnabled'].each(Element.hide);
					['selectAllDivDisabled'].each(Element.show);
				}
			}
			var clearAll = resp.clearAll;
			if (clearAll != null) {
				if (clearAll) {
					['clearAllDivEnabled'].each(Element.show);
					['clearAllDivDisabled'].each(Element.hide);
				}
				else {
					['clearAllDivEnabled'].each(Element.hide);
					['clearAllDivDisabled'].each(Element.show);
				}
			}
		}
	
	}


});

PersistentCheckboxstorage = {
	UID: 1
};

Tapestry.Initializer.persistentCheckbox = function(spec)
{
	new PersistentCheckbox(spec);
};
/* /assets/r20131.3.2-4/app/components/database/DbView.js */;
var DbView = Class.create({
	initialize:function(spec){
		this.listViewLink = spec.listViewLink;
		this.scrollerViewLink = spec.scrollerViewLink;
		this.listDiv = $(spec.listDiv);
		this.scrollerDiv = $(spec.scrollerDiv);
		this.viewDiv = $(spec.viewDiv);
		this.isDialog = $(spec.isDialog);
		this.imageViewByDefault = spec.imageViewByDefault;
		
		this.listLink = $(this.listViewLink);
		this.scrollerLink = $(this.scrollerViewLink);
		this.subDatabaseSizeDiv = $(spec.subDatabaseSizeDiv);
		
		this.setListViewUrl = spec.setListViewUrl;
		this.setImageViewUrl = spec.setImageViewUrl;
	
		this.listLink.observe('click', this.onListClick.bindAsEventListener(this));
		this.scrollerLink.observe('click', this.onScrollerClick.bindAsEventListener(this));
		
		if(this.imageViewByDefault) {
			this.scrollerSelected();
		} else {
			this.listSelected();
		}
	}, 
	onListClick: function(theEvent) {
		theEvent.stop();
		$('explore_subjects_Background').toggleClassName('no-background');
		new Ajax.Request(this.setListViewUrl, {method:'get'});
		this.listSelected();
	},
	
	onScrollerClick: function(theEvent) {
		theEvent.stop();
		$('explore_subjects_Background').toggleClassName('no-background');
		new Ajax.Request(this.setImageViewUrl, {method:'get'});
		this.scrollerSelected();
	},
	
	listSelected: function()
	{
		$('explore_subjects_Background').addClassName('no-background');
		this.listDiv.show();
		this.scrollerDiv.hide();
		this.scrollerLink.removeClassName('toggleLinkOn');
		this.listLink.removeClassName('toggleLinkOff');

		this.scrollerLink.addClassName('toggleLinkOff');
		this.listLink.setStyle({display: 'none'});
		if(!this.isDialog) {
			this.subDatabaseSizeDiv.setStyle({display: ''});
		}
		this.scrollerLink.setStyle({display: ''});
		this.listLink.addClassName('toggleLinkOn');
		
		this.viewDiv.removeClassName('scrollerView');
		this.viewDiv.addClassName('listView');
	},
	
	scrollerSelected: function()
	{
		this.scrollerDiv.show();
		this.listDiv.hide();
		this.scrollerLink.removeClassName('toggleLinkOff');
		this.listLink.removeClassName('toggleLinkOn');

		this.scrollerLink.addClassName('toggleLinkOn');
		this.listLink.addClassName('toggleLinkOff');
		this.scrollerLink.setStyle({display: 'none'});
		this.listLink.setStyle({display: ''});
		this.subDatabaseSizeDiv.setStyle({display: 'none'});
		
		this.viewDiv.addClassName('scrollerView');
		this.viewDiv.removeClassName('listView');
	}
	
});

Tapestry.Initializer.DbView = function (spec){
	new DbView(spec);
}
/* /assets/r20131.3.2-4/app/components/markedlist/SelectedItemsLink.js */;
var SelectedItemsLink = Class.create({
	
	initialize: function(spec) {
		this.clientId = spec.clientId;
		this.numItems = spec.numItems;
		this.displayOverlayId = spec.displayOverlayId;
		
		document.observe('pq:selectedItemsUpdate', function(event) {
			this.numItems = event.memo;
		}.bind(this));
		
		$(this.clientId + "_link").observe('click', this.handleLinkClick.bindAsEventListener(this));
		// Changes made for story NP2-12598: Results set ordering: prompt user to apply or not apply ordering changes when navigating off database ordering page.
		// Fire an event to notify the orderDBPref page to handle the selected items click in a different way.
		$(this.clientId + "_link").observe('click', function(){document.fire('pq:selectedItemsLinkClick', event.element());});
	},
	
	handleLinkClick: function(event) {
		if (this.numItems == 0) {
			Event.stop(event);
			Overlay.box.showOverlay(this.clientId + '_itemsLink_noItemsOverlay');
		}
		else if (this.displayOverlayId) {
			Event.stop(event);
			Overlay.box.showOverlay(this.displayOverlayId);
		}
	}
	
});

Tapestry.Initializer.selectedItemsLink = function(spec) {
	new SelectedItemsLink(spec);
};
function displaySelectedItemHelp(){
	document.getElementsByName("selecteditems_help").style.display = 'block';
}

function hideSelectedItemHelp(){
	printhelpLinks = document.getElementsByName("selecteditems_help");
	for(i=0;i<printhelpLinks.length;i++)
		printhelpLinks[i].style.display = 'none';
}
/* /assets/r20131.3.2-4/app/components/markedlist/SelectedItemsCount.js */;
var SelectedItemsCount = Class.create({
	
	initialize: function(spec) {
		this.clientId = spec.clientId;
		this.singleItemMsg = spec.singleItemMsg;
		this.multipleItemMsg = spec.multipleItemMsg;
		this.itemMsg = spec.itemMsg;
		
		document.observe('pq:selectedItemsUpdate', this.updateContent.bindAsEventListener(this));
	},
	
	updateContent: function(event) {
		var count = event.memo;
		var displayText = $(this.clientId + "_display");
		
		if (count == 1) {
			displayText.update(this.singleItemMsg);
		}
		else {
			var msg = this.multipleItemMsg.replace(/%d/, count);
			displayText.update(msg);
		}
	}
	
});


Tapestry.Initializer.selectedItemsCount = function(spec)
{
	new SelectedItemsCount(spec);
};
/* /assets/r20131.3.2-4/app/components/markedlist/SaveToMyResearchOverlay.js */;
var SaveToMyResearchOverlay = Class.create({
	
	initialize: function(spec) {
		this.singleItemMsg = spec.singleItemMsg;
		this.multipleItemMsg = spec.multipleItemMsg;
		this.singleComboMsg = spec.singleComboMsg;
		this.multiComboMsg = spec.multiComboMsg;
		
		this.doNotAskMeAgain = spec.doNotAsk;
		this.defaultFolderId = spec.defaultFolderId;
		this.refworksAuthenticated = spec.refworksAuthenticated;
		
		$('signInLinkZone').observe('pq:updateItemCount', this.updateItemCounts.bindAsEventListener(this));
		$('signInLinkZone').observe('pq:addFolderSelectionChanged', this.checkFolderSelection.bindAsEventListener(this));
	},
	
	updateItemCounts: function(event) {
		var formElem = document.getElementsByName('chooseFolderForm')[0];
		var formId = formElem.id;
		var postFix = '';
		if(formId.indexOf('_') != -1){
			postFix = '_'+formId.split('_')[1];
		}
		$('saveTypeChoose'+postFix).value = event.memo.saveType;
		if (event.memo.saveType != 'singleItem') {
			$('deselectCheckBoxDiv').show();
		}
		this.updateFormatOptions(event);
		
		// Loop through and identify selected items
		var ids = null;
		var numItems = 0;
		if (event.memo.numItems == null) {
			ids = this.findItems(event.memo);
			numItems = ids.length;
		} else {
			numItems = event.memo.numItems;
		}
			
		if (this.refworksAuthenticated) {
			// Update message displays
			var msg;
			// if (numItems == 1) {
			// msg = this.singleItemMsg;
			// } else if (numItems > 0) {
			msg = this.multipleItemMsg.replace('%s', numItems);
			// }
			
			if (msg != null)
				$('itemSelectedMsg').update(msg);
			
			var ftCount = this.getFtCount(event.memo, ids);
			if (ftCount > 0) {
				var ftMsg;
				if (ftCount == 1) {
					ftMsg = this.singleComboMsg;
					
				} else {
					ftMsg = this.multiComboMsg.replace('%s', ftCount);
				}
				
				$('combinationItemMsg').update(ftMsg);
				$('combinationItemMsg').show();
				$('folderMixedMessage').show();
			}
		}
	
		// Update unique ID hidden variable
		if (ids != null && this.refworksAuthenticated) {
			$('itemIds').value = ids.join('|');
		}

		if (this.doNotAskMeAgain) {
			$('destinationFolderId').value = this.defaultFolderId;
			$('chooseFolderForm'+postFix).submit();

		} else if (numItems == ftCount) {
			// All items are F&T - do not show overlay, just save items
			$('chooseFolderForm'+postFix).submit();

		} else {
			Overlay.box.showOverlay('saveToMyResearchOverlay');
		}
	},
	
	findItems: function(memo) {
		var ids = [];
		
		if (memo.saveType == 'singleItem') {
			ids.push(memo.itemId);
			
		}
		
		return ids;
	},
	
	getFtCount: function(memo, ids) {
		if (memo.numImages != null) {
			return memo.numImages;
		} else {
			var count = 0;
			
			ids.each(function(id) {
				if (id.startsWith('Images_')) {
					count ++;
				}
			});
			
			return count;
		}
	},
		
	updateFormatOptions: function(event) {
		if ($('saveToMyResearchCitationTypeSpan')) {
			citationSpan = $('saveToMyResearchCitationTypeSpan');
			
			if (event.memo.exportFormats != null) {
				citationSpan.show();
				var selectCitation = $('saveToMyResearchCitation');
				
				selectCitation.select("option").each(function(item) {
					item.remove();
				});
				
				event.memo.exportFormats.each(function(element) {
					format = element.split("-");
					selectCitation.insert(new Element('option', {value: format[0]}).update(format[1]));
				});
			} 
		}
	},
	
	checkFolderSelection: function(event) {
		// event.memo should hold the ID of the selector - works around issue
		// where Tapestry changes IDs on Ajax form reloads.
		var folderId = $(event.memo).value;
		if (folderId == -1) {
			// Display the "New folder" div
			$('addToFolderNewFolder').show();
		}
		else if ($('addToFolderNewFolder').visible) {
			$('addToFolderNewFolder').hide();
		}
	}

});

var saveToMyResearchOverlay;
Tapestry.Initializer.saveToMyResearchOverlay = function(spec) {
	saveToMyResearchOverlay = new SaveToMyResearchOverlay(spec);
};



var QueuSpinnerMyResearch = Class.create({
	
	initialize: function(spec) {
		this.statusURL = spec.statusURL;
		this.cancelButtonId = spec.cancelButton;
		this.cancelButton = $(this.cancelButtonId);
		
		var intervalTime = 1500;
		
		
		this.cancelButton.observe('click', this.cancelQueu.bindAsEventListener(this));
		
		this.intervalID = setInterval( function() {
			this.translateRequest = new Ajax.Request(this.statusURL,
				{
					method: 'post',
					parameters: {
						
					},
					onFailure: function(t)
					{
						alert('Error communicating with the server');
					},
					onException: function(t, exception)
					{
						alert('Error communicating with the server');
					},
					onSuccess: function(t)
					{	
						var response = t.responseText;
						if (response == '0') {
							clearInterval(this.intervalID);
							window.location.reload();
						}
							
					}.bind(this),
						onComplete: function(t) {
							
						}.bind(this)
				});
		}.bind(this), intervalTime);
	},
	
	cancelQueu: function(event) {
		clearInterval(this.intervalID);
		Overlay.box.hideOverlay();
		window.location.reload();
	}
});


var queuSpinnerMyResearch;
Tapestry.Initializer.queuSpinnerMyResearch = function(spec) {
	queuSpinnerMyResearch = new QueuSpinnerMyResearch(spec);
};

/* /assets/r20131.3.2-4/app/components/markedlist/SaveToMyResearchLink.js */;

var SaveToMyResearchLink = Class.create({
	
	initialize: function(spec) {
		this.params = spec;
	},
	
	openOverlay: function(spec) {
		if (this.params.saveType == 'singleItem')
			$('signInLinkZone').fire('pq:updateItemCount', this.params);
		else {
			if (this.params.emptySelectedItems)
				Overlay.box.showOverlay('mr_noSelectedItems');
			else
				$('signInLinkZone').fire('pq:updateItemCount', this.params);
		}
	}
});


Tapestry.Initializer.saveToMyResearchLink = function(spec) {
	
	var saveToMyResearchLink = new SaveToMyResearchLink(spec);

	if (spec.onload) {
		Event.observe(window, 'load', function() {
			saveToMyResearchLink.openOverlay();
		}); 
	} else {
		saveToMyResearchLink.openOverlay();
	}
	
};

function closePreview() {
	if ($$('.prototip'))
		$$('.prototip').hide();
}
/* /assets/r20131.3.2-4/app/components/markedlist/SelectedItemsClear.js */;
var SelectedItemsClear = Class.create({
	
	initialize: function(spec) {
		this.clientId = spec.clientId;
//		this.clearURL = spec.clearURL;
//		this.button = $(this.clientId + '_buttonyes');	
		this.clearLink = $(this.clientId + '_link');
		this.clearText = $(this.clientId + '_text');
		document.observe('pq:selectedItemsUpdate', this.updateClearLink.bindAsEventListener(this));
	},
	
	updateClearLink: function(event) {
		var count = event.memo;
		if (count == 0) {
			this.clearText.show();
			this.clearLink.hide();
		} else {
			this.clearText.hide();
			this.clearLink.show();
		}
	}
	
});

Tapestry.Initializer.selectedItemsClear = function(spec) {
	new SelectedItemsClear(spec);
};

function handleButtonClick(clearURL, clientId) {
	new Ajax.Request(clearURL);
	$$('div.item').invoke('removeClassName', 'item_selected');
	$$('div.results_list_copy').invoke('removeClassName', 'copy_selected');
	$$('input.marked_list_checkbox').each(function(cb) {
		cb.checked = false;
	});
	$(clientId + '_text').show();
	$(clientId + '_link').hide();
	var numItems = '0';
	document.fire('pq:selectedItemsUpdate', numItems);
}

/* /assets/r20131.3.2-4/app/components/myresearch/SignInOverlay.js */;
var SignInOverlay = Class.create({
	initialize: function(spec) {
		this.lastFocus = null;
		this.activateOnClose = null;
		this.usernameField = spec.usernameField;
		this.eventMemo = null;
		this.hideOverlay = true;
		this.formWatchList = spec.formWatchList;
		this.destination = spec.destination;
		// Observe the sign in link
		$('signInLink').observe('click', this.displaySignIn.bindAsEventListener(this, spec.refreshOnSignIn));

		this.signInLinkZone = $('signInLinkZone');
		// Observe events outside of sign in overlay component
		this.signInLinkZone.observe('pq:signIn', this.displaySignInClear.bindAsEventListener(this, true));

		// Observe events not requiring a refresh
		this.signInLinkZone.observe('pq:signInNoRefresh', this.displaySignInClear.bindAsEventListener(this, false));
		
		this.signInLinkZone.observe('pq:signInNoClear', this.displaySignInNoClear.bindAsEventListener(this));
		
		// Look out for sign in complete events - fired from template
		$('overlayZone').observe('pq:signInComplete', this.signInComplete.bindAsEventListener(this));
		
		document.observe("keyup", this.trackBlur.bind(this));
		document.observe("click", this.trackBlur.bind(this));

		document.observe('lightview:opened', this.openOverlay.bindAsEventListener(this));
		
		// Monitor Lightview closing
		document.observe('lightview:hidden', this.closeOverlay.bindAsEventListener(this));
	},
	
	displaySignInNoClear: function(event) {
		this.hideOverlay = false;
		this.displaySignIn(event, false);
	},
	
	displaySignInClear: function(event, refresh) {
		this.hideOverlay = true;
		this.displaySignIn(event, refresh);
	},
	
	displaySignIn: function(event, refresh) {
		this.refreshOnSignIn = Boolean(refresh);
		var eventDestination = "";
		if (event.memo) {
			this.eventMemo = event.memo;
			if (Object.isString(event.memo)) {
				eventDestination = event.memo;
			} else if (event.memo.destination) {
				eventDestination = event.memo.destination;
			}
		}
		if (eventDestination != 'preferences'
						&& eventDestination != 'saveSearch'
						&& eventDestination != 'addedToMyResearch'
						&& eventDestination != 'shareLink'
						&& eventDestination != 'importToMyResearch'	) 
		{
			var signInClick = $('SignInClick');
			if (signInClick)
				signInClick.request();
		}
		
		if($('signInDestinationPage')) {
			if (eventDestination!=null && eventDestination!="")
				$('signInDestinationPage').value=eventDestination;
			else
				$('signInDestinationPage').value=this.destination;
		}
			
		//event.stop();
		Event.stop(event);
		if($('signInTargetMsg')) {
			if(eventDestination == 'tagging') {
				$('signInTargetMsg').innerHTML = msgSignInForTags;
			}
			else if(eventDestination == 'preferences') {
				$('signInTargetMsg').innerHTML = msgSignInForPrefs;
			}
			else if(eventDestination == 'saveSearch' || eventDestination == 'saveSelectedSearch') {
				$('signInTargetMsg').innerHTML = msgSignInForSaveSearch;
			}
			else {
				$('signInTargetMsg').innerHTML = '';
			}
		}
		Overlay.box.showOverlay('signInFormOverlay');
		
	},
	
	signInComplete: function(event) {
		if (this.hideOverlay) {
			Overlay.box.hideOverlay();
		}
		
		// If on a results page, need to refresh; otherwise just update the link zone content
		if (this.refreshOnSignIn) {
			window.location.reload();
		}
		else {
			$('signInLinkZone').innerHTML = $('signInComplete').innerHTML;
			$('signInLinkZone').fire('pq:signedIn', this.eventMemo);
		}
	},
	
	trackBlur: function(event) {
		var element = event.findElement();
		if (element.tagName == "INPUT" || element.tagName == "SELECT" || element.tagName == "TEXTAREA" ) {
			this.lastFocus = event.target;
		}
		//alert(event.target);
	},
	
	openOverlay: function(event) {
		this.activateOnClose = this.lastFocus;
		var siUsername = $('siUsername'); 
		if (siUsername && siUsername.visible) {
			siUsername.activate();
		}
	},
	
	closeOverlay: function(event) {
		var errorFields = $$('div#overlayZone input.t-error');		
		if (errorFields.length > 0) {
			errorFields.each(function(s){
				s.removeClassName('t-error');
			});
		}
		var errorDivs = $$('div#overlayZone .t-error');
		errorDivs.each(Element.hide);
		//alert("Returning focus to " + this.activateOnClose.name);
		if (this.activateOnClose != null && this.activateOnClose.activate) {
			this.activateOnClose.activate();
			this.activateOnClose = null;
		}
	}
	
});

Tapestry.Initializer.signInOverlay = function(spec) {
	new SignInOverlay(spec);
};


/* /assets/r20131.3.2-4/app/components/myresearch/SignInForm.js */;

//var SignInForm = Class.create(
//{
//	initialize: function(spec)
//	{
//		this.clientId = spec.clientId;
//		var remembermeInputElem = $$("."+this.clientId+"_siRememberme")[0];
//		remembermeInputElem.observe('click', this.remembermeClicked.bindAsEventListener(this));
//	}
//	remembermeClicked: function(event)
//	{
//		var remembermeInputElem = $$("."+this.clientId+"_siRememberme")[0];
//		if (remembermeInputElem.checked) {
//			$(this.clientId + '_RemembermeWarning').show();
//		} else {
//			$(this.clientId + '_RemembermeWarning').hide();
//		}
//	}
//});

//Tapestry.Initializer.rememberme = function(spec) {
//	new SignInForm(spec);
//};

// These are used instead of triggers to prevent JS errors in IE7.

function showForgottenOverlay() {
	Overlay.box.showOverlay('forgottenOverlay');
	
	return false;
}

function showCreateProfileOverlay() {
	Overlay.box.showOverlay('createProfileOverlay');
	return false;
}

function changeSigninLayer() {
	Overlay.box.showOverlay('signInLoginFormWorking');	
}
/* /assets/r20131.3.2-4/app/components/myresearch/CreateProfileOverlay.js */;
var CreateProfileOverlay = Class.create({
	
	initialize: function(spec) {
		this.clientId = spec.clientId;
		this.reloadFlag = false;
		this.tAndCId = spec.tAndCId;
		this.tAndC = $(this.tAndCId);
		this.submitCreateUserId = spec.submitCreateUserId;
		
		this.publicKey = spec.publicKey;
		this.theme = spec.theme;
		
		// Links to redirect to when continue/go to my research buttons clicked
		this.preferencesLink = spec.preferencesLink;
		this.myResearchLink = spec.myResearchLink;
		this.importToMyResearchLink = spec.importToMyResearchLink;
		
		if (this.submitCreateUserId) {
			this.submitCreateUser = $(this.submitCreateUserId);
		}
		
		document.observe('lightview:hidden', function(event) {
			if (this.reloadFlag)
				window.location.reload();
		}.bind(this));
		
	},

    showRecaptcha:function() {
        Recaptcha.create(this.publicKey, "recaptchaDivId", {
        	theme: this.theme,
        	callback: Recaptcha.focus_response_field
        });
    },
        
	fromCreateOverLayPage:function(){
			this.reloadFlag = true;
	},
	
	continuePage: function() {
		handleNextPage('myResearchDocs');
	},
	
	handleNextPage: function(sourceLink) {
		this.reloadFlag = false;
		var source = sourceLink.substring(sourceLink.indexOf(".")+1);
		var overlay = $(this.clientId+'Overlay');
		if(overlay) {
			Overlay.box.hideOverlay();
		}
		
		if(source == 'addTags') {
			window.location.reload();
		}
		else if(source == 'saveSearch') {
			$('openOnPageLoad').request({
				onComplete: function(t) {
					window.location.reload();
				}
			});
		}
		else if(source == 'preferences') {
			location = this.preferencesLink;
		}
		else if(source == 'importToMyResearch') {
			location = this.importToMyResearchLink;
		}
		else if(source == 'myResearchDocs') {
			var linkWithoutAccount = this.myResearchLink.split('?');
			var newHref = location.protocol + "//" + location.host;
			
			// the incoming path may have leading /, so accomodate....
			// Note, this method of changing the location avoids the IE7  and
			// Chrome issues with having the myResearchLink come in with the
			// ?accountid=#### appended.
			if (linkWithoutAccount[0].substr(0, 1) != "/") {
				newHref += '/'; 
			}
			newHref += linkWithoutAccount[0];
			if (linkWithoutAccount.length > 1) {
				newHref += "?" + linkWithoutAccount[1];
			}
			location.href = newHref;
		}
		else if (source == 'sharedList') {
			window.location.reload(true);
		}
		else {
			window.location.reload();
		}
	},
	
	getOverlay: function() {
		return $(this.clientId+'Overlay');
	}
});

var createProfileOverlay;
Tapestry.Initializer.CreateProfileOverlay = function(spec) {
	createProfileOverlay = new CreateProfileOverlay(spec);
};

function showMyResearchLearnMoreOverlay() {
	Overlay.box.showOverlay('learnMoreOverlay');
	return false;
}



	

/* /assets/r20131.3.2-4/app/components/myresearch/PreferencesLink.js */;
var PreferencesLink = Class.create({
	
	initialize: function(spec) {
		this.destination = spec.destination;
		this.id = spec.id;
		this.setDestinatonURI =spec.setDestinatonURI;
		this.link = $(this.id);
		this.tab = spec.tab;
		
		// Look out for clicks on preferences sign in links
		if (this.link != null)
			this.link.observe('click', this.signIn.bindAsEventListener(this));
		
		// Look out for signed in events - may be relevant to us
		this.signInLinkZone = $('signInLinkZone');
		if( this.signInLinkZone ) {
			this.signInLinkZone.observe('pq:signedIn', this.checkSignIn.bindAsEventListener(this));
		}
	},
	
	signIn: function(event) {
		new Ajax.Request(this.setDestinatonURI);
		Event.stop(event);
		if(this.tab == null)
		{
			this.signInLinkZone.fire('pq:signInNoRefresh', 'preferences');
		}
		else
		{
		this.signInLinkZone.fire('pq:signInNoRefresh', 'preferences'+'.'+this.tab);
		}
	},
	
	checkSignIn: function(event) {
		if (event.memo == 'preferences'+'.'+this.tab) {
			// Move to preferences page
			location.href = this.destination;
		}
		if (event.memo == 'preferences') {
			// Move to preferences page
			location.href = this.destination;
		}
	}
	
});

var prefsLink;
Tapestry.Initializer.preferencesLink = function(spec) {
		prefsLink = new PreferencesLink(spec);
};

/* /assets/r20131.3.2-4/app/components/myresearch/SaveSearchLink.js */;
var SaveSearchLink = Class.create({
	
	initialize: function(spec) {
		this.params = spec;
	},
	
	openOverlay: function(spec) {
		if (this.params.saveType == 'singleSearch')
			$('signInLinkZone').fire('pq:saveSearch', this.params);
		else {
			if (!itemsSelected('.selection_checkbox')) {
				Overlay.box.showOverlay('mr_noSelectedItems');
			}
			else {
				$('signInLinkZone').fire('pq:saveSearch', this.params);
			}
		}
	}
	
});


Tapestry.Initializer.saveSearchLink = function(spec) {
	
	var saveSearchLink = new SaveSearchLink(spec);
	saveSearchLink.openOverlay(spec);
	
};

/* /assets/r20131.3.2-4/app/components/myresearch/SaveSearchOverlays.js */;
var SaveSearchOverlays = Class.create({
	
	initialize: function(spec) {
		this.saveLinkClickUrl = spec.saveLinkClick;
		this.saveSingleDialogSearchUrl = spec.saveSingleDialogSearch;
		
		this.resultsId;
		this.saveType;
		
		$('signInLinkZone').observe('pq:saveSearch', this.handleSaveSearch.bind(this));
		$('signInLinkZone').observe('pq:saveDialogSearch', this.handleSaveDialogSearch.bind(this));
	},
	
	
	handleSaveSearch: function(event) {
		this.resultsId = event.memo.itemId;
		this.saveType = event.memo.saveType;
		
		new Ajax.Request(this.saveLinkClickUrl, {
			method: 'post',
			parameters: {resultsId : this.resultsId, saveType : this.saveType},
			onSuccess: function(t) {
				var response = t.responseJSON;
				Overlay.box.showOverlay(response.overlay);
			}
		});
	},
	
	handleSaveDialogSearch: function(event) {
		new Ajax.Request(this.saveSingleDialogSearchUrl, {
			method: 'post',
			parameters: {resultsId : this.resultsId, saveType : this.saveType},
			onSuccess: function(t) {
				var response = t.responseJSON;
				Overlay.box.showOverlay(response.overlay);
			}
		});
	}
	
});

var saveSearchOverlays;
Tapestry.Initializer.saveSearchOverlays = function(spec) {
	if (!saveSearchOverlays) {
		saveSearchOverlays = new SaveSearchOverlays(spec);
	}
};
/* /assets/r20131.3.2-4/app/components/myresearch/PrintLayer.js */;

function updatePageCount(checkbox, clientId){
	if(checkbox.checked == true){
        document.getElementById("estimatedBriefPages"+clientId).innerHTML = 
              document.getElementById("bfPageCountWithPgBreak"+clientId).value;
        
        document.getElementById("estimatedAbsPages"+clientId).innerHTML = 
              document.getElementById("absPageCountWithPgBreak"+clientId).value;
                    
        document.getElementById("estimatedFullTextPages"+clientId).innerHTML = 
              document.getElementById("ftPageCountWithPgBreak"+clientId).value;
        
        document.getElementById("estimatedAbsCitationIndexingPages"+clientId).innerHTML = 
            document.getElementById("absCitationIndexingCountWithPgBrk"+clientId).value;
	            
	  }else{            
        document.getElementById("estimatedBriefPages"+clientId).innerHTML = 
              document.getElementById("bfPageCount"+clientId).value;
        
        document.getElementById("estimatedAbsPages"+clientId).innerHTML = 
              document.getElementById("absPageCount"+clientId).value;
        
        document.getElementById("estimatedFullTextPages"+clientId).innerHTML = 
              document.getElementById("ftPageCount"+clientId).value;
        
        document.getElementById("estimatedAbsCitationIndexingPages"+clientId).innerHTML = 
            document.getElementById("absCitationIndexingPageCount"+clientId).value;
	  }
}
	
	function onChangeInclude(selectedFormat, clientId){
	     
      if(selectedFormat.value == 'FULL_TEXT'){
    	$('tip'+clientId).show();
		$('estimatedFullTextPages'+clientId).show();
		$('estimatedBriefPages'+clientId).hide();
		$('estimatedAbsPages'+clientId).hide();
		$('estimatedAbsCitationIndexingPages'+clientId).hide();
            
      }else if(selectedFormat.value == 'RESULT'){
        $('tip'+clientId).hide();
		$('estimatedFullTextPages'+clientId).hide();
		$('estimatedBriefPages'+clientId).show();
		$('estimatedAbsPages'+clientId).hide();
		$('estimatedAbsCitationIndexingPages'+clientId).hide();
      }else if(selectedFormat.value == 'CITATION_ABSTRACT_INDEXING'){
    	$('tip'+clientId).hide();
		$('estimatedFullTextPages'+clientId).hide();
		$('estimatedBriefPages'+clientId).hide();
		$('estimatedAbsPages'+clientId).hide();
		$('estimatedAbsCitationIndexingPages'+clientId).show();
      }else if(selectedFormat.value == 'BRIEF_CITATION_ABSTRACT'){
    	$('tip'+clientId).hide();
    	$('estimatedFullTextPages'+clientId).hide();
    	$('estimatedBriefPages'+clientId).hide();
    	$('estimatedAbsPages'+clientId).show();
    	$('estimatedAbsCitationIndexingPages'+clientId).hide();
      }else if(selectedFormat.value == 'BRIEF_CITATION'){
    	$('tip'+clientId).hide();
    	$('estimatedFullTextPages'+clientId).hide();
    	$('estimatedBriefPages'+clientId).show();
    	$('estimatedAbsPages'+clientId).hide();
    	$('estimatedAbsCitationIndexingPages'+clientId).hide();
      }else if(selectedFormat.value== 'CITATION_ABSTRACT_INDEX'){
    	$('tip'+clientId).hide();
    	$('estimatedFullTextPages'+clientId).hide();
    	$('estimatedBriefPages'+clientId).hide();
    	$('estimatedAbsPages'+clientId).hide();
    	$('estimatedAbsCitationIndexingPages'+clientId).show();
      }else if(selectedFormat.value == 'FULL_TEXT'){
    	$('tip'+clientId).show();
    	$('estimatedFullTextPages'+clientId).show();
    	$('estimatedBriefPages'+clientId).hide();
    	$('estimatedAbsPages'+clientId).hide();
    	$('estimatedAbsCitationIndexingPages'+clientId).hide();
      }
}
/* /assets/r20131.3.2-4/app/components/myresearch/CheckSelectedItems.js */;

/**
 * Check whether any checkboxes with the given class are checked, and show an overlay
 * dependent on the outcome.
 * @param selectedClass the class of the checkboxes being inspected.
 * @param selectedOverlay the overlay to display if any checkboxes are selected.
 * @param errorOverlay the overlay to display if no checkboxes are selected.
 * @return
 */
function checkSelectedItems(selectedClass, selectedOverlay, errorOverlay) {

	if (itemsSelected(selectedClass)) {
		Overlay.box.showOverlay(selectedOverlay);
	}
	else {
		Overlay.box.showOverlay(errorOverlay);
	}

}

/**
 * This method is utterly useless and should be removed.
 * @param selectedClass
 * @param selectedOverlay
 */
function checkItemsSelected(selectedClass, selectedOverlay) {
	Overlay.box.showOverlay(selectedOverlay);
}

/**
 * Check whether any checkboxes with the given class are checked, and show an overlay
 * if none are selected.
 * @param selectedClass the class of the checkboxes being inspected.
 * @param errorOverlay the overlay to display if no checkboxes are selected.
 * @return true if one or more checkboxes are selected, false if none are.
 */
function checkSelectedItemsErrorOverlay(selectedClass, errorOverlay) {

	var selected = itemsSelected(selectedClass);

	// errorOverlay may not have been rendered when this is run the first time
	// (ie. inline script in SharedListOverlay)
	if (!selected && $(errorOverlay)) {
		Overlay.box.showOverlay(errorOverlay);
	}

	return selected;

}


function checkSelectedItemsEvent(selectedClass, errorOverlay, eventUrl) {

	if (itemsSelected(selectedClass)) {
		new Ajax.Request(eventUrl);
	}
	else {
		Overlay.box.showOverlay(errorOverlay);
	}

}

function checkSelectedItemsWithTitle(selectedClass, errorOverlay, title) {
	if (!itemsSelected(selectedClass)) {
		Overlay.box.showOverlay(errorOverlay);
	}
}


/**
 * Check whether any checkboxes with the given class are checked.
 * @param selectedClass the class of the checkedboxes being inspected.
 * @return true if one or more are selected, false if none are selected.
 */
function itemsSelected(selectedClass) {

	var selected = false;
	var checkBoxes = $$(selectedClass);
	for (var i = 0; i < checkBoxes.length; i ++) {
		if (checkBoxes[i].checked) {
			selected = true;
			break;
		}
	}

	return selected;

}

function setNoSelectedItemsTitle(title) {
	Overlay.box.changeTitle(title);
}
/* /assets/r20131.3.2-4/app/components/myresearch/MyResearchRequestItem.js */;
var MyResearchRequestItem = Class.create({
	
	initialize: function(spec) {
		this.requestItemLinkClientId = spec.requestItemLinkClientId ;
		this.isResults = spec.isResults;
		$(this.requestItemLinkClientId).observe('click', this.tigger.bindAsEventListener(this)) ;
	},
	
	tigger: function(event){
		this.requestItem(event,true, '', 'noSelectedReqItem') ;
	},
	
	loadForm: function(event){
		handleAjaxRequest(event, this.updateUrl, this.zoneId) ;
	},
	
	requestItem: function(event,selection, uniqueId, noItemsOverlay) {
		var showOverlay = !selection;
		if (selection) {
			// Check item(s) selected
			var checkboxes;
			if (this.isResults) {
				checkboxes = $$('.marked_list_checkbox');
			} else {
				checkboxes = $$('.selection_checkbox');	
			}
			for (var i = 0; i < checkboxes.length; i ++) {
				if (checkboxes[i].checked) {
					showOverlay = true;
					break;
				}
			}
		}
		if (showOverlay) {
			Overlay.box.showOverlay('illRqOverlayRequestItem');
		}
		else {
			Event.stop(event);
			Overlay.box.showOverlay(noItemsOverlay);
		}
	},
	
	handleAjaxRequest: function(event, url, zoneId){
		new Ajax.Request(url, {
			method: 'post',
			onSuccess: function(t) {
				var zoneManager = Tapestry.findZoneManager(zoneId);
				if (!zoneManager) {
					return;
				}
				zoneManager.processReply(t.responseJSON);
			}
		});
	}
}) ;

var myResearchRequestItem;
Tapestry.Initializer.myResearchRequestItem = function(spec) {
	myResearchRequestItem = new MyResearchRequestItem(spec);
};
/* /assets/r20131.3.2-4/app/components/search/BrowseIndexRow.js */;

var BrowseIndexRow = Class.create(
{
	initialize: function(spec)
	{
		this.fieldsSelect = $(spec.fieldsSelectId);
		this.rowId = spec.rowId;
		this.queryTermId = spec.queryTermId;
		if(this.fieldsSelect.value!='citationBodyTags')
		{
			this.updateIndexLink(this);
		}
		this.fieldsSelect.observe('change', this.updateIndexLink.bindAsEventListener(this)); 
		this.fieldsSelect.observe('keyup', this.updateIndexLink.bindAsEventListener(this)); 
	},
	updateIndexLink: function(event)
	{
		var hiddenElem = $('lastSelected'+this.rowId);
		
		if(hiddenElem){
			var value = hiddenElem.value;
			if(!value.blank()) {//Check for IE, does not like blank values
				var lastUpdatedElem = $(value);
				if(lastUpdatedElem) {
					lastUpdatedElem.style.display = "none";
				}
			}
		}
		
		var spanElem = $('browseIndexSpan' + this.rowId + this.fieldsSelect.value);
		
		if (spanElem) {
			spanElem.style.display = "inline";
			$('lastSelected'+this.rowId).value = 'browseIndexSpan' + this.rowId + this.fieldsSelect.value;
			var link = spanElem.down('a');
			link.observe('click', this.showLoadingOverlay.bindAsEventListener(this));
		}
	},
	showLoadingOverlay: function (event)
	{
		var overlay = $('browseIndexLoadingOverlay');
		Overlay.box.showOverlay('browseIndexLoadingOverlay');
		overlay.queryTermId = this.queryTermId;
		document.observe('lightview:hidden', this.overlayHidden.bindAsEventListener(this));		
	},
	overlayHidden: function( event )
	{
		var overlay = $('browseIndexLoadingOverlay');
		if( overlay.queryTermId ) {
			$(overlay.queryTermId).focus();
			overlay.queryTermId = undefined;
		}
	}
});

Tapestry.Initializer.browseIndexRow = function(spec)
{
	new BrowseIndexRow(spec);
}

/* /assets/r20131.3.2-4/app/components/search/ExposedSearchField.js */;
var ExposedSearchField = Class.create({
	initialize: function(spec) {
		this.field = $(spec.eventLinkId);
		this.rowId = spec.rowId;
		this.field.observe('click', this.showLoadingOverlay.bindAsEventListener(this)); 
	},
	
	showLoadingOverlay: function (event) {
		Overlay.box.showOverlay('browseIndexLoadingOverlay');
	}
});

Tapestry.Initializer.ExposedSearchField = function(spec) {
	new ExposedSearchField(spec);
}

/* /assets/r20131.3.2-4/app/components/search/SearchLimitersCheckboxGroup.js */;
var SearchLimitersCheckboxGroup = Class.create({
	initialize: function(spec) {	
	    this.limiterType = spec.limiterType;
	    this.limiterItems = spec.limiterItems;
	    this.options = spec.options;
	    
		this.selectAllLink = $('selectAll_' + spec.limiterType);
		this.selectAllLink.observe('click', this.selectAll.bindAsEventListener(this));		
		
		this.selectAllTextId = 'allSelected_' + spec.limiterType;	
		this.deselectAllTextId = 'allNotSelected_' + spec.limiterType;
		
		var divGroup = 'divcbgroup_' + spec.limiterType;
		if (!this.options) {
			$(divGroup).observe('click', this.checkBoxClick.bindAsEventListener(this));
		} else {
			$(divGroup).observe('click', this.checkBoxClickOptions.bindAsEventListener(this));
		}
		
		if (this.limiterType && this.limiterItems && (this.limiterType == 'AgeGroupExtended')) {
	    	for (var i=0; i<=this.limiterItems; i++) {
	    		if (i == 2) {
	    			this.dotted = $('AgeGroup_3');
	    			if (this.dotted) {
	    				$('AgeGroup_3').show();
	    			}
	    		} else {
	    			this.nodotted = $('AgeGroup_' + i);
	    			if (this.nodotted) {
	    				this.nodotted.hide();
	    			}
	    		}
	    	}
	    } 
	},
	
	checkBoxClick: function(event) {
		// Get the clicked list item
		var label = event.findElement('label');
		if (label && label.htmlFor) {
			this.checkAllSelected();
		}
	},
	
	checkBoxClickOptions: function(event) {
		// Get the clicked list item
		var label = event.findElement('label');
		if (label && label.htmlFor) {
			this.checkAllSelected();
			if (label.htmlFor.indexOf("ActivityLocation") >= 0 || label.htmlFor.indexOf("Citizenship") >= 0) {
				this.selectAdditional(event, label);
			} else {
				this.selectSingle(event, label);
			}
		}
	},
	
	selectAdditional: function(event, label) {
		var element = $(label.htmlFor);
		var id = element.identify();		
		if (id.indexOf("Unrestricted") >= 0 || id.indexOf("Unspecified") >= 0 || id.indexOf("United_States") >= 0 || id.indexOf("Canada") >= 0 || id.indexOf("United_Kingdom") >= 0 || id.indexOf("Australia") >= 0) {
			if (id.indexOf("_0") > 0) {
				var idDup = id.replace("_0", "");
				$(idDup).checked = $(id).checked;
			} else {
				var idParent = id+"_0";
				$(idParent).checked = $(id).checked;
			}
		}					
	},
	
	selectSingle: function(event, label) {
		var element = $(label.htmlFor);
		var id = element.identify();
		
		this.selectChildren(id,element.checked);
		this.selectParent(id,element.checked);
	},
	
	selectParent: function(child, checked) {
		var parent = this.options[child].parent;
		
		if (parent) {
			if (checked) { // check if all siblings are also checked, and if so check the parent
				var numChildren = this.options[parent].children.length;
				var allChecked = true;
				for(var i=0; i<numChildren; i++) {
					var sibling = this.options[parent].children[i];
					if (!$(sibling).checked) {
						allChecked = false;
						break;
					}
				}
				if (allChecked) {
					$(parent).checked = true;
					this.selectParent(parent, checked);
				}
			} else {
				$(parent).checked = false;
				this.selectParent(parent, checked);
			} 
		}
	},
	
	selectChildren: function(parent,checked) {
		var numChildren = this.options[parent].children.length;
		for(var i=0; i<numChildren; i++) {
			var child = this.options[parent].children[i];
			$(child).checked = checked;
			this.selectChildren(child,checked);
		}
	},
	
	selectAll: function(event) {
		var checkbox = event.element();
		var elementId = 'selectAll_' + this.limiterType;
		if(checkbox.checked) {		
			this.getControlledCB().each(function(n){n.checked = true;});
			this.changeLinkState(elementId, true);
		} else {
			this.getControlledCB().each(function(n){n.checked = false;});
			this.changeLinkState(elementId ,false);		
		}
		//On Advanced Search page, run click event handler.
		if (window.selectLimitersEvent){
			window.selectLimitersEvent.handleChange();
		}
		return false;
	},
	
	changeLinkState: function(elementId, allSelected) {
		if(allSelected) {
			$(elementId).checked = true;
			$(this.selectAllTextId).show();
			$(this.deselectAllTextId).hide();
		} else {
			$(elementId).checked = false;
			$(this.deselectAllTextId).show();
			$(this.selectAllTextId).hide();
		}
	},
	
	checkAllSelected: function(event) {
		var allSelected = true;
		var allDeselected = true;
		var elementId = 'selectAll_' + this.limiterType;
		this.getControlledCB().each(function(n) {
			allSelected &= n.checked;
			allDeselected &= !n.checked;			
		});
		this.changeLinkState(elementId, allSelected);		
	},
	
	getControlledCB: function(event) {
		if (!this.controlledCB)
			this.controlledCB = $$('input.option_' + this.limiterType);
		return this.controlledCB;
	}
});

Tapestry.Initializer.searchLimitersCheckboxGroup = function(spec) {
	new SearchLimitersCheckboxGroup(spec);
};

/* /assets/r20131.3.2-4/app/components/search/ToggleHitHighlighting.js */;
var ToggleHitHighlighting = Class.create(
{
	
	initialize: function(spec) {
		this.toggleLink = $(spec.toggleLink);
		this.turnOnText = spec.turnOnText;
		this.turnOffText = spec.turnOffText;
		this.hitHighlightingOn = spec.hitHighlightingOn;
		this.callbackUrl = spec.callbackUrl;
		this.setupHitHighlighters();
		this.toggleLink.observe('click', this.onToggleClick.bindAsEventListener(this));
	},
	
	onToggleClick: function(theEvent) {
		Event.stop(theEvent);
		var string = !this.hitHighlightingOn;
		this.hitHighlightingOn = string;
		this.setupHitHighlighters();
		new Ajax.Request(this.callbackUrl, {
			method: 'post',
			parameters: {'hitOn' : this.hitHighlightingOn},
			onSuccess: function(t) {
			}.bind(this),
			onFailure: function(t){
			}.bind(this)
		});
	},
	
	setupHitHighlighters: function() {
		this.toggleLink.update(this.hitHighlightingOn ? this.turnOffText : this.turnOnText);
		if (this.hitHighlightingOn) {
			this.addHitHighlighting();
		}
		else {
			this.removeHitHighlighting();
		}
	},
	
	addHitHighlighting: function() {
		var hitSpans = $$('span.hit');
		var i = 0;
		hitSpans.each(function(hitSpan) {
			hitSpan.style.backgroundColor = '#F4E99D';
			hitSpan.style.color = '#000000';
		}, this);
	},
	
	removeHitHighlighting: function() {
		var hitSpans = $$('span.hit');
		hitSpans.each(function(hitSpan) {
			hitSpan.style.backgroundColor = '#FFFFFF';
			hitSpan.style.color = '#525252';
		});
	}
	
	
});

Tapestry.Initializer.toggleHitHighlighting = function(spec)
{
	new ToggleHitHighlighting(spec);
}
/* /assets/r20131.3.2-4/app/components/search/SmartSearchResults.js */;
var SmartSearchResults = Class.create({
	initialize: function(spec) {
		this.viewAllId = spec.viewAllId;
		this.viewAll = $(this.viewAllId);
		
		this.viewAll.observe('click', this.updateContent.bindAsEventListener(this));
	},
	
	updateContent: function(spec) {
		var smartSearchOverlay = $('smartSearchOverlayResults');
		var isUpdated = smartSearchOverlay.readAttribute('updated');
		if (isUpdated == 'false') {
			smartSearchOverlay.update($('smartSearchProgressive').innerHTML);
			smartSearchOverlay.writeAttribute('updated', 'true');
		}
	}
});

Tapestry.Initializer.smartSearchResults = function(spec) {
	new SmartSearchResults(spec);
};

var SmartSearchResultsLink = Class.create({
	
	initialize: function(spec) {
		this.hideSmartSearchResultsLink = $(spec.hideSmartSearchResultsLinkId);
		this.hideSmartSearchResultsLink.observe('click', this.hideResults.bindAsEventListener(this));
	},
	
	hideResults: function(spec) {
		var smartEle = $('smartSearchProgressive');
		if(smartEle) {
			if (smartEle.visible()) {
				smartEle.hide();
				$('viewAll').hide();
			} else {
				smartEle.show();
				detectDivOverflow(52);
			}
		}
	}
	
});

Tapestry.Initializer.smartSearchResultsLink = function(spec) {
	new SmartSearchResultsLink(spec);
};

		




/* /assets/r20131.3.2-4/app/components/search/SearchRunningWarning.js */;
var timeout=4000;
var SearchRunningWarning = Class.create(
{
	initialize: function()
	{
		var searchForm = $('searchForm');
		if (searchForm)
		{
			searchForm.observe('submit', this.onSubmit.bindAsEventListener(this));
			searchForm.observe('pq:time', this.onSubmit.bindAsEventListener(this));
		}
		var performSearchForm = $('performSearchForm');
		if (performSearchForm)
		{
			performSearchForm.observe('submit', this.onSubmit.bindAsEventListener(this));
			performSearchForm.observe('pq:time', this.onSubmit.bindAsEventListener(this));
		}
		var combineTextForm = $('combineTextForm');
		if (combineTextForm)
		{
			combineTextForm.observe('submit', this.onSubmit.bindAsEventListener(this));
			combineTextForm.observe('pq:time', this.onSubmit.bindAsEventListener(this));
		}
		var selectDateForm = $('selectDateForm');
		if (selectDateForm)
		{
			selectDateForm.observe('submit', this.onSubmit.bindAsEventListener(this));
			selectDateForm.observe('pq:time', this.onSubmit.bindAsEventListener(this));
		}

		var cancelSearch = $('cancelSearch');
		if (cancelSearch)
		{
			$('cancelSearch').observe('click', this.onCancel.bindAsEventListener(this));
		}
		document.observe('click', this.onClick.bindAsEventListener(this));
		document.observe('pq:rerunSearch', this.onSubmit.bindAsEventListener(this));
	},
	onClick: function(event) {
		if (event.target.id.indexOf("rerunsearchlink") != -1)
		{
			if (event.isLeftClick() || event.button == 0)
			{
				startSwirlTimer();
			}
		}
	},
	onSubmit: function(event) {
		startSwirlTimer();
	},
	onCancel: function(event) {
		if (!Prototype.Browser.IE) 
		{
			window.stop();
		}
		else 
		{
			document.execCommand("Stop");
		}
		Overlay.box.hideOverlay('timeOutSwirl');
		event.stop();
	}
});

Tapestry.Initializer.searchRunningWarning = function()
{
	new SearchRunningWarning();
};

var runningTimer = false;
function startSwirlTimer() {
	runningTimer = true;
	setTimeout(function() {showSwirlTimer();}, timeout);
};
function showSwirlTimer() {
	if (runningTimer==true)
	{
		Overlay.box.showOverlay('timeOutSwirl');
	}
};
function stopSwirlTimer() {
	runningTimer = false;	
}



/* /assets/r20131.3.2-4/app/components/search/PopupSubjectList.js */;
var PopupDatabaseList = Class.create(
{
	initialize: function(config) {
		this.resetUrl = config.resetUrl;
		this.doReset = true;
		this.databaseOpenLayer = $('databaseOpenLayer');
		if(this.databaseOpenLayer){
				this.databaseOpenLayer.observe('prototip:shown',this.setHiddenObserver.bindAsEventListener(this));
			}
		},
	reset:function(pageName){
		if(this.doReset){
			new Ajax.Request(this.resetUrl,
					{
								method: 'post',
								onFailure: function(t)
								{
									alert('Error communicating with the server');
								},
								onException: function(t, exception)
								{
									alert('Exception communicating with the server');
								},
								onSuccess: function(t)
								{
									if(pageName!=null){
										window.location=this.databasePageUrl;
									}
								}.bind(this)
							});
			
		}
	},
	setHiddenObserver : function(event) {
		if (Prototype.Browser.IE && $('pdfEmbedDivId') != null) {
				$('pdfEmbedDivId').hide();
			}
		
		document.observe('prototip:hidden', function() {
			
			$('databaseOpenLayer').show();
			$('dbCloseSpanId').hide();

			if (Prototype.Browser.IE && $('pdfEmbedDivId') != null) {
				$('pdfEmbedDivId').show();
			}
			popupDatabaseList.reset(null);

		});
	},
	setResetFlag:function(flag){
		this.doReset = flag;
	}
	
	

});

var popupDatabaseList;
Tapestry.Initializer.popupDatabaseList = function(spec)
{
	popupDatabaseList = new PopupDatabaseList(spec);
}

function toggleSubject(item, code) {
	Element.extend(item);
	if (item.hasClassName('indicator_expand')) {
		item.removeClassName('indicator_expand').addClassName('indicator_collapse');
		$('dblist_' + code).show();
	} else {
		item.removeClassName('indicator_collapse').addClassName('indicator_expand');		
		$('dblist_' + code).hide();
	}
}

function toggleSubjectList(item, code) {
	Element.extend(item);
	if (item.hasClassName('indicator_expand')) {
		item.removeClassName('indicator_expand').addClassName('indicator_collapse');
		$('dblist_subjects_' + code).show();
	} else {
		item.removeClassName('indicator_collapse').addClassName('indicator_expand');		
		$('dblist_subjects_' + code).hide();
	}
}

function toggleView() {
	$('popup_sv_names').toggle();
	$('popup_sv_subjects').toggle();
}

function toggleViewList() {
	$('popup_sv_names_list').toggle();
	$('popup_sv_subjects_list').toggle();
}
/* /assets/r20131.3.2-4/app/components/search/BasicSearchBox.js */;
var BasicSearchBox = Class.create(
{
	initialize: function()
	{
		if(Prototype.Browser.IE) {			
			document.observe('autocomplete:open', this.updateStyle.bindAsEventListener(this));
		    document.observe('autocomplete:close', this.rollbackStyle.bindAsEventListener(this));
		}
			
	},	
	updateStyle: function()
	{		
		var sortElm = $('drp_sortResults');
		this.changeStyle(sortElm, false);
		var itemNumElm = $('drp_results_per_page');
		this.changeStyle(itemNumElm, false);
		var filteredByElm = $$('#resultsFilteredDisplay div.optionsPanel');
		if (filteredByElm != null) {
			this.changeStyle(filteredByElm[0], false);
		}		
		var resultsPanelElm = $$('#resultsLeftPanel div.white-panel');
		if (resultsPanelElm != null) {
			this.changeStyle(resultsPanelElm[0], false);
		}
	},
	rollbackStyle: function()
	{
		var sortElm = $('drp_sortResults');
		this.changeStyle(sortElm, true);
		var itemNumElm = $('drp_results_per_page');
		this.changeStyle(itemNumElm, true);
		var filteredByElm = $$('#resultsFilteredDisplay div.optionsPanel');
		if (filteredByElm != null) {
			this.changeStyle(filteredByElm[0], true);
		}		
		var resultsPanelElm = $$('#resultsLeftPanel div.white-panel');
		if (resultsPanelElm != null) {
			this.changeStyle(resultsPanelElm[0], true);
		}
	},
	changeStyle: function(elm, isRollBack) {
		if (elm != null) {
			if (isRollBack) {
				elm.setStyle({zIndex: 1});
			} else {
				elm.setStyle({zIndex: -1});
			}
		}
	}
});

Tapestry.Initializer.basicSearchBox = function()
{
	new BasicSearchBox();
}


/* /assets/r20131.3.2-4/app/components/search/SmartSearchDetectOverflow.js */;
/*
 * Smart search 6627 AC8a - search results need to reasonably fit two lines of display. This JS
 * checks the height of smart search panel if there is a overflowing of the element then the "View All" 
 * link will be hidden.
 * @author Kun Cai
 */
function detectDivOverflow(height){
	var smartSearchProgressive = $('smartSearchProgressive');
	if (smartSearchProgressive && smartSearchProgressive.getHeight() > height ) { 
		$('viewAll').show();
	}
}
/* /assets/r20131.3.2-4/app/components/search/BrowseIndexQueryBuilderThesaurusAware.js */;
var BrowseIndexQueryBuilderThesaurusAware = Class.create({		
	initialize: function(spec) {
		this.trigger = '';
		document.observe('pq:fillQueryTerm', this.autoGrowFromEvent.bindAsEventListener(this));
		var nameTextArea = 'queryTermFieldTextArea_';
		var nameTextBox = 'queryTermField_';
		
		var queryTermFieldTextArea = $('queryTermFieldTextArea');
		if (queryTermFieldTextArea){
			queryTermFieldTextArea.observe('change', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermFieldTextArea.observe('keyup', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermFieldTextArea.observe('keydown', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermFieldTextArea.observe('mouseleave', this.autoGrowFromEvent.bindAsEventListener(this));
			if(!Prototype.Browser.IE)
				queryTermFieldTextArea.addEventListener ("input", this.autoGrowFromEvent.bindAsEventListener(this), true);
			if (queryTermFieldTextArea.value.length != 0) {
				this.trigger = queryTermFieldTextArea;
				this.autoGrow(this);
			}
		}
		var queryTermField = $('queryTermField');
		if(queryTermField){
			queryTermField.observe('change', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermField.observe('keyup', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermField.observe('keydown', this.autoGrowFromEvent.bindAsEventListener(this));
			queryTermField.observe('mouseleave', this.autoGrowFromEvent.bindAsEventListener(this));
			if(!Prototype.Browser.IE)
				queryTermField.addEventListener ("input", this.autoGrowFromEvent.bindAsEventListener(this), true);
			if (queryTermField.value.length != 0){
				this.trigger = queryTermField;
				this.autoGrow(this);
			}
		}
		for (var i = 0; i < 9; i++) {
			this.trigger = $(nameTextArea + i);
			if (this.trigger){
				this.trigger.observe('change', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('keyup', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('keydown', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('mouseleave', this.autoGrowFromEvent.bindAsEventListener(this));
				if(!Prototype.Browser.IE)
					this.trigger.addEventListener ("input", this.autoGrowFromEvent.bindAsEventListener(this), true);
				if (this.trigger.value.length != 0) {
					this.autoGrow(this);
				}
			}
		}
		for (var j = 0; j < 9; j++) {
			this.trigger = $(nameTextBox + j);
			if (this.trigger){
				this.trigger.observe('change', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('keyup', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('keydown', this.autoGrowFromEvent.bindAsEventListener(this));
				this.trigger.observe('mouseleave', this.autoGrowFromEvent.bindAsEventListener(this));
				if(!Prototype.Browser.IE)
					this.trigger.addEventListener ("input", this.autoGrowFromEvent.bindAsEventListener(this), true);
				if (this.trigger.value.length != 0) {
					this.autoGrow(this);					
				}
			}
		}
	},
	
	autoGrowFromEvent: function(event) {
		if(event.memo) {
			this.trigger = $(event.memo);
			this.autoGrow(event);
		}else{
			el = Event.element(event);
			this.trigger = $(el.identify());
			this.autoGrow(event);
		}
		var tHeight = this.trigger.getHeight();
		this.trigger.scrollTop=tHeight; // code to scroll down
		return false;
	},
	
	
    autoGrow: function(event) {
        el = this.trigger;
        if (el && el.scrollHeight > el.offsetHeight) {
        	var maxrows = 4;
        	if (Prototype.Browser.IE)
        		maxrows = 5;
            while(el.scrollHeight > el.offsetHeight && el.rows < maxrows){
              el.rows++;
            }
            if(el.scrollHeight > el.offsetHeight && el.rows == maxrows){
              el.setStyle({overflowY:"scroll"});
            }
        } else {
            if(el && el.rows > 1){
              el.rows = 1;
              el.setStyle({overflowY:"hidden"});
              this.autoGrow(event);
            }
        }
        
        setTimeout(this.positionAutocomplete.bind(this), 3);
	}, 
	
	positionAutocomplete: function(event) {
		var element = this.trigger;
		
		var suggBoxTopOffset = Element.cumulativeOffset(element)[1] + element.getHeight();
		var suggBox = element.next("div.t-autocomplete-menu");
		
		if(suggBox && !(Prototype.Browser.IE && parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) == 8)){
			suggBox.setStyle({top: suggBoxTopOffset+"px"});
		}
		
	}
});

Tapestry.Initializer.browseIndexQueryBuilderThesaurusAware = function(spec) {
	new BrowseIndexQueryBuilderThesaurusAware(spec);
};

/* /assets/r20131.3.2-4/app/components/search/DisplayDatabaseList.js */;
function showDisplayDatabaseList(id) {
	$('view_list_' + id).toggle();
	$('hide_list_' + id).toggle();
	Effect.toggle('all_database_list_' + id, 'blind', {
		duration : 0.9
	});

	return false;
}
/* /assets/r20131.3.2-4/app/components/search/ExpandedBasicSearchBox.js */;
var ExpandedBasicSearchBox = Class.create(
{
	initialize: function()
	{	var queryTermFieldTextArea = $('searchTerm');
		this.trigger ='';
		if(Prototype.Browser.IE) {			
		    this.IEVersion = parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5));
		}
		queryTermFieldTextArea.observe('change', this.autoGrowFromEvent.bindAsEventListener(this));
		queryTermFieldTextArea.observe('keyup', this.autoGrowFromEvent.bindAsEventListener(this));
		queryTermFieldTextArea.observe('keydown', this.autoGrowFromEvent.bindAsEventListener(this));
		queryTermFieldTextArea.observe('mouseleave', this.autoGrowFromEvent.bindAsEventListener(this));
		if(!Prototype.Browser.IE)
			queryTermFieldTextArea.addEventListener ("input", this.autoGrowFromEvent.bindAsEventListener(this), true);
		
		this.viewer = new Draggable('dragIcon', {
			constraint: 'vertical',
			snap: function(x,y) {
			      return[
			       x=0,
			       y > 30 ? y : 30];
			    },
			onDrag : function(){
			    	var coordinates = $('dragIcon').viewportOffset();
			    	var coordinates2 = $('searchTerm').viewportOffset();
			    	var height = $('searchTerm').getHeight();
			    	var maxrowHeightFF = 39;
			    	var dragIconHeight =9;
			    	if(height=='')
			    		height=maxrowHeightFF;	
			    	if (coordinates[1] > (coordinates2[1]+height - dragIconHeight)){
			    		var diff = coordinates[1]-(coordinates2[1]+ height - dragIconHeight);
			    		$('searchTerm').style.height = (height + diff)+'px';
			    	}
			    	if (coordinates[1] < (coordinates2[1]+ height - dragIconHeight)){
			    		var diff = (coordinates2[1]+ height - dragIconHeight) - coordinates[1];
			    		$('searchTerm').style.height = (height - diff)+'px';
			    	}
			    },
			onEnd : function(){
				$('searchTerm').scrollTop = $('searchTerm').scrollHeight;	
			    }		
			});	
	},	
	autoGrowFromEvent: function(event) {
		if(event.memo) {
			this.trigger = $(event.memo);
			this.autoGrow(event);
		}else{
			el = Event.element(event);
			this.trigger = $(el.identify());
			this.autoGrow(event);
		}
		var tHeight = this.trigger.scrollHeight;
		this.trigger.scrollTop=tHeight; // code to scroll down
		return false;
	},
    autoGrow: function(event) {
		var maxrowHeightFF = 39;
		var maxRowHeightIE = 38;
		var singleRowHeight = 19.5;
        el = this.trigger;
        if (el && el.scrollHeight > el.offsetHeight) {
            while((el.scrollHeight > el.offsetHeight) && el.getHeight() < maxrowHeightFF){	
              el.style.height=maxrowHeightFF + 'px';
              $('dragIcon').style.display = "block";
            }
            if(el.scrollHeight > el.offsetHeight){
                el.setStyle({overflowY:"scroll"});
              }
           
        } else {
            if(el && (el.style.height==(maxrowHeightFF + 'px')||el.style.height==(maxRowHeightIE + 'px'))){
              el.style.height = singleRowHeight + 'px';
              $('dragIcon').style.display = "none";
              el.setStyle({overflowY:"hidden"});
              this.autoGrow(event);
            }
        }
        
        var suggBox = el.next("div.t-autocomplete-menu");
        if(Prototype.Browser.IE && (this.IEVersion < 8)){
        	if(suggBox) autocompleteTimer = setTimeout("positionAutocompleteBasicSearch(el)", 3);
        } else {
			if(suggBox) suggBox.setStyle({top: "auto"});
        }
	}
});

Tapestry.Initializer.expandedBasicSearchBox = function()
{
	new ExpandedBasicSearchBox();
};


function positionAutocompleteBasicSearch(element){
	var suggBoxTopOffset = element.getHeight();
	var suggBox = element.next("div.t-autocomplete-menu");
	if(suggBox) suggBox.setStyle({top: suggBoxTopOffset+"px"});
}

function autoGrowOnLoad(){
	var maxrowHeightFF = 39;
	var maxRowHeightIE = 38;
	var singleRowHeight = 19.5;
	el = $('searchTerm');
	if (el && el.scrollHeight > el.offsetHeight) {
		if((el.scrollHeight > el.offsetHeight) && el.getHeight() < maxrowHeightFF){	
			el.style.height=maxrowHeightFF + 'px';
			$('dragIcon').style.display = "block";
        }
        if(el.scrollHeight > el.offsetHeight){
        	el.setStyle({overflowY:"scroll"});
         }
      
	} else {
        if(el && (el.style.height==(maxrowHeightFF + 'px')||el.style.height==(maxRowHeightIE + 'px'))){
        	el.style.height = singleRowHeight + 'px';
        	$('dragIcon').style.display = "none";
        	el.setStyle({overflowY:"hidden"});
	       }
    	}
   
}
document.observe("dom:loaded", function() {
	autoGrowOnLoad(); 
	if ($('searchTerm')) {
		var tHeight = $('searchTerm').scrollHeight;
		$('searchTerm').scrollTop=tHeight;
	};
});

/* /assets/r20131.3.2-4/app/components/search/RecentSearchTabView.js */;
var RecentSearchTabView = Class.create( {
	initialize : function(spec) {
		this.resultSize = spec.resultSize;
		this.collapse = spec.collapse;
		this.expand = spec.expand;
		this.showAltMsg = spec.showAltMsg;
		this.hideAltMsg = spec.hideAltMsg;
		this.cssName = 'indicators_base_sprite ';
	},
	toggleShowHideLink : function(event) {
		this.handleShowHide(this.doShow);
	},
	
	handleShowHide : function(doShow) {
		for ( var index = 1; index <= this.resultSize+1; index++) {
			if($('recentSearchItem_' + index)){
				var link = $('recentSearchItem_' + index).className;
				if (doShow && (link == (this.cssName + this.expand))) {
					this.toggleRecentSearchItem(index, true);
				} else if (!doShow && (link == (this.cssName + this.collapse))) {
					this.toggleRecentSearchItem(index, true);
				}
			}
		}
		
		return true;
	},
	toggleRecentSearchItem : function(index, isAll) {
		var childDiv = $('recentSearchItem_showDetails_' + index);
		Effect.toggle(childDiv, 'blind', {
			duration :0.9
		});
		var linkText = $('recentSearchItem_' + index);
		if (linkText) {
			var text = linkText.className;
			if (text == (this.cssName + this.expand)) {
				linkText.className = this.cssName + this.collapse;
				linkText.title = this.hideAltMsg;
			} else {
				linkText.className = this.cssName + this.expand;
				linkText.title = this.showAltMsg;
			}
		}
		this.checkAllRecentSearchItem(isAll);
	},
	
	checkAllRecentSearchItem : function(isAll) {
		var totalCount = 0;
		var expendedCount = 0;
		var collapseCount = 0;
		for ( var index = 1; index <= this.resultSize+1; index++) {
			var linkText = $('recentSearchItem_' + index);
			if (linkText) {
				totalCount++;
				var text = linkText.className;
				if (text == (this.cssName + this.expand)) {
					expendedCount++;
				} else {
					collapseCount++;
				}
			}
		}
		if(!isAll && (totalCount == expendedCount || totalCount == collapseCount)){
			if(totalCount == expendedCount){
				$$("a[name='hideDetailsLink']").hide();
				$$("a[name='showDetailsLink']").show();
			} else {
				$$("a[name='hideDetailsLink']").show();
				$$("a[name='showDetailsLink']").hide();
			}
			
		}
		
	}
});

var recentSearchTabView;
Tapestry.Initializer.recentSearchTabView = function(spec) {
	recentSearchTabView = new RecentSearchTabView(spec);
};

/* /assets/r20131.3.2-4/app/components/search/RecentSearchItem.js */;
var resultsList ={};
var running = false;
function updateRecentSearchItems(delay) {
	if (running) {
		return;
	}
	running = true;
	
	var hasPending = false;
	var hasError = false;
	for (var i in resultsList) {
		var result = resultsList[i];
		if (result.status == 'Pending') {
			hasPending = true;
			if (hasError)
				break;
		}
		if (result.status == 'Error') {
			hasError = true;
			if (hasPending)
				break;
		}
	}
	
	if (!isEmptyObject(resultsList) && (hasPending || hasError)) {
		var recCountUrl = resultsList.recordCountUrl;
		new Ajax.Request(recCountUrl, {
			method: 'get',
			onSuccess: function(data) {
				var updated = false;
				if (data.responseJSON) {
					var updates = data.responseJSON;
					for (var resultRId in updates) {
						if (resultRId == 'deDupMessagingCSSClass') {
							result = updates[resultRId];
							$('duplicationRemovalMessages').className = result;
						} else if (resultRId.substring(0,2) == "R_") {
							result = updates[resultRId];
							if (result.count != -1 || result.error || result.errorHeaderMessage) {
								var resultId = resultRId.substring(2);
								var searchItem = resultsList[resultRId];
								if (searchItem && (searchItem.status == 'Pending' || (searchItem.status == 'Error' && !searchItem.errorDisplayed))) {
									updated = true;
									if (result.error || result.errorHeaderMessage) {
										var updateElement = $("numResults." + resultId);
										if (updateElement.up("a")) {
											updateElement = updateElement.up("a");
										}
										var link;
										if (result.errorHeaderMessage == 'Timeout') {
											link = result.errorHeaderMessage;
										} else {
											link = "Error";

										}
										updateElement.replace(link);
										searchItem.status = "Error";
										searchItem.errorDisplayed = true;
									} else {
										var newVal = result.countWithContext;
										$("numResults." + resultId).update(newVal);
										searchItem.status = newVal;
									}
								}
							}
						}
					}
				}
				running = false;
				if (hasPending) {
					if (updated) {
						setTimeout(function() {updateRecentSearchItems(delay);}, delay);
					} else {
						setTimeout(function() {updateRecentSearchItems(delay*1.25);},delay * 1.25);	
					}
				}
			},
			onFailure: function(data) {
				running = false;
				setTimeout(function() {updateRecentSearchItems(delay*2);},delay*2);
			}
		});
	}
}

function isEmptyObject(obj) {
	for ( var prop in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, prop)) {
			return false;
		}
	}
	return true;
}

function toggleRecentSearchDetails(index) {
	Effect.toggle('recentSearchItem_details_'+index,'blind',{duration: 0.9});
	$('recentSearchItem_showDetails_'+index).toggle();
	Effect.toggle('recentSearchItem_hideDetails_'+index);
}
document.observe("dom:loaded", function() {setTimeout(function() {updateRecentSearchItems(5000);}, 3000);});
/* /assets/r20131.3.2-4/app/components/resultsfiltering/ActiveButtons.js */;
function changeButton(activate, deactiv1, deactiv2) {
	
	$(activate).style.fontWeight='bold';
	$(activate).style.color='#000000';
	$(activate).parentNode.blur();
	$(deactiv1).style.fontWeight='normal';
	$(deactiv1).style.color='#00569F';
	$(deactiv2).style.fontWeight='normal';
	$(deactiv2).style.color='#00569F';
	
}
/* /assets/r20131.3.2-4/app/components/thesaurus/ThesaurusBrowse.js */;
Tapestry.Initializer.fillToForm = function(spec) {
	function selectOptionForField(selectFieldId, mn) {
		var elem = window.opener.document.getElementById(selectFieldId);
		var opt = elem.select('option[value="'+ mn +'"]');
		if(opt && opt.length > 0) {
			elem.value = mn;
		}
		var rowId = 0;
		var pos = selectFieldId.indexOf("_");
		if(pos > -1) {
		   rowId = parseInt(selectFieldId.substring(pos+1)) + 1;
		}
		var spanElem = 'browseIndexSpanrow' + rowId + mn;
		var hiddenElem = 'lastSelectedrow'+rowId;
		try {
			window.opener.document.getElementById(spanElem).style.display = 'inline';
			window.opener.document.getElementById(hiddenElem).value = spanElem;
		} catch(err) {   // leaving field class as it is for some exceptional cases like MESH and overriding the field value 
			var temp = elem.value;
			if (!temp.blank()) {
				window.opener.document.getElementById(selectFieldId).value = temp;
			}
			return;
		}
	}

	// append to the same line of search term.
	function doAppendValue(newValue) {
		var targetElement = window.opener.document.getElementById(spec.indexSearchTextID);
		if (!targetElement) {
			targetElement = window.opener.document.getElementsByName(spec.indexSearchTextID);
			if (targetElement) {
				targetElement = targetElement[0];
			}			
		}
		var currentValue = targetElement.value;
		var carret = getCaret(targetElement);
		if (currentValue.length == 0) {
			targetElement.value = newValue;
		} 
		else if (spec.addInNewLine){
			targetElement.value = currentValue + 'AND ' + newValue + '\n';
		} 
		else {
			var valueToSet;
			var offset = newValue.length + 4;
			if(spec.requestedPage != 'EditStrategy'){
				if(currentValue.length != 0 ){
					if (carret == 0) {
						valueToSet = newValue+ ' OR '+ currentValue;
						carret = offset;
					} else {
						valueToSet = currentValue.substr(0,carret)+' OR '+ newValue + currentValue.substr(carret,currentValue.length);
						carret = carret + newValue.length;
					}
				}
				else {
					valueToSet = currentValue + ' OR ' + newValue;
					carret = carret + newValue;
				}			
				targetElement.value = valueToSet;
			}else{
				if (window.opener.document.selection){
					targetElement.focus();
					var range = window.opener.document.selection.createRange();
					range.text = newValue;
				}else
					targetElement.value = currentValue.substr(0,carret)+' '+newValue+' '+ currentValue.substr(carret,currentValue.length);
				
				carret = carret + newValue.length;
				
			}
			if (targetElement.setSelectionRange) {
				targetElement.setSelectionRange(carret, carret);
				targetElement.focus();
			} else if (targetElement.createTextRange) {				
				var range = targetElement.createTextRange();
				range.collapse(true);
				range.moveEnd('character', carret);
				range.moveStart('character', carret);
				range.select();
			}
		}
	}
	function getCaret(ctrl) {
		var CaretPos = 0;	// IE Support
		if (window.opener.document.selection) {
			ctrl.focus();
			var Sel = window.opener.document.selection.createRange();
			Sel.moveStart ('character', -ctrl.value.length);
			CaretPos = Sel.text.length;
		}
		// Firefox support
		else if (ctrl.selectionStart || ctrl.selectionStart >= 0){
			CaretPos = ctrl.selectionStart;
		}
		return (CaretPos);
	}	

	// update the fields in search form.
	function doUpdateSearchTextField(newValue) {
		if (spec.appendValues) {
			doAppendValue(newValue);
		} else {
			window.opener.document.getElementById(spec.indexSearchTextID).value = newValue;
			//$(spec.indexSearchTextID).value = newValue;
		}
	}
	
	//show thesaurus text area and hide the standard search text input field.
	function showHideThesaurusTextArea(rowNum) {
		var textAreaId = window.opener.document.getElementById('textArea_' + rowNum);
		var textFieldId = window.opener.document.getElementById('textField_' + rowNum);
		//show/hide the correct field.
		if ($(textAreaId)) {
			textAreaId.style.display = 'block';
			//$(textAreaId).show();
			if ($(textFieldId)) {
				//$(textFieldId).hide();
				textFieldId.style.display = 'none';
			}
		}
	}

	var fieldValue = $F('updateFieldValue');
	if (spec.commandLine) {
		doUpdateSearchTextField(fieldValue);
	} else {
		var actualRowNum;
		if (spec.rowNum == null || spec.rowNum =='' || spec.rowNum ==' ') {
			actualRowNum = '0';
		} else {
			actualRowNum = parseInt(spec.rowNum) + 1;
		}
		var addLink = window.opener.document.getElementById('addRowLink');
		// Old code does this awkward search for the existence of the <select>
		// through the form. Should be doable using just $('fieldSelect');
		var selectFieldExists = window.opener.document.getElementById(spec.selectFieldId);
		if (spec.appendValues) {
			doAppendValue(fieldValue);
			// If the <select> is present, then use the FAST search field name
			// to try and find a match in the options listed in the <select>.
			if (selectFieldExists) {
				selectOptionForField(spec.selectFieldId, spec.searchFieldName);
			}
		} else {
			if (spec.overwrite) {
				showHideThesaurusTextArea(spec.rowNum);
				if (selectFieldExists) {
					selectOptionForField(spec.selectFieldId, spec.searchFieldName);
					window.opener.document.getElementById('AdvanceQuery' + actualRowNum).value = 'FROM_THESAURUS';
				}
				window.opener.document.getElementById(spec.indexSearchTextID).value = fieldValue;
				/*var count = fragCount.getVisibleFragCount();
				if (spec.indexSearchTextID.indexOf('_') != -1) {
					var row = spec.indexSearchTextID.substring(spec.indexSearchTextID.indexOf('_')+ 1, spec.indexSearchTextID.length);
					if (row == (count - 1)) {
						$(addLink).simulate('click');
					}
				}*/
				fireCustomEvent(spec.indexSearchTextID);
			} else {
				var textAreaId =  'queryTermFieldTextArea';
				var textFieldId =  'queryTermField';
				var selectId = 'fieldsSelect';
				var textArea = window.opener.document.getElementById(textAreaId);
				var textField = window.opener.document.getElementById(textFieldId);
				for ( var i = 0;; i++) {
					if (!$(textField) || !$(textArea)){
						break;
					}						
					if (textField.value.length == 0 && textArea.value.length == 0) {
						//simulate click event to add one more row in the form.
						var count = fragCount.getVisibleFragCount();
						if ($(addLink) && i > count && i <= 9) {
							$(addLink).simulate('click');
						}
						
						//show text area for thesaurus.
						if (textAreaId.indexOf('_') != -1) {
							showHideThesaurusTextArea(textAreaId.substring(textAreaId.indexOf('_')+ 1, textAreaId.length));
						} else {
							showHideThesaurusTextArea('');
						}
						selectOptionForField(selectId, spec.searchFieldName);
						textArea.value = fieldValue;
						fireCustomEvent(textAreaId);
						window.opener.document.getElementById('AdvanceQuery' + i).value = 'FROM_THESAURUS';
						break;
					} else {
						if (spec.requestedPage == 'DataReports') {
							selectOptionForField(selectId, spec.searchFieldName);
							doAppendValue(fieldValue);
							break;
						}
						textAreaId =  'queryTermFieldTextArea_' + i;
						textFieldId =  'queryTermField_' + i;
						selectId = 'fieldsSelect_' + i;
						textArea = window.opener.document.getElementById(textAreaId);
						textField = window.opener.document.getElementById(textFieldId);
					}
				}
			}
		}		
	}
	window.close();
};

var ThesaurusBrowse = Class.create ({
	initialize: function(spec) {
		this.updateEventURL = spec.updateEventURL;
		// When the selected terms layer is closed, the terms selected zone is updated, so that the user sees the updated list during the second launch.
		if ($('selectedTermsLink')) {
			$('selectedTermsLink').observe('click', this.updateZone.bindAsEventListener(this));
		}
	},
	
	updateZone: function(event) {
		zoneObject = Tapestry.findZoneManagerForZone('selectedTermsZoneId');
		if(zoneObject != null) {
			zoneObject.updateFromURL(this.updateEventURL, "");
		}
	}
});

Tapestry.Initializer.thesaurusBrowse = function(spec) {
	new ThesaurusBrowse(spec);	
};

var ThesaurusSearchForm = Class.create ({
	initialize: function(spec) {
		var searchTermRadioButtons = $$('div#thesaurusSearchTermRadio input');
		if (searchTermRadioButtons.length == 2) {
			if (!searchTermRadioButtons[1].checked) {
				searchTermRadioButtons[0].checked = true;
			} else {
				showBeginsTextInFull(true);
			}
		}
	}
});

Tapestry.Initializer.thesaurusSearchForm = function(spec) {
	new ThesaurusSearchForm(spec);	
};

var fragCount = {
	getVisibleFragCount: function() {
		var count = 0; // count 
		for ( var k = 1; k <= 9; k++) { // figure out how many rows have been displayed.
			var rowFrag = 'row' + k + 'frag';
			if($(window.opener.document.getElementById(rowFrag)) && 
				$(window.opener.document.getElementById(rowFrag)).visible()) {
				count =  k;
			}
		}
		return count;
	}
};

function showLangChangeProgress() {
	if ($('progressterms')) {
		$('progressterms').show();
	}
}

function fireCustomEvent(targetField) {
	var fireLink = $(window.opener.document.getElementById(targetField));
	fireLink.fire.bind(fireLink).delay(1, 'pq:fillQueryTerm', targetField); 
	//window.opener.document.fire('pq:fillQueryTerm', targetField);
}

function filterDataForDisplayInList(content) {
	if (content.indexOf("subTerm_") != -1 && content.startsWith("subTerm_")) {
		var startIndexOf$$ = content.indexOf("$$");
		var indexOf_Field = content.indexOf("_", startIndexOf$$);
		return content.substring(indexOf_Field + 1, content.lastIndexOf("$$"));
	} else if (content.indexOf("qfTerm_") != -1
			&& content.startsWith("qfTerm_")) {
		var rawTermName = content.replace("qfTerm_", "")
				.replace("subTerm_", "");
		var parentTermId = rawTermName.substring(0, rawTermName
				.lastIndexOf("--"));
		var childId = rawTermName.substring(rawTermName.lastIndexOf("--") + 2);
		var displayQf = parentTermId.substring(0, parentTermId
				.lastIndexOf("$$"))
				+ ' -- ' + childId.substring(0, childId.lastIndexOf("$$"));
		return displayQf;
	} else {
		if (content != null && content.indexOf("$$") != -1) {
			return content.substring(0, content.indexOf("$$"));
		} else {
			return content;
		}
	}
}

function showUpdateProgress() {
	if ($('thesaurusUpdateFormDiv')) {
		$('thesaurusUpdateFormDiv').hide();
	}
	if ($('progressterms')) {
		$('progressterms').show();
	}
	if ($('ThesaurusSelectedTermsOverlay')) {
		$('ThesaurusSelectedTermsOverlay').hide();
	}
}

function showSubjectBrowse() {
	if ($('thesaurusOverlay')) {
		Overlay.box.hideOverlay();
	}
}

function showHideQualifiers(qualifier, showLink, hideLink) {
	var qualifierDisplay = $(qualifier).getStyle('display');
	if (qualifierDisplay == 'none') {
		$(qualifier).show();
		$(showLink).hide();
		$(hideLink).show();
	} else {
		$(qualifier).hide();
		$(showLink).show();
		$(hideLink).hide();
	}
}

// The Layer containing "%d selected terms" should follow the below rules
// On load of the page the layer shows 0 terms found with white background.
// A click on the check box will increase or decrease the value of terms in the layer and layer remains with white background.
// On mouse over, the layer, changes the layer background to blue, by calling showBlueLayer()
// On click, the selected terms layer will open by calling showSelectedItems() and the background of the layer is maintained to be blue.
// On mouse out of the layer, the blue background should turn to white, but this should happen only incase when the selected terms layer is not in open state.
// When the selected terms layer is open, the background of the layer should always be blue.
// On close of the selected terms layer, the background should change back to white by calling hideSelectedItems()
// When the Selected terms layer is open, then the terms in the theaurus browse are to be disabled. The terms should back be enabled on close of the selected terms layer.
/**
 * Shows the selected terms layer
 * Disables the terms in the thesaurus browse
 * Changes the background of "%d terms found" layout to blue.
 */
function showSelectedItems(){
	if ($('ThesaurusSelectedTermsOverlay')) {
		$('ThesaurusSelectedTermsOverlay').show();
		disableParentLayer();
		showBlueLayer();
	}
}

/**
 * Hides the selected terms layer
 * Enables the terms in the thesaurus browse
 * Changes the background of "%d terms found" layout to white.
 */
function hideSelectedItems(){
	if ($('ThesaurusSelectedTermsOverlay')) {
		$('ThesaurusSelectedTermsOverlay').hide();
	}
	enableParentLayer();
	hideBlueLayer();
}

function toggleSelectedItems(){
	if ($('ThesaurusSelectedTermsOverlay')) {
		var layerOpen = $('ThesaurusSelectedTermsOverlay').getStyle('display');
		if(layerOpen == 'block'){
			hideSelectedItems();
			return;
		}		
	}
	showSelectedItems();
}

/**
 * The white background of the layout "%d terms selected" is the class 'panel_base float_left smartsearch_panel'
 * The blue background of the layout "%d terms selected" is the class 'panel_base float_left panel_base toolbar_panel'
 * This method, hides the white layout and shows the blue layout
 */
function showBlueLayer(){
	$('seletesTermsLayer').className = "panel_base float_left panel_base toolbar_panel";
}

/**
 * The white background of the layout "%d terms selected" is the component 'panel_base float_left smartsearch_panel'
 * The blue background of the layout "%d terms selected" is the component 'panel_base float_left panel_base toolbar_panel'
 * This method, hides the blue layout and shows the white layout
 */
function hideBlueLayer(){
	$('seletesTermsLayer').className = "panel_base float_left smartsearch_panel";
}

// ParentLayer is defined in ThesaurusMainTerm.tml. Changing the class of this to "diabledText" and "", gives the text a grey and black color.
// normalParentCheckBox contains a selectable check box.
// disabledParentCheckBox contains a disabled check box.
// normalParentEventLink contains a event link.
// disabledParentEventLink contains a icon similar to event link.
/**
 * Disables the Terms in the thesaurus browse.
 * Changes the text color to grey, of the terms in ThesaurusMainTerm.tml
 * Disables the check box.
 * Replaces the event Link with a dummy link.
 */
function disableParentLayer(){
	document.getElementById("parentLayer").className = "disabledText";
	document.getElementById("instructions").className = document.getElementById("instructions").className + " disabledText";
	enableorDisableAllCheckBox(true);
    enableOrDisableEventLink(true);
  	if(! Prototype.Browser["WebKit"]) document.getElementById("thesaurusOverlayLayer").style.display = 'block';
}

/**
 * Enables the Terms in the thesaurus browse.
 * Changes the text color to black, of the terms in ThesaurusMainTerm.tml
 * Enables the check box.
 * Replaces the dummy link with a event Link.
 */
function enableParentLayer(){
	document.getElementById("parentLayer").className = "";
	document.getElementById("instructions").className = "RecentLink thesauruslistHeading";
	enableorDisableAllCheckBox(false);
	enableOrDisableEventLink(false);
	document.getElementById("thesaurusOverlayLayer").style.display = 'none';
}

/**
 * Enables or disables all the checkboxes
 */
function enableorDisableAllCheckBox(value) {
	var inputFields = $$('div#parentLayer input');		
	if (inputFields.length > 0) {
		inputFields.each(function(field){
			field.disabled = value;
		});
	}
}

/**
 * Enables or disables all the event links
 */
function enableOrDisableEventLink(disable){
	var spanFields = $$('div#parentLayer span');	
	if (spanFields.length > 0) {
		spanFields.each(function(field){
			if($(field)){
				if(disable){
					var idValue = $(field).id;
					if(idValue.indexOf('link') != -1)
						$(idValue).hide();
					else if(idValue.indexOf('icon') != -1)
						$(idValue).show();
				}
				else{
					var idValue = $(field).id;
					if(idValue.indexOf('link') != -1)
						$(idValue).show();
					else if(idValue.indexOf('icon') != -1)
						$(idValue).hide();
				}
			}
		});
	}
	
	var inputFields = $$('div#parentLayer a');	
	if (inputFields.length > 0) {
		inputFields.each(function(field){
			if(disable){
				var onClickValue = field.getAttribute("onclick");
				field.setAttribute("oldClass", field.getAttribute("class"));
				field.setAttribute("class", field.getAttribute("class") + " disabled"); 
				field.setAttribute('onclick', 'return false;');
				field.setAttribute('oldonclick', onClickValue);
			}
			else{
				var onClickValue = field.getAttribute("oldonclick");
				field.setAttribute('onclick', onClickValue);
				field.setAttribute("class", field.getAttribute("oldClass").replace("disabled", ""));
				field.removeAttribute('oldonclick');
				field.removeAttribute('oldClass');
			}
		});
	}
}

/**
 * Show/hide the bracket thing for begins with radio button label.
 */
function showBeginsTextInFull(flag) {
	if (flag == true) {
		$('beginsChars').show();
	} else {
		$('beginsChars').hide();
	}
}

/**
 * This function determines whether the selected terms layer is open or not.
 * This is necessary to achieve the white layout on mouse out.
 */
function isSelectedLayerOpen(){
	if ($('ThesaurusSelectedTermsOverlay')) {
		var layerOpen = $('ThesaurusSelectedTermsOverlay').getStyle('display');
		if(layerOpen == 'none'){
			hideBlueLayer();
		}
	}
	else {
		hideBlueLayer();
	}
}
/* /assets/r20131.3.2-4/app/components/thesaurus/ThesaurusTrigger.js */;
var wind;
var lastFocused;

var ThesaurusTrigger = Class.create({
	initialize: function(spec) {
		this.thesaurusLinkId = spec.thesaurusLink;
		this.searchFieldPattern = spec.searchFieldPattern;
		this.thesaurusLink = $(this.thesaurusLinkId);
		
		if(this.thesaurusLink) {
			this.thesaurusLink.observe('click', this.openChildWindow.bindAsEventListener(this));  
		}
		// leave the page event.
		Event.observe(window, 'beforeunload', function(event) {
			if (wind) {
				try { wind.close(); } catch (e) { }
				wind = null;
			} 
		});
		Event.observe(document, 'click', this.storeFocusedSearchField.bindAsEventListener(this));
		//'pq:focusQueryTerm' event is fired from SearchTermsDynamicRow.js
		document.observe('pq:focusQueryTerm', this.addTermFocused.bindAsEventListener(this));
	}, 
	
	addTermFocused: function(event) {
		if(event.memo) {
			lastFocused= event.memo;
		}
	},
	
	openChildWindow: function(event) {
		var lastFocusedField;
		this.thesaurusUrl = this.thesaurusLink.href;
		if (lastFocused && lastFocused != 'undefined') {
			lastFocusedField = this.thesaurusUrl + '&lastFocused=' + lastFocused;
		} else {
			lastFocusedField = this.thesaurusUrl;
		}
		// Please dont change the name of the window to something other than "wind"
		// The id has to be wind for the EndSession.js to close the window as per the story NP2-10036
		wind = window.open(lastFocusedField, 'Thesaurus', 'width=730, height=750, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, copyhistory=yes, resizable=yes');
		lastFocused = null;
		if (wind) {
			wind.focus();
		}
		Event.stop(event); 
	},
	
	storeFocusedSearchField: function(event) {
		var trigger = event.findElement();
		while (trigger && (!trigger.id || trigger.id == "")) {
			trigger = trigger.parentNode;
		}
		if (trigger && trigger.type && (trigger.type == 'text' || trigger.type == 'textArea' || trigger.type == 'textarea')) {
			 if (trigger.id.startsWith(this.searchFieldPattern)) {
				 lastFocused = trigger.id;
			 }
		}
	}
});

Tapestry.Initializer.thesaurusTrigger = function(spec) {
	new ThesaurusTrigger(spec);
};
/* /assets/r20131.3.2-4/app/components/thesaurus/HierarchicalFieldBrowseIndex.js */;

Tapestry.Initializer.HierarchicalFieldBrowseIndex = function(spec) {
	var indexSearchText = $(spec.indexSearchTextID);

	if (spec.addInNewLine)
		insertAtCaret($('${indexSearchTextID}'), '${thesName1}' + '(' + '${updateFieldValue}' + ')');
	else if (spec.appendSearchTerms) {

		if (indexSearchText.value.length == 0) {
			if (spec.updateFieldValue == '') {
				indexSearchText.value = spec.updateFieldValue;
			} else {
				indexSearchText.value = spec.thesName1 + '(' + spec.updateFieldValue + ')';
			}
		} else {
			if (spec.updateFieldValue == '') {
				// indexSearchText.value = $('${indexSearchTextID}').value;
			} else {
				indexSearchText.value = indexSearchText.value + ' AND ' + spec.thesName1 + '(' + spec.updateFieldValue + ')';
			}
		}
	} else {
		indexSearchText.value = spec.updateFieldValue;
	}
	indexSearchText.simulate('change');
};



/* /assets/r20131.3.2-4/app/components/visualdesign/MainContentLeft.js */;

var MainContentLeft = Class.create(
{
	initialize: function(spec)
	{
		this.cookieName = spec.cookieName;
		this.barElem = $(spec.barId);
		this.barTitleExpand = spec.barTitleExpand;
		this.barTitleCollapse = spec.barTitleCollapse;
		this.arrowId = spec.arrowId;
		this.barElem.observe('click', this.toggleColumn.bindAsEventListener(this)); 
	},
	toggleColumn: function(event)
	{
		event.stop();
		var sidebar = $('side_panel');
		var arrow = this.getArrow(); 
		//this.setColumnHeight(false);
		if (sidebar.visible()) {
			Cookies.create(this.cookieName, 'closed');
			arrow.removeClassName('right-column-collapse-rarrow');
			arrow.addClassName('right-column-collapse-larrow');
			this.barElem.removeClassName('background-none');
			this.barElem.title = this.barTitleExpand;
			if(document.getElementById("customBranding")){
				document.getElementById("customBranding").style.marginTop = "60px";
			}
		} else {
			Cookies.create(this.cookieName, 'open');
			arrow.removeClassName('right-column-collapse-larrow');
			arrow.addClassName('right-column-collapse-rarrow');
			this.barElem.addClassName('background-none');
			this.barElem.title = this.barTitleCollapse;
			if(document.getElementById("customBranding")){
				document.getElementById("customBranding").style.marginTop = "0";
			}
		}
		sidebar.toggle();
		$('mainContentLeft').toggleClassName('rightColumnClosed');
	},
	
	forceCloseColumn: function()
	{
		var sidebar = $('side_panel');
		if (sidebar.visible()) {
			var arrow = this.getArrow();
			arrow.removeClassName('right-column-collapse-rarrow');
			arrow.addClassName('right-column-collapse-larrow');
			this.barElem.removeClassName('background-none');
			this.barElem.title = this.barTitleExpand;
			sidebar.hide();
			$('mainContentLeft').addClassName('rightColumnClosed');
		}
	},
	
	getArrow: function()
	{
		if (! this.arrow)
			this.arrow = $(this.arrowId);
		return this.arrow;
	}
});

var mainContentLeft;
Tapestry.Initializer.mainContentLeft = function(spec)
{
	mainContentLeft = new MainContentLeft(spec);
}

/* /assets/r20131.3.2-4/app/components/visualdesign/CollapsibleSection.js */;
var CollapsibleSection = Class.create(
{
	initialize: function(spec)
	{
		this.button = $(spec.buttonId);
		this.content = $(spec.contentId);
		this.cookieName = spec.cookieName;
		$(spec.buttonId).observe('click', this.togglePanel.bindAsEventListener(this));
		//Professional Commandline line insert
		if ($('cmdLineTextarea')) {
			if ($('sectionContent').style.display !="none"){
				$('cmdLineTextarea').setStyle({marginTop:"96px"});
			}		
		}
		
		
	},
	togglePanel: function(event)
	{
		var linkText = $('sectionButton');
		event.stop();
		if (this.content.visible()) {
			this.button.title='Show options to search specific source/document types or languages';
			document.getElementById("more_option").setAttribute("class", "indicators_base_sprite");
			if ($('cmdLineTextarea')) {
				$('cmdLineTextarea').setStyle({marginTop:"0px"});
			}
			Cookies.create(this.cookieName, 'closed');
		} else {
			this.button.title='Hide options to search specific source/document types or languages';
			this.button.toggleTitle='open';
			document.getElementById("more_option").setAttribute("class", "indicators_base_sprite indicator_menu_up_left");
			if ($('cmdLineTextarea')) {
				$('cmdLineTextarea').setStyle({marginTop:"96px"});
			}
			Cookies.create(this.cookieName, 'open');
		}
		this.button.toggleClassName('panel-close');
		Effect.toggle(this.content, 'blind', {duration: 0.5});
	}
});

Tapestry.Initializer.collapsibleSection = function(spec)
{
	new CollapsibleSection(spec);
}

/* /assets/r20131.3.2-4/app/components/thirdparty/ForeSeeSurvey.js */;

var strUserIP;
var strSessionID;

Tapestry.Initializer.foreseeSurvey = function(spec) {
	strUserIP = spec.strUserIP;
	strSessionID = spec.strSessionID;
};
/* /assets/r20131.3.2-4/app/validation/usernameValidator.js */;

var usernameValidator;

UsernameValidator = Class.create({
	
	initialize: function(spec) {
		this.lookupUrl = spec.lookupUrl;
	},
	
	getLookupUrl: function() {
		return this.lookupUrl;
	},
	
	setMessage: function(message) {
		this.message = message;
	},
	
	getMessage: function() {
		return this.message;
	}
	
});

Tapestry.Validator.username = function(field, message) {
	
	field.addValidator(function(value) {
		var checkUrl = usernameValidator.getLookupUrl();
		var responseText;
		
		new Ajax.Request(checkUrl, {
			method: 'post',
			parameters: {'username': value},
			onFailure: function(t)
			{
				alert('Error communicating with the server');
			},
			onException: function(t, exception)
			{
				alert('Exception: Error communicating with the server: ' + exception);
				throw exception;
			},
			onSuccess: function(t) {
				responseText = t.responseText;
				if (t.responseText == 'true') {
					// Work around problem with using throw command
					field.showValidationMessage(message);
				}
			}
		});
	});

};

Tapestry.Initializer.usernameValidator = function(spec)
{
	usernameValidator = new UsernameValidator(spec);
}

/* /assets/r20131.3.2-4/app/pages/PagePdf.js */;
var PagePdf = Class.create({
	initialize : function(spec) {
		this.showLess = spec.showLess;
		this.showParts = spec.showParts;
		this.title = spec.title;
		this.titleSection = $("ellipsis");
		this.truncateAndDisplayEllipsis();
		showHideLinks(this.showLess, this.showParts);
		
		if (Prototype.Browser.IE) {
			document.observe('prototip:shown', this.disablePdf.bindAsEventListener(this));
			document.observe('prototip:hidden', this.enablePdf.bindAsEventListener(this));
			document.observe('pq:hideSubMenu', this.enablePdf.bindAsEventListener(this));
			document.observe('pq:showSubMenu', this.disablePdf.bindAsEventListener(this));
		}
		
		document.observe('pq:hidePdf', this.disablePdf.bindAsEventListener(this));
		document.observe('pq:showPdf', this.enablePdf.bindAsEventListener(this));

		this.comingFromExternalLink = spec.comingFromExternalLink;
		this.crossSearch = spec.crossSearch;

		document.observe("dom:loaded", function() {
			if (this.comingFromExternalLink)
				clickShowMore($('showLess'), this.crossSearch);
			else
				clickShowLess($('showLess'), this.crossSearch);
		});

		this.isLongSiteName = spec.isLongSiteName;
		this.pdfurl = spec.pdfurl;
		var pdfobject = new PDFObject({
			url : this.pdfurl,
			className : "pdfContainer",
			pdfOpenParams : {
				view : "FitV"
			}
		});
		
		var pdfdiv = $('pdfdiv');
		if (pdfdiv)
			pdfdiv.hide();
		
		if (pdfobject.pluginTypeFound == null || pdfobject.pluginTypeFound == "") {
			var pdffailure = $('pdffailure');
			if (pdffailure)
				pdffailure.show();
			
		} else
			$('EmbedFile').show();
		
		resetEmbedePDFObjectSize(2);
		//Fix IE 6 and IE7 issue with multiple resizing. http://snook.ca/archives/javascript/ie6_fires_onresize
		var timer = null;
		this.currheight;
		Event.observe(window, 'resize', function() {
			if (this.currheight != document.documentElement.clientHeight) {
				if (timer != null)
					clearTimeout(timer);
				timer = setTimeout("resetEmbedePDFObjectSize(2)", 800);
			}
			this.currheight = document.documentElement.clientHeight;
		}.bind(this));
	},
	
	disablePdf : function(event) {
		Event.stop(event);
		$('EmbedFile').hide();
		return false;
	},
	
	enablePdf : function(event) {
		Event.stop(event);

		$('EmbedFile').show();
		return false;
	},
	
	initForm : function(event) {
		//alert("Test") ;
	},
	
	isLongSiteName : function() {
		return isLongSiteName;
	},
	
	truncateAndDisplayEllipsis : function() {
		if (this.title.length > 105) {
			var trimmedText = this.title.substring(0, 105);
			var lastSpaceIndex = trimmedText.search(/ [^ ]*$/);
			trimmedText = trimmedText.substring(0, lastSpaceIndex) + " ...";
			this.titleSection.update(trimmedText);
		}
	}

});

var pagePdf;
Tapestry.Initializer.pagePdf = function(spec) {
	pagePdf = new PagePdf(spec);
};

function showHideLinks(showLess, showParts) {
	if (showLess) {
		$('pdfDocView_citation').hide();
		$('logoSwitch').show();
		$('showLess').hide();
		$('showMore').show();
	}
	if (showParts) {
		var linkText = $('linkTxt');
		linkText.innerHTML = 'Hide';
		$('eisWrapper').show();
	}
}

function setShowLessMoreStatus(flag) {
	if ($('updatePageForm') != null)
		$('updatePageForm').showLessHidden.value = flag;
}

function clickShowLess(link, crossSearch) {
	$('showMore').show();
	$('showLess').hide();
	$('docViewTitle').hide();
	if (crossSearch == false) {
		$('main-nav').hide();
	}
	$('main_nav').hide();
	$('preferences_nav').hide();
	$('pdfDocView_citation').hide();
	$('pdfDocView_citation_ellipse').show();
	$('myresearch_nav').hide();
	$('searchingDB').hide();
	setShowLessMoreStatus('true');
	//resize the PDF embeded area upon the click
	resetEmbedePDFObjectSize(0);
	var logo = $('logo');
	logo.addClassName('logoMargin');
	logo.addClassName('cross');
	var subNav = $('subNav');
	if (subNav != null) {
		subNav.addClassName('subNavMarginCross');
		subNav.removeClassName('pdfIE7Cross');
	}
	if (crossSearch == false) {
		logo.removeClassName('cross');
		logo.addClassName('nonCross');
		if (subNav != null) {
			subNav.addClassName('subNavMargin');
			subNav.removeClassName('subNavMarginMoreAdjust');
			subNav.removeClassName('subNavMarginCross');
			subNav.addClassName('pdfIE7');
		}
	}
	var container = $('container');
	if (container != null) {
		container.id = 'containerNoBackground';
	}
	var signInLinkZone = $('signInLinkZone');
	signInLinkZone.removeClassName('loadingHeight');
	signInLinkZone.addClassName('loadingHeight_Pdf_Ie7');
	return false;
}

function clickShowMore(link, crossSearch) {
	$('showLess').show();
	$('showMore').hide();
	$('docViewTitle').show();
	if (crossSearch == false) {
		$('main-nav').show();
	}
	$('main_nav').show();
	$('preferences_nav').show();
	$('pdfDocView_citation').show();
	$('pdfDocView_citation_ellipse').hide();
	$('myresearch_nav').show();
	$('searchingDB').show();
	setShowLessMoreStatus('false');
	//resize the PDF embeded area upon the click
	resetEmbedePDFObjectSize(0);
	var logo = $('logo');
	logo.removeClassName('logoMargin');
	logo.addClassName('cross');
	var subNav = $('subNav');
	if (subNav != null) {
		subNav.addClassName('subNavMarginCross');
		subNav.addClassName('pdfIE7Cross');
	}
	if (crossSearch == false) {
		logo.removeClassName('cross');
		logo.addClassName('nonCross');
		if (subNav != null) {
			subNav.addClassName('subNavMargin');
			if (pagePdf.isLongSiteName) {
				subNav.addClassName('subNavMarginMoreAdjust');
			}
			subNav.removeClassName('subNavMarginCross');
			subNav.removeClassName('pdfIE7Cross');
			subNav.addClassName('pdfIE7');
		}
	}
	var containerNoBackground = $('containerNoBackground');
	if (containerNoBackground != null) {
		containerNoBackground.id = 'container';
	}
	var signInLinkZone = $('signInLinkZone');
	signInLinkZone.removeClassName('loadingHeight_Pdf_Ie7');
	signInLinkZone.addClassName('loadingHeight');
	return false;
}

function getBrowserWindowHeight() {
	var theHeight = 0;
	if (window.innerHeight)
		theHeight = window.innerHeight;
	else if (document.documentElement && document.documentElement.clientHeight)
		theHeight = document.documentElement.clientHeight;
	else if (document.body)
		theHeight = document.body.clientHeight;
	
	return theHeight;
}

function getBrowserWindowWidth() {
	var theWidth = 0;
	if (window.innerWidth)
		theWidth = window.innerWidth;
	else if (document.documentElement && document.documentElement.clientWidth)
		theWidth = document.documentElement.clientWidth;
	else if (document.body)
		theWidth = document.body.clientWidth;
	
	return theWidth;
}

function resetDatabaseWidthOverlap() {
	if ($('imgClassSwitch') && $('subNav') && $('sitePageHeader')) {
		var databaseWidth = getBrowserWindowWidth() - $('subNav').down().getWidth() - 30;
		$('sitePageHeader').setStyle({
			width : databaseWidth + 'px'
		});
	}
}

function floatSetter() {
	if ($('brandImage')) {
		var imageWidth = $('brandImage').getWidth() + 150;
		var brandImageWidth = getBrowserWindowWidth();
		var subNav = $('subNav');
		if (subNav != null) {
			brandImageWidth -= ($('subNav').down().getWidth() + imageWidth);
		} else {
			brandImageWidth -= imageWidth;
		}		
		$('siteNameWrapper').setStyle({
			float : 'left'
		});
		$('siteNameWrapper').setStyle({
			width : brandImageWidth + 'px'
		});
	}
}

function resetEmbedePDFObjectSize(margin) {
	//resize if database heading is overlapped with subNav.
	resetDatabaseWidthOverlap();
	//sets the float to left when branding image is present
	floatSetter();
	//default to 1000px
	var embedFile = $('EmbedFile');
	if (embedFile) {
		embedFile.setStyle({
			height : '1000px'
		});
		var restContentHeight = getDocHeight() - embedFile.getHeight();
		var finalEmbededHeight = getBrowserWindowHeight() - restContentHeight - margin;
		embedFile.setStyle({
			height : finalEmbededHeight + 'px'
		});
	}
}

function hasScrollbar() {
	return document.documentElement.clientHeight < document.body.offsetHeight;
}

function getDocHeight() {
	return Math.max(
			Math.max(document.body.scrollHeight,document.documentElement.scrollHeight), 
			Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
			Math.max(document.body.clientHeight, document.documentElement.clientHeight)
		);
}

function showDocviewTitleAndCitation() {
	$('docViewTitle').show();
	$('pdfDocView_citation').show();
}

/* /assets/r20131.3.2-4/app/base/alertrss/SearchAlertsBase.js */;
var SearchAlertsBase = Class.create({
	initialize : function(spec) {
		this.removeSearchDataFromSession = spec.removeSearchDataFromSession;
		this.editSearchHappened = spec.editSearchHappened;
	},
	removeSearchData : function() {
		if (this.editSearchHappened) {
			new Ajax.Request(this.removeSearchDataFromSession, {
				onSuccess : function() {
					window.location.reload();
				}
			});
		} else {
			window.location.reload();
		}
	}
});

var searchAlertsBase;
Tapestry.Initializer.searchAlertsBase = function(spec) {
	searchAlertsBase = new SearchAlertsBase(spec);
};