
/* /assets/r20131.3.2-4/pqc/javascript/InlineValidation.js */;
Tapestry.FormEventManager.addMethods(
{
	handleSubmit : function(domevent) {
		/*
		 * Necessary because we set the onsubmit property of the form, rather
		 * than observing the event. But that's because we want to specfically
		 * overwrite any other handlers.
		 */
		Event.extend(domevent);

		var t = $T(this.form);

		t.validationError = false;

		this.form.fire(Tapestry.FORM_PREPARE_FOR_SUBMIT_EVENT, this.form);

		/*
		 * This flag can be set to prevent the form from submitting normally.
		 * This is used for some Ajax cases where the form submission must run
		 * via Ajax.Request.
		 */
		if (this.form.hasClassName(Tapestry.PREVENT_SUBMISSION)) {
			domevent.stop();

			/*
			 * Instead fire the event (a listener will then trigger the Ajax
			 * submission). This is really a hook for the ZoneManager.
			 */
			this.form.fire(Tapestry.FORM_PROCESS_SUBMIT_EVENT);

			return false;
		}

		/* Validation is OK, not doing Ajax, continue as planned. */
		return true;
	}
});

Tapestry.FieldEventManager.addMethods(
{
	initialize : function(field)
	{
		this.field = $(field);

		var id = this.field.id;

		var fem = $(this.field.form).getFormEventManager();

		if (id && fem.validateOnBlur) {

			this.translator = Prototype.K;
	
			document.observe(Tapestry.FOCUS_CHANGE_EVENT, function(event)
			{
				// If changing focus *within the same form* then perform validation.
				// Note that Tapestry.currentFocusField does not change
				// until after the FOCUS_CHANGE_EVENT notification.
				if (Tapestry.currentFocusField == this.field && this.field.form == event.memo.form) {
					this.validateInput();
				}
			}.bindAsEventListener(this));
		}
	},

	// Removes validation decorations if present.
	removeDecorations : function()
	{
		this.field.removeClassName("t-error");

		if (this.getLabel()) {
			if (this.getIcon()) {
				this.getIcon().hide();
				this.getLabel().insert(this.getIcon());
			}
			var errorMsgId = this.field.id + ':error';
			if (!this.errorMessage) {
				this.errorMessage = $(errorMsgId);
			}
			if (this.errorMessage) {
				Element.remove(this.errorMessage);
				this.errorMessage = null;
			}
		}
	},

	/**
	 * Show a validation error message, which will add decorations to the
	 * field and it label.
	 * @param message validation message to display
	 */
	showValidationMessage : function(message)
	{
		$T(this.field).validationError = true;
		$T(this.field.form).validationError = true;
		this.field.addClassName("t-error");

		if (this.getLabel())	{
			var newLine = new Element('div', {'class': 'clear'});
			//Changes done for bug:1883 in LAD, missing rounded corners in IE browsers.
            newLine.appendChild(new Element('div', {'class': 'error-tl'}));
            newLine.appendChild(new Element('div', {'class': 'error-tr'}));
		    newLine.appendChild(new Element('div', {'class': 'error-bl'}));
		    newLine.appendChild(new Element('div', {'class': 'error-br'}));

			var errorMsgId = this.field.id + ':error';
			if (!this.errorMessage) {
				this.errorMessage = $(errorMsgId);
			}
			if (!this.errorMessage) {
				this.errorMessage = new Element('span', {'id': errorMsgId, 'class': 't-error'});
				this.getLabel().insert({ bottom: this.errorMessage});
				
			}
			var icon = this.getIcon();
			this.errorMessage.update(message);
			this.errorMessage.insert({top: icon });
			this.errorMessage.insert({top: newLine});
			if (icon != null)
				icon.show();
		}
	}
});

// Client & Server email validator.
Tapestry.Validator.pqemail = function(field, message)
{
	field.addValidator(function(value)
	{
		if (!Tapestry.Validator.pqemail.validate(value)) throw message;
	});
}

Tapestry.Validator.pqemail.validate = function(emailStr)
{
	if (emailStr.length == 0) {
		return true;
	}
	/* The following is the list of known TLDs that an e-mail address must end with. */
	var knownDomsPat = /^(cat|com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum)$/;
	/* to check if the entered e-mail address fits the user@domain format. */
	var emailPat = /^(.+)@(.+)$/;
	/* We don't want to allow special characters in the address. These characters include ( ) < > @ , ; : \ " . [ ] */
	var specialChars = "\\(\\)><@,;:\\\\\\\"\\.\\[\\]";
	/* The range of characters allowed in a username or domainname. It really states which chars aren't allowed. */
	var validChars = "\[^\\s" + specialChars + "\]";
	/* The following pattern applies if the "user" is a quoted string (in which case, there are no rules about which 
	 * characters are allowed and which aren't; anything goes).  E.g. "jiminy cricket"@disney.com is a legal e-mail address. */
	var quotedUser = "(\"[^\"]*\")";
	/* Domains that are IP addresses, rather than symbolic names. e.g. joe@[123.124.233.4] is a legal e-mail address. NOTE: The square brackets are required. */
	var ipDomainPat = /^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
	/* The following string represents an atom (basically a series of non-special characters.) */
	var atom = validChars + '+';
	/* The following string represents one word in the typical username. Basically, a word is either an atom or quoted string. */
	var word = "(" + atom + "|" + quotedUser + ")";
	// The following pattern describes the structure of the user
	var userPat = new RegExp("^" + word + "(\\." + word + ")*$");
	/* The following pattern describes the structure of a normal symbolic domain, as opposed to ipDomainPat, shown above. */
	var domainPat = new RegExp("^" + atom + "(\\." + atom +")*$");

	/* Start trying to figure out if the supplied address is valid, begin by breaking up user@domain into different pieces that are easy to analyze. */
	var matchArray = emailStr.match(emailPat);
	if (matchArray == null) {
//		alert("Email address seems incorrect (check @ and .'s)");
		return false;
	}
	var user = matchArray[1];
	var domain = matchArray[2];

	for (i=0; i<user.length; i++) {
		if (user.charCodeAt(i)>127) {
//			alert("Ths username contains invalid characters.");
			return false;
		}
	}
	for (i=0; i<domain.length; i++) {
		if (domain.charCodeAt(i)>127) {
//			alert("Ths domain name contains invalid characters.");
			return false;
		}
	}
	if (user.match(userPat) == null) {
//		alert("The username doesn't seem to be valid.");
		return false;
	}

	var IPArray = domain.match(ipDomainPat);
	if (IPArray != null) {
		for (var i=1;i<=4;i++) {
			if (IPArray[i]>255) {
//				alert("Destination IP address is invalid!");
				return false;
			}
		}
		return true;
	}

	var atomPat = new RegExp("^" + atom + "$");
	var domArr = domain.split(".");
	var len = domArr.length;
	for (i=0;i<len;i++) {
		if (domArr[i].search(atomPat)==-1) {
//			alert("The domain name does not seem to be valid.");
			return false;
		}
	}

	/* Make sure that it ends in a known top-level domain (like com, edu, gov) or a two-letter word,
	representing country (uk, nl), and that there's a hostname preceding the domain or country. */
	if (domArr[domArr.length-1].length != 2 && domArr[domArr.length-1].search(knownDomsPat) == -1) {
//		alert("The address must end in a well-known domain or two letter " + "country.");
		return false;
	}
	if (len < 2) {
		//alert("This address is missing a hostname!");
		return false;
	}
	// If we've gotten this far, everything's valid!
	return true;
}


/* /assets/r20131.3.2-4/pqc/javascript/BrowserCheck.js */;
function browserCheck() 
{
	// Returns the version of Internet Explorer or a -1
	// (indicating the use of another browser).
	  var rv = -1; // Return value assumes failure.
	  if (navigator.appName == 'Microsoft Internet Explorer')
	  {
	    var ua = navigator.userAgent;
	    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	    if (re.exec(ua) != null)
	      rv = parseFloat( RegExp.$1 );
	  }
	var ver = rv;
	var flag=document.cookie.indexOf("donotremind");
	//alert('checking flag: '+flag);
	if(ver == 6)
		if(flag==-1){
			Overlay.box.showOverlay('browserInfoOverlay');
		}
}

function setDoNotAsk(){
	if($('browserInfoForm').chkResults.checked){
		//document.cookie='donotremind:yes';
		var exp=new Date();
		var numdays=7;
		exp.setTime(exp.getTime()+(1000*60*60*24*numdays)) ;
		//document.cookie="MyCookie=1; path=; expires="+exp.toGMTString();
		document.cookie='donotremind=yes; expires='+exp.toGMTString();
	}
	}

//Run the browse check method after all other JavaScript has finished.
document.observe('dom:loaded', function() {
	browserCheck.defer();
});
/* /assets/r20131.3.2-4/pqc/javascript/PopupWindowLinks.js */;
var popupClassesHash = new Hash({ 
	popUpHelp: 'width=790,height=480,resizable=1,toolbar=1,location=1,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0',		
    popUpSmall: 'width=680,height=360,resizable=1,toolbar=1,location=0,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0',	    
    popUpMulti: 'width=680,height=500,resizable=1,toolbar=1,location=1,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0',	    
    externalLink: 'width=600,height=480,resizable=1,toolbar=1,location=1,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0',
    externalWidget: 'resizable=0,toolbar=0,location=0,directories=0,addressbar=0,scrollbars=0,status=0,menubar=0'
});

var PopupWindowLinks = Class.create(
{
	initialize: function() {
		Event.observe(document, 'click', this.clickPopupLink.bindAsEventListener(this));
	},
	clickPopupLink: function(event) {
		
		if (this.getTargetType(event) == 'A' ) {
			var className = this.checkClasses(event);
			if (className && className.indexOf('popUpHelp') == -1) {
				event.stop();
				if (!this.link)
					this.link = event.findElement('a')
				
				if (className == "externalWidget") {
					var height = this.link.getAttribute('data-height');
					var width = this.link.getAttribute('data-width');
					var config = 'width=' + width + ',height=' + height + "," + popupClassesHash.get(className);
					var newWindow = window.open(this.link.href, "ExternalWidget", config);
					newWindow.focus()
				} else if (className == 'linkInLayer') {
					Tips.hideAll();
				} else {
					window.open(this.link.href, "", popupClassesHash.get(className));
				}
				this.link = null;
			}
		}
	},
	getTargetType: function(event) {
		var nodeName;
		if (Prototype.Browser.IE && event.srcElement) {
			nodeName = event.srcElement.nodeName;
		} else {
			this.link = event.findElement('a');
			if (this.link && this.link.nodeName)
				nodeName = this.link.nodeName;
		}
		
		return nodeName;
	},
	getClassName: function(event) {
		if (Prototype.Browser.IE && event.srcElement) {
			return event.srcElement.className;
		} else {
			return this.link.className;
		}
	},
	checkClasses: function(event) {
		this.className = this.getClassName(event);
		if (this.containsClass('popUpHelp')) {
			return 'popUpHelp';
		} else if (this.containsClass('popUpSmall')) {
			return 'popUpSmall';
		} else if (this.containsClass('popUpMulti')) {
			return 'popUpMulti';
		} else if (this.containsClass('externalLink')) {
			return 'externalLink';
		} else if (this.containsClass('externalWidget')) {
			return 'externalWidget';
		} else if (this.containsClass('linkInLayer')) {
			return 'linkInLayer';
		}
		return null;
	},
	containsClass: function(className) {
		var elementClassName = this.className;
	    return (elementClassName.length > 0 && (elementClassName == className ||
	      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
	}
});

var popupWindowLinksVar;

Tapestry.Initializer.popupWindowLinks = function()
{
	if (!popupWindowLinksVar)
		popupWindowLinksVar = new PopupWindowLinks();
}


function newPopup(url) {
	popupWindow = window.open(
		url,'popUpWindow','width=790,height=480,resizable=1,toolbar=1,location=1,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0');
}

function alwaysNewPopup(url) {
	popupWindow = window.open(
		url,'_blank','width=790,height=480,resizable=1,toolbar=1,location=1,directories=0,addressbar=1,scrollbars=1,status=0,menubar=0');
}

/* /assets/r20131.3.2-4/pqc/javascript/AjaxEndSession.js */;
Tapestry.ajaxExceptionHandler = function(response, exception) {
	if (response && response.request && response.request.transport && response.request.transport.responseText && response.request.transport.responseText == 'state:sessionEnded') {
		window.location.reload();
	} else {
	    Tapestry.error(Tapestry.Messages.communicationFailed + exception);
	
	    Tapestry.debug(Tapestry.Messages.ajaxFailure + exception, response);
	
	    throw exception;
	}
};
/* /assets/r20131.3.2-4/core/scriptaculous_1_9_0/controls.js */;
// script.aculo.us controls.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2010 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2010 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least,
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most
// useful when one of the tokens is \n (a newline), as it
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer =
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    this.getEntry(this.index).scrollIntoView(true);
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector'
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&
          ret.length < instance.options.choices ; i++) {

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase()) :
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) {
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" +
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars &&
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ?
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML.unescapeHTML();
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer,
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element);
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});
/* /assets/r20131.3.2-4/core/scriptaculous_1_9_0/slider.js */;
// script.aculo.us slider.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Marty Haught, Thomas Fuchs
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if (!Control) var Control = { };

// options:
//  axis: 'vertical', or 'horizontal' (default)
//
// callbacks:
//  onChange(value)
//  onSlide(value)
Control.Slider = Class.create({
  initialize: function(handle, track, options) {
    var slider = this;

    if (Object.isArray(handle)) {
      this.handles = handle.collect( function(e) { return $(e) });
    } else {
      this.handles = [$(handle)];
    }

    this.track   = $(track);
    this.options = options || { };

    this.axis      = this.options.axis || 'horizontal';
    this.increment = this.options.increment || 1;
    this.step      = parseInt(this.options.step || '1');
    this.range     = this.options.range || $R(0,1);

    this.value     = 0; // assure backwards compat
    this.values    = this.handles.map( function() { return 0 });
    this.spans     = this.options.spans ? this.options.spans.map(function(s){ return $(s) }) : false;
    this.options.startSpan = $(this.options.startSpan || null);
    this.options.endSpan   = $(this.options.endSpan || null);

    this.restricted = this.options.restricted || false;

    this.maximum   = this.options.maximum || this.range.end;
    this.minimum   = this.options.minimum || this.range.start;

    // Will be used to align the handle onto the track, if necessary
    this.alignX = parseInt(this.options.alignX || '0');
    this.alignY = parseInt(this.options.alignY || '0');

    this.trackLength = this.maximumOffset() - this.minimumOffset();

    this.handleLength = this.isVertical() ?
      (this.handles[0].offsetHeight != 0 ?
        this.handles[0].offsetHeight : this.handles[0].style.height.replace(/px$/,"")) :
      (this.handles[0].offsetWidth != 0 ? this.handles[0].offsetWidth :
        this.handles[0].style.width.replace(/px$/,""));

    this.active   = false;
    this.dragging = false;
    this.disabled = false;

    if (this.options.disabled) this.setDisabled();

    // Allowed values array
    this.allowedValues = this.options.values ? this.options.values.sortBy(Prototype.K) : false;
    if (this.allowedValues) {
      this.minimum = this.allowedValues.min();
      this.maximum = this.allowedValues.max();
    }

    this.eventMouseDown = this.startDrag.bindAsEventListener(this);
    this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
    this.eventMouseMove = this.update.bindAsEventListener(this);

    // Initialize handles in reverse (make sure first handle is active)
    this.handles.each( function(h,i) {
      i = slider.handles.length-1-i;
      slider.setValue(parseFloat(
        (Object.isArray(slider.options.sliderValue) ?
          slider.options.sliderValue[i] : slider.options.sliderValue) ||
         slider.range.start), i);
      h.makePositioned().observe("mousedown", slider.eventMouseDown);
    });

    this.track.observe("mousedown", this.eventMouseDown);
    document.observe("mouseup", this.eventMouseUp);
    document.observe("mousemove", this.eventMouseMove);

    this.initialized = true;
  },
  dispose: function() {
    var slider = this;
    Event.stopObserving(this.track, "mousedown", this.eventMouseDown);
    Event.stopObserving(document, "mouseup", this.eventMouseUp);
    Event.stopObserving(document, "mousemove", this.eventMouseMove);
    this.handles.each( function(h) {
      Event.stopObserving(h, "mousedown", slider.eventMouseDown);
    });
  },
  setDisabled: function(){
    this.disabled = true;
  },
  setEnabled: function(){
    this.disabled = false;
  },
  getNearestValue: function(value){
    if (this.allowedValues){
      if (value >= this.allowedValues.max()) return(this.allowedValues.max());
      if (value <= this.allowedValues.min()) return(this.allowedValues.min());

      var offset = Math.abs(this.allowedValues[0] - value);
      var newValue = this.allowedValues[0];
      this.allowedValues.each( function(v) {
        var currentOffset = Math.abs(v - value);
        if (currentOffset <= offset){
          newValue = v;
          offset = currentOffset;
        }
      });
      return newValue;
    }
    if (value > this.range.end) return this.range.end;
    if (value < this.range.start) return this.range.start;
    return value;
  },
  setValue: function(sliderValue, handleIdx){
    if (!this.active) {
      this.activeHandleIdx = handleIdx || 0;
      this.activeHandle    = this.handles[this.activeHandleIdx];
      this.updateStyles();
    }
    handleIdx = handleIdx || this.activeHandleIdx || 0;
    if (this.initialized && this.restricted) {
      if ((handleIdx>0) && (sliderValue<this.values[handleIdx-1]))
        sliderValue = this.values[handleIdx-1];
      if ((handleIdx < (this.handles.length-1)) && (sliderValue>this.values[handleIdx+1]))
        sliderValue = this.values[handleIdx+1];
    }
    sliderValue = this.getNearestValue(sliderValue);
    this.values[handleIdx] = sliderValue;
    this.value = this.values[0]; // assure backwards compat

    this.handles[handleIdx].style[this.isVertical() ? 'top' : 'left'] =
      this.translateToPx(sliderValue);

    this.drawSpans();
    if (!this.dragging || !this.event) this.updateFinished();
  },
  setValueBy: function(delta, handleIdx) {
    this.setValue(this.values[handleIdx || this.activeHandleIdx || 0] + delta,
      handleIdx || this.activeHandleIdx || 0);
  },
  translateToPx: function(value) {
    return Math.round(
      ((this.trackLength-this.handleLength)/(this.range.end-this.range.start)) *
      (value - this.range.start)) + "px";
  },
  translateToValue: function(offset) {
    return ((offset/(this.trackLength-this.handleLength) *
      (this.range.end-this.range.start)) + this.range.start);
  },
  getRange: function(range) {
    var v = this.values.sortBy(Prototype.K);
    range = range || 0;
    return $R(v[range],v[range+1]);
  },
  minimumOffset: function(){
    return(this.isVertical() ? this.alignY : this.alignX);
  },
  maximumOffset: function(){
    return(this.isVertical() ?
      (this.track.offsetHeight != 0 ? this.track.offsetHeight :
        this.track.style.height.replace(/px$/,"")) - this.alignY :
      (this.track.offsetWidth != 0 ? this.track.offsetWidth :
        this.track.style.width.replace(/px$/,"")) - this.alignX);
  },
  isVertical:  function(){
    return (this.axis == 'vertical');
  },
  drawSpans: function() {
    var slider = this;
    if (this.spans)
      $R(0, this.spans.length-1).each(function(r) { slider.setSpan(slider.spans[r], slider.getRange(r)) });
    if (this.options.startSpan)
      this.setSpan(this.options.startSpan,
        $R(0, this.values.length>1 ? this.getRange(0).min() : this.value ));
    if (this.options.endSpan)
      this.setSpan(this.options.endSpan,
        $R(this.values.length>1 ? this.getRange(this.spans.length-1).max() : this.value, this.maximum));
  },
  setSpan: function(span, range) {
    if (this.isVertical()) {
      span.style.top = this.translateToPx(range.start);
      span.style.height = this.translateToPx(range.end - range.start + this.range.start);
    } else {
      span.style.left = this.translateToPx(range.start);
      span.style.width = this.translateToPx(range.end - range.start + this.range.start);
    }
  },
  updateStyles: function() {
    this.handles.each( function(h){ Element.removeClassName(h, 'selected') });
    Element.addClassName(this.activeHandle, 'selected');
  },
  startDrag: function(event) {
    if (Event.isLeftClick(event)) {
      if (!this.disabled){
        this.active = true;

        var handle = Event.element(event);
        var pointer  = [Event.pointerX(event), Event.pointerY(event)];
        var track = handle;
        if (track==this.track) {
          var offsets  = this.track.cumulativeOffset();
          this.event = event;
          this.setValue(this.translateToValue(
           (this.isVertical() ? pointer[1]-offsets[1] : pointer[0]-offsets[0])-(this.handleLength/2)
          ));
          var offsets  = this.activeHandle.cumulativeOffset();
          this.offsetX = (pointer[0] - offsets[0]);
          this.offsetY = (pointer[1] - offsets[1]);
        } else {
          // find the handle (prevents issues with Safari)
          while((this.handles.indexOf(handle) == -1) && handle.parentNode)
            handle = handle.parentNode;

          if (this.handles.indexOf(handle)!=-1) {
            this.activeHandle    = handle;
            this.activeHandleIdx = this.handles.indexOf(this.activeHandle);
            this.updateStyles();

            var offsets  = this.activeHandle.cumulativeOffset();
            this.offsetX = (pointer[0] - offsets[0]);
            this.offsetY = (pointer[1] - offsets[1]);
          }
        }
      }
      Event.stop(event);
    }
  },
  update: function(event) {
   if (this.active) {
      if (!this.dragging) this.dragging = true;
      this.draw(event);
      if (Prototype.Browser.WebKit) window.scrollBy(0,0);
      Event.stop(event);
   }
  },
  draw: function(event) {
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    var offsets = this.track.cumulativeOffset();
    pointer[0] -= this.offsetX + offsets[0];
    pointer[1] -= this.offsetY + offsets[1];
    this.event = event;
    this.setValue(this.translateToValue( this.isVertical() ? pointer[1] : pointer[0] ));
    if (this.initialized && this.options.onSlide)
      this.options.onSlide(this.values.length>1 ? this.values : this.value, this);
  },
  endDrag: function(event) {
    if (this.active && this.dragging) {
      this.finishDrag(event, true);
      Event.stop(event);
    }
    this.active = false;
    this.dragging = false;
  },
  finishDrag: function(event, success) {
    this.active = false;
    this.dragging = false;
    this.updateFinished();
  },
  updateFinished: function() {
    if (this.initialized && this.options.onChange)
      this.options.onChange(this.values.length>1 ? this.values : this.value, this);
    this.event = null;
  }
});
/* /assets/r20131.3.2-4/core/scriptaculous_1_9_0/dragdrop.js */;
// script.aculo.us dragdrop.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if(Object.isUndefined(Effect))
  throw("dragdrop.js requires including script.aculo.us' effects.js library");

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) { return d.element==$(element) });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy:     true,
      hoverclass: null,
      tree:       false
    }, arguments[1] || { });

    // cache containers
    if(options.containment) {
      options._containers = [];
      var containment = options.containment;
      if(Object.isArray(containment)) {
        containment.each( function(c) { options._containers.push($(c)) });
      } else {
        options._containers.push($(containment));
      }
    }

    if(options.accept) options.accept = [options.accept].flatten();

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },

  findDeepestChild: function(drops) {
    deepest = drops[0];

    for (i = 1; i < drops.length; ++i)
      if (Element.isParent(drops[i].element, deepest.element))
        deepest = drops[i];

    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if(drop.tree) {
      containmentNode = element.treeNode;
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) { return containmentNode == c });
  },

  isAffected: function(point, element, drop) {
    return (
      (drop.element!=element) &&
      ((!drop._containers) ||
        this.isContained(element, drop)) &&
      ((!drop.accept) ||
        (Element.classNames(element).detect(
          function(v) { return drop.accept.include(v) } ) )) &&
      Position.within(drop.element, point[0], point[1]) );
  },

  deactivate: function(drop) {
    if(drop.hoverclass)
      Element.removeClassName(drop.element, drop.hoverclass);
    this.last_active = null;
  },

  activate: function(drop) {
    if(drop.hoverclass)
      Element.addClassName(drop.element, drop.hoverclass);
    this.last_active = drop;
  },

  show: function(point, element) {
    if(!this.drops.length) return;
    var drop, affected = [];

    this.drops.each( function(drop) {
      if(Droppables.isAffected(point, element, drop))
        affected.push(drop);
    });

    if(affected.length>0)
      drop = Droppables.findDeepestChild(affected);

    if(this.last_active && this.last_active != drop) this.deactivate(this.last_active);
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if(drop.onHover)
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));

      if (drop != this.last_active) Droppables.activate(drop);
    }
  },

  fire: function(event, element) {
    if(!this.last_active) return;
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active))
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event);
        return true;
      }
  },

  reset: function() {
    if(this.last_active)
      this.deactivate(this.last_active);
  }
};

var Draggables = {
  drags: [],
  observers: [],

  register: function(draggable) {
    if(this.drags.length == 0) {
      this.eventMouseUp   = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress  = this.keyPress.bindAsEventListener(this);

      Event.observe(document, "mouseup", this.eventMouseUp);
      Event.observe(document, "mousemove", this.eventMouseMove);
      Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
  },

  unregister: function(draggable) {
    this.drags = this.drags.reject(function(d) { return d==draggable });
    if(this.drags.length == 0) {
      Event.stopObserving(document, "mouseup", this.eventMouseUp);
      Event.stopObserving(document, "mousemove", this.eventMouseMove);
      Event.stopObserving(document, "keypress", this.eventKeypress);
    }
  },

  activate: function(draggable) {
    if(draggable.options.delay) {
      this._timeout = setTimeout(function() {
        Draggables._timeout = null;
        window.focus();
        Draggables.activeDraggable = draggable;
      }.bind(this), draggable.options.delay);
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },

  deactivate: function() {
    this.activeDraggable = null;
  },

  updateDrag: function(event) {
    if(!this.activeDraggable) return;
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if(this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) return;
    this._lastPointer = pointer;

    this.activeDraggable.updateDrag(event, pointer);
  },

  endDrag: function(event) {
    if(this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if(!this.activeDraggable) return;
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },

  keyPress: function(event) {
    if(this.activeDraggable)
      this.activeDraggable.keyPress(event);
  },

  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },

  removeObserver: function(element) {  // element instead of observer fixes mem leaks
    this.observers = this.observers.reject( function(o) { return o.element==element });
    this._cacheObserverCallbacks();
  },

  notify: function(eventName, draggable, event) {  // 'onStart', 'onEnd', 'onDrag'
    if(this[eventName+'Count'] > 0)
      this.observers.each( function(o) {
        if(o[eventName]) o[eventName](eventName, draggable, event);
      });
    if(draggable.options[eventName]) draggable.options[eventName](draggable, event);
  },

  _cacheObserverCallbacks: function() {
    ['onStart','onEnd','onDrag'].each( function(eventName) {
      Draggables[eventName+'Count'] = Draggables.observers.select(
        function(o) { return o[eventName]; }
      ).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset^2)+Math.abs(left_offset^2))*0.02;
        new Effect.Move(element, { x: -left_offset, y: -top_offset, duration: dur,
          queue: {scope:'_draggable', position:'end'}
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {duration:0.2, from:0.7, to:toOpacity,
          queue: {scope:'_draggable', position:'end'},
          afterFinish: function(){
            Draggable._dragging[element] = false
          }
        });
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false,  // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };

    if(!arguments[1] || Object.isUndefined(arguments[1].endeffect))
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {duration:0.2, from:element._opacity, to:0.7});
        }
      });

    var options = Object.extend(defaults, arguments[1] || { });

    this.element = $(element);

    if(options.handle && Object.isString(options.handle))
      this.handle = this.element.down('.'+options.handle, 0);

    if(!this.handle) this.handle = $(options.handle);
    if(!this.handle) this.handle = this.element;

    if(options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE

    this.options  = options;
    this.dragging = false;

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);

    Draggables.register(this);
  },

  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },

  currentDelta: function() {
    return([
      parseInt(Element.getStyle(this.element,'left') || '0'),
      parseInt(Element.getStyle(this.element,'top') || '0')]);
  },

  initDrag: function(event) {
    if(!Object.isUndefined(Draggable._dragging[this.element]) &&
      Draggable._dragging[this.element]) return;
    if(Event.isLeftClick(event)) {
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event);
      if((tag_name = src.tagName.toUpperCase()) && (
        tag_name=='INPUT' ||
        tag_name=='SELECT' ||
        tag_name=='OPTION' ||
        tag_name=='BUTTON' ||
        tag_name=='TEXTAREA')) return;

      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      var pos     = this.element.cumulativeOffset();
      this.offset = [0,1].map( function(i) { return (pointer[i] - pos[i]) });

      Draggables.activate(this);
      Event.stop(event);
    }
  },

  startDrag: function(event) {
    this.dragging = true;
    if(!this.delta)
      this.delta = this.currentDelta();

    if(this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element,'z-index') || 0);
      this.element.style.zIndex = this.options.zindex;
    }

    if(this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
      if (!this._originallyAbsolute)
        Position.absolutize(this.element);
      this.element.parentNode.insertBefore(this._clone, this.element);
    }

    if(this.options.scroll) {
      if (this.options.scroll == window) {
        var where = this._getWindowScroll(this.options.scroll);
        this.originalScrollLeft = where.left;
        this.originalScrollTop = where.top;
      } else {
        this.originalScrollLeft = this.options.scroll.scrollLeft;
        this.originalScrollTop = this.options.scroll.scrollTop;
      }
    }

    Draggables.notify('onStart', this, event);

    if(this.options.starteffect) this.options.starteffect(this.element);
  },

  updateDrag: function(event, pointer) {
    if(!this.dragging) this.startDrag(event);

    if(!this.options.quiet){
      Position.prepare();
      Droppables.show(pointer, this.element);
    }

    Draggables.notify('onDrag', this, event);

    this.draw(pointer);
    if(this.options.change) this.options.change(this);

    if(this.options.scroll) {
      this.stopScrolling();

      var p;
      if (this.options.scroll == window) {
        with(this._getWindowScroll(this.options.scroll)) { p = [ left, top, left+width, top+height ]; }
      } else {
        p = Position.page(this.options.scroll).toArray();
        p[0] += this.options.scroll.scrollLeft + Position.deltaX;
        p[1] += this.options.scroll.scrollTop + Position.deltaY;
        p.push(p[0]+this.options.scroll.offsetWidth);
        p.push(p[1]+this.options.scroll.offsetHeight);
      }
      var speed = [0,0];
      if(pointer[0] < (p[0]+this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[0]+this.options.scrollSensitivity);
      if(pointer[1] < (p[1]+this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[1]+this.options.scrollSensitivity);
      if(pointer[0] > (p[2]-this.options.scrollSensitivity)) speed[0] = pointer[0]-(p[2]-this.options.scrollSensitivity);
      if(pointer[1] > (p[3]-this.options.scrollSensitivity)) speed[1] = pointer[1]-(p[3]-this.options.scrollSensitivity);
      this.startScrolling(speed);
    }

    // fix AppleWebKit rendering
    if(Prototype.Browser.WebKit) window.scrollBy(0,0);

    Event.stop(event);
  },

  finishDrag: function(event, success) {
    this.dragging = false;

    if(this.options.quiet){
      Position.prepare();
      var pointer = [Event.pointerX(event), Event.pointerY(event)];
      Droppables.show(pointer, this.element);
    }

    if(this.options.ghosting) {
      if (!this._originallyAbsolute)
        Position.relativize(this.element);
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false;
    if(success) {
      dropped = Droppables.fire(event, this.element);
      if (!dropped) dropped = false;
    }
    if(dropped && this.options.onDropped) this.options.onDropped(this.element);
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if(revert && Object.isFunction(revert)) revert = revert(this.element);

    var d = this.currentDelta();
    if(revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure')
        this.options.reverteffect(this.element,
          d[1]-this.delta[1], d[0]-this.delta[0]);
    } else {
      this.delta = d;
    }

    if(this.options.zindex)
      this.element.style.zIndex = this.originalZ;

    if(this.options.endeffect)
      this.options.endeffect(this.element);

    Draggables.deactivate(this);
    Droppables.reset();
  },

  keyPress: function(event) {
    if(event.keyCode!=Event.KEY_ESC) return;
    this.finishDrag(event, false);
    Event.stop(event);
  },

  endDrag: function(event) {
    if(!this.dragging) return;
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },

  draw: function(point) {
    var pos = this.element.cumulativeOffset();
    if(this.options.ghosting) {
      var r   = Position.realOffset(this.element);
      pos[0] += r[0] - Position.deltaX; pos[1] += r[1] - Position.deltaY;
    }

    var d = this.currentDelta();
    pos[0] -= d[0]; pos[1] -= d[1];

    if(this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
      pos[0] -= this.options.scroll.scrollLeft-this.originalScrollLeft;
      pos[1] -= this.options.scroll.scrollTop-this.originalScrollTop;
    }

    var p = [0,1].map(function(i){
      return (point[i]-pos[i]-this.offset[i])
    }.bind(this));

    if(this.options.snap) {
      if(Object.isFunction(this.options.snap)) {
        p = this.options.snap(p[0],p[1],this);
      } else {
      if(Object.isArray(this.options.snap)) {
        p = p.map( function(v, i) {
          return (v/this.options.snap[i]).round()*this.options.snap[i] }.bind(this));
      } else {
        p = p.map( function(v) {
          return (v/this.options.snap).round()*this.options.snap }.bind(this));
      }
    }}

    var style = this.element.style;
    if((!this.options.constraint) || (this.options.constraint=='horizontal'))
      style.left = p[0] + "px";
    if((!this.options.constraint) || (this.options.constraint=='vertical'))
      style.top  = p[1] + "px";

    if(style.visibility=="hidden") style.visibility = ""; // fix gecko rendering
  },

  stopScrolling: function() {
    if(this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },

  startScrolling: function(speed) {
    if(!(speed[0] || speed[1])) return;
    this.scrollSpeed = [speed[0]*this.options.scrollSpeed,speed[1]*this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },

  scroll: function() {
    var current = new Date();
    var delta = current - this.lastScrolled;
    this.lastScrolled = current;
    if(this.options.scroll == window) {
      with (this._getWindowScroll(this.options.scroll)) {
        if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
          var d = delta / 1000;
          this.options.scroll.scrollTo( left + d*this.scrollSpeed[0], top + d*this.scrollSpeed[1] );
        }
      }
    } else {
      this.options.scroll.scrollLeft += this.scrollSpeed[0] * delta / 1000;
      this.options.scroll.scrollTop  += this.scrollSpeed[1] * delta / 1000;
    }

    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta / 1000;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta / 1000;
      if (Draggables._lastScrollPointer[0] < 0)
        Draggables._lastScrollPointer[0] = 0;
      if (Draggables._lastScrollPointer[1] < 0)
        Draggables._lastScrollPointer[1] = 0;
      this.draw(Draggables._lastScrollPointer);
    }

    if(this.options.change) this.options.change(this);
  },

  _getWindowScroll: function(w) {
    var T, L, W, H;
    with (w.document) {
      if (w.document.documentElement && documentElement.scrollTop) {
        T = documentElement.scrollTop;
        L = documentElement.scrollLeft;
      } else if (w.document.body) {
        T = body.scrollTop;
        L = body.scrollLeft;
      }
      if (w.innerWidth) {
        W = w.innerWidth;
        H = w.innerHeight;
      } else if (w.document.documentElement && documentElement.clientWidth) {
        W = documentElement.clientWidth;
        H = documentElement.clientHeight;
      } else {
        W = body.offsetWidth;
        H = body.offsetHeight;
      }
    }
    return { top: T, left: L, width: W, height: H };
  }
});

Draggable._dragging = { };

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element   = $(element);
    this.observer  = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function() {
    Sortable.unmark();
    if(this.lastValue != Sortable.serialize(this.element))
      this.observer(this.element)
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

  sortables: { },

  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {
      if(element.id && Sortable.sortables[element.id]) return element;
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if(!element) return;
    return Sortable.sortables[element.id];
  },

  destroy: function(element){
    element = $(element);
    var s = Sortable.sortables[element.id];

    if(s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d){ Droppables.remove(d) });
      s.draggables.invoke('destroy');

      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({
      element:     element,
      tag:         'li',       // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree:        false,
      treeTag:     'ul',
      overlap:     'vertical', // one of 'vertical', 'horizontal'
      constraint:  'vertical', // one of 'vertical', 'horizontal', false
      containment: element,    // also takes array of elements (or id's); or false
      handle:      false,      // or a CSS class
      only:        false,
      delay:       0,
      hoverclass:  null,
      ghosting:    false,
      quiet:       false,
      scroll:      false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format:      this.SERIALIZE_RULE,

      // these take arrays of elements or ids and can be
      // used for better initialization performance
      elements:    false,
      handles:     false,

      onChange:    Prototype.emptyFunction,
      onUpdate:    Prototype.emptyFunction
    }, arguments[1] || { });

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      revert:      true,
      quiet:       options.quiet,
      scroll:      options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay:       options.delay,
      ghosting:    options.ghosting,
      constraint:  options.constraint,
      handle:      options.handle };

    if(options.starteffect)
      options_for_draggable.starteffect = options.starteffect;

    if(options.reverteffect)
      options_for_draggable.reverteffect = options.reverteffect;
    else
      if(options.ghosting) options_for_draggable.reverteffect = function(element) {
        element.style.top  = 0;
        element.style.left = 0;
      };

    if(options.endeffect)
      options_for_draggable.endeffect = options.endeffect;

    if(options.zindex)
      options_for_draggable.zindex = options.zindex;

    // build options for the droppables
    var options_for_droppable = {
      overlap:     options.overlap,
      containment: options.containment,
      tree:        options.tree,
      hoverclass:  options.hoverclass,
      onHover:     Sortable.onHover
    };

    var options_for_tree = {
      onHover:      Sortable.onEmptyHover,
      overlap:      options.overlap,
      containment:  options.containment,
      hoverclass:   options.hoverclass
    };

    // fix for gecko engine
    Element.cleanWhitespace(element);

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if(options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each( function(e,i) {
      var handle = options.handles ? $(options.handles[i]) :
        (options.handle ? $(e).select('.' + options.handle)[0] : e);
      options.draggables.push(
        new Draggable(e, Object.extend(options_for_draggable, { handle: handle })));
      Droppables.add(e, options_for_droppable);
      if(options.tree) e.treeNode = element;
      options.droppables.push(e);
    });

    if(options.tree) {
      (Sortable.findTreeElements(element, options) || []).each( function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[element.identify()] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.tag);
  },

  findTreeElements: function(element, options) {
    return Element.findChildren(
      element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if(Element.isParent(dropon, element)) return;

    if(overlap > .33 && overlap < .66 && Sortable.options(dropon).tree) {
      return;
    } else if(overlap>0.5) {
      Sortable.mark(dropon, 'before');
      if(dropon.previousSibling != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if(nextElement != element) {
        var oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if(dropon.parentNode!=oldParentNode)
          Sortable.options(oldParentNode).onChange(element);
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },

  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);

    if(!Element.isParent(dropon, element)) {
      var index;

      var children = Sortable.findElements(dropon, {tag: droponOptions.tag, only: droponOptions.only});
      var child = null;

      if(children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize (children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize (children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize (children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }

      dropon.insertBefore(element, child);

      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if(Sortable._marker) Sortable._marker.hide();
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if(sortable && !sortable.ghosting) return;

    if(!Sortable._marker) {
      Sortable._marker =
        ($('dropmarker') || Element.extend(document.createElement('DIV'))).
          hide().addClassName('dropmarker').setStyle({position:'absolute'});
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = dropon.cumulativeOffset();
    Sortable._marker.setStyle({left: offsets[0]+'px', top: offsets[1] + 'px'});

    if(position=='after')
      if(sortable.overlap == 'horizontal')
        Sortable._marker.setStyle({left: (offsets[0]+dropon.clientWidth) + 'px'});
      else
        Sortable._marker.setStyle({top: (offsets[1]+dropon.clientHeight) + 'px'});

    Sortable._marker.show();
  },

  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];

    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) continue;

      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };

      /* Get the element containing the children and recurse over it */
      if (child.container)
        this._tree(child.container, options, child);

      parent.children.push (child);
    }

    return parent;
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || { });

    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };

    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) index = '[' + node.position + ']' + index;
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || { });

    return $(this.findElements(element, options) || []).map( function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || { });

    var nodeMap = { };
    this.findElements(element, options).each( function(n) {
        if (n.id.match(options.format))
            nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
        n.parentNode.removeChild(n);
    });

    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },

  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || { });
    var name = encodeURIComponent(
      (arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map( function (item) {
        return [name + Sortable._constructIndex(item) + "[id]=" +
                encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map( function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) return false;
  if (child.parentNode == element) return true;
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
  if(!element.hasChildNodes()) return null;
  tagName = tagName.toUpperCase();
  if(only) only = [only].flatten();
  var elements = [];
  $A(element.childNodes).each( function(e) {
    if(e.tagName && e.tagName.toUpperCase()==tagName &&
      (!only || (Element.classNames(e).detect(function(v) { return only.include(v) }))))
        elements.push(e);
    if(recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if(grandchildren) elements.push(grandchildren);
    }
  });

  return (elements.length>0 ? elements.flatten() : []);
};

Element.offsetSize = function (element, type) {
  return element['offset' + ((type=='vertical' || type=='height') ? 'Height' : 'Width')];
};
/* /assets/r20131.3.2-4/pqc/javascript/pqmultiemail.js */;
Tapestry.Validator.pqmultiemail = function(field, message) {
	field.addValidator(function(value) {
		if (!Tapestry.Validator.pqmultiemail.validate(value.trim()))
			throw message;
	});
}

Tapestry.Validator.pqmultiemail.validate = function(emailStr) {
	if (emailStr.length == 0) {
		return true;
	} else {
		var emails_array = emailStr.split(new RegExp("[,;]", "g"));
		for (i = 0; i < emails_array.length; i++) {
			if (!Tapestry.Validator.pqemail.validate(emails_array[i].trim()))
				return false;
		}
		return true;
	}
}
/* /assets/r20131.3.2-4/pqc/javascript/Cookies.js */;
var Cookies =
{
	create : function(name, value, days)
	{
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			var expires = "; expires=" + date.toGMTString();
		} else {
			var expires = "";
		}
		document.cookie = name + "=" + value + expires + "; path=/";
	},

	read : function(name)
	{
		var nameEq = name + "=";
		var arr = document.cookie.split(';');
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
	},
	
	remove : function(name)
	{
		Cookies.create(name, "" ,-1);
	}
};

/* /assets/r20131.3.2-4/pqc/javascript/TimezoneCookie.js */;
var Cookies2 =
{
	create : function(name, value, days)
	{
		if (days) {
			var date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			var expires = "; expires=" + date.toGMTString();
		} else {
			var expires = "";
		}
		document.cookie = name + "=" + value + expires + "; path=/";
	},

	read : function(name)
	{
		var nameEq = name + "=";
		var arr = document.cookie.split(';');
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
	},
	
	remove : function(name)
	{
		Cookies.create(name, "" ,-1);
	}
};


function checkTZCookie(){
	if (Cookies2.read("oneSearchTZ") == null) {
		var systemsDate = new Date();
		Cookies2.create("oneSearchTZ",-systemsDate.getTimezoneOffset() );
	}
}


checkTZCookie();
/* /assets/r20131.3.2-4/pqc/javascript/ToggleDiv.js */;
/* 
 Utility JS funtion to toggle a section/div and change the link text and/or styles.
 Usage : <!--
 		 <a href="#" id="showHideLinkId"><span id="linkTextId">Show</span></a>
         <div id="divId">Div that gets toggled</div> 
         -->
*/

function toggleDiv(divId, showHideLinkId, linkTextId) {
	var toggleDiv = $(divId);
	Effect.toggle(toggleDiv, 'blind', {duration: 1.0});
	var linkTextDiv = $(linkTextId);
	if(linkTextDiv) {
		var text = linkTextDiv.innerHTML;
		linkTextDiv.innerHTML = (text == 'Show all' ? 'Show less' : 'Show all');		
		var showHideLinkDiv = $(showHideLinkId);
		if (showHideLinkDiv) {
			showHideLinkDiv.toggleClassName("indicator_menu_down");
			showHideLinkDiv.toggleClassName("indicator_menu_up");
		}
	}
	return false;
}

function toggleDiv2(divId, showHideLinkId, linkTextId_0, linkTextId_1) {
	var extraLinkTextDiv = $(linkTextId_1);
	if(extraLinkTextDiv) {
		var text = extraLinkTextDiv.innerHTML;
		extraLinkTextDiv.innerHTML = (text == 'Show all' ? 'Show less' : 'Show all');				
	}
	return toggleDiv(divId, showHideLinkId, linkTextId_0);
}

function toggleStyle(classId, spanId, bgColor) {
	$$(classId).each( function(elem){
		elem.style.backgroundColor='#ffffff'}
	);
	$(spanId).style.backgroundColor= bgColor;
}
/* /assets/r20131.3.2-4/pqc/javascript/Trim.js */;
String.prototype.trim = function() {
	return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, "");
}

/* /assets/r20131.3.2-4/pqc/javascript/Util.js */;

function r(f) {  
  return function() {
    var args = [];    
    for(var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }   
    this.each(function(e) {
      if (e && (typeof e[f] == 'function' || typeof e[f] == 'object')) 
         e[f].apply(e, args);
    });
    return this;
  }
}

function om(p1, p2) {
  for( prop in p1 ) {    
    if( p1.hasOwnProperty( prop ) ){          
      p2[prop] = r(prop);
    }
  }
}
            
om(Element.Methods, Array.prototype);

function DomObserver() {
  this.observe = function(trigger, classOrId, f) {
		  if (classOrId.indexOf(".") === 0) 
			  this._add(trigger, classOrId.substr(1), f, 'classes');
			  else if (classOrId.indexOf("#") === 0) 
				  this._add(trigger, classOrId.substr(1), f, 'ids');
				       else this._add(trigger, classOrId, f, 'ids');
		}
	
  this._add = function(trigger, className, f, triggerType) {    
    if (this[triggerType][trigger] == undefined) {
      this[triggerType][trigger] = {};
    }    
    if (this[triggerType][trigger][className] == undefined) {
      this[triggerType][trigger][className] = [];
    }
    this[triggerType][trigger][className].push(f);
  }

  this.createObserver = function(trigger) {
    this.classes[trigger] = [];
    this.ids[trigger] = [];
    document.observe(trigger, function (e, el) {      
    if (e.button == 0){  
    element = e.element();
      while (element) {
	      var elementClasses = $w(element.className);
	      for(var x=0;x<elementClasses.length;x++) {
	        if (this.classes[trigger][elementClasses[x]] && this.classes[trigger][elementClasses[x]].length > 0) {
	          var fs = this.classes[trigger][elementClasses[x]];
	          for(var y=0;y<fs.length;y++) {
	            this.classes[trigger][elementClasses[x]][y](e, element);
	          }
	          Event.stop(e);// important!
	          return;
	        }
	      }
	      if (element.parentNode)
	      {
	    	  element = element.parentNode;
	      }
	      else
	      {
	    	break;  
	      }
      }
    }
  } 
  .bind(this))
  };
  
  this.classes = {};
  this.ids = {};
  ['click', 'keypress', 'keyup', 'keydown'].each(function(i) {this.createObserver(i)}.bind(this))  
}

document.observer = new DomObserver();

// example: document.observer('click' /*event*/, classOrId, function (event, element) {});
//
// document.observer('click', '.test4', function(e, el) {
//	  alert(el.innerHTML);
//	});

function loadWebTrends() {
	var s=document.createElement("script"); s.async=false; s.src="/extras/webtrends/webtrends10.3.7.load.js";
    var s2=document.getElementsByTagName("script")[0]; s2.parentNode.insertBefore(s,s2);
}

function callWebTrendsWithRetry(title, actionName, actionType) {
	if(window.dcsMultiTrack) {
		dcsMultiTrack('WT.ti', title, actionName, actionType, 'DCS.dcsuri', '/' + actionType, 'WT.es', 'search.proquest.com/' + actionName + '/' + actionType);
	} else {
		loadWebTrends();
		setTimeout(function() {
			dcsMultiTrack('WT.ti', title, actionName, actionType, 'DCS.dcsuri', '/' + actionType, 'WT.es', 'search.proquest.com/' + actionName + '/' + actionType);
		}, 2000);
	}
}

/* /assets/r20131.3.2-4/core/corelib/mixins/autocomplete.js */;
// Copyright 2008, 2010 The Apache Software Foundation
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

Tapestry.Initializer.autocompleter = function(spec)
{
    $T(spec.elementId).autocompleter = new Ajax.Autocompleter(spec.elementId, spec.menuId, spec.url, spec.config);
};
/* /assets/r20131.3.2-4/pqc/components/Submit.js */;
function submitOnEnter(submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit) {
	if( submitOnEnter && formId) {
		var form = $(formId);
		if (form)
			form.observe('keydown', submitOnEnterFormKeyDown.bindAsEventListener(this, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit));
	}
	
	var submitLink = $(submitLinkId);
	if(submitLink) {
		submitLink.observe('click',
			submitOnEnterClick.bindAsEventListener(this, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit)
		);
	}
}

function submitOnEnterFormKeyDown(e, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit) {
	var targetList, li;
	
	element = e.findElement();
	if (element && element.form && element.form.id == formId) {
		submitOnEnterKeyDown(e, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit)
	}
}


function submitOnEnterKeyDown(e, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit){
	if (e.keyCode == 13 && $(submitLinkId).readAttribute('disabled') != 'disabled' &&
		(!preSubmit || preSubmit.length == 0 || eval(preSubmit))) {	
			if (!Ajax || !Ajax.Autocompleter || !Ajax.Autocompleter.blockSumbitOnEnter) {
				$(formId).setSubmittingElement(submitLinkId);
				setTimeout(function() {
					if( asAjax ) {
						$(formId).fire('pq:time');
						$(formId).fire(Tapestry.FORM_PROCESS_SUBMIT_EVENT);
					} else {
						$(formId).fire('pq:time');
						$(formId).submit();
					}
					if(onClick && onClick.length > 0) eval(onClick);
				}, 300);
			}
			Event.stop(e);
	}
}

function submitOnEnterClick(l, submitLinkId, formId, submitOnEnter, asAjax, onClick, preSubmit){
	if( $(submitLinkId).readAttribute('disabled') != 'disabled' &&
		(!preSubmit || preSubmit.length == 0 || eval(preSubmit))) {
			$(formId).setSubmittingElement(submitLinkId);
			if( asAjax ) {
				$(formId).fire('pq:time');
				$(formId).fire(Tapestry.FORM_PROCESS_SUBMIT_EVENT);
			} else {
				$(formId).fire('pq:time');
				$(formId).submit();
			}
			Event.stop(l);
			if(onClick && onClick.length > 0) eval(onClick);
	}
}
/* /assets/r20131.3.2-4/pqc/mixins/ClosableAutoComplete.js */;
// Replacement for the Scriptaculous Ajax autocompleter.
// Allows for a close link, which is the bottom entry in the list,
// and also stops the first entry from being highlighted by default.
Ajax.Autocompleter = Class.create(Autocompleter.Base, {
	initialize: function(element, update, url, options) {
		this.elementId = element;
		this.baseInitialize(element, update, options);
		this.options.asynchronous  = true;
		this.options.onComplete    = this.onComplete.bind(this);
		this.options.onShow        = this.onShow.bind(this);
		this.options.onHide        = this.onHide.bind(this);
		this.options.defaultParams = this.options.parameters || null;
		this.url                   = url;
		
		// Keep a cache of suggestions.
		this.suggestionCache = {};
			
		// This should store the original partial term used to generate completions.
		this.originalTerm = "";
		
		
		
		// Store a static reference to this field, indicatign whether the autocomplete
		// is enabled or not.
		Ajax.Autocompleter[element] = true;
		
		Ajax.Autocompleter.blockSumbitOnEnter = false;
		
		Ajax.Autocompleter.disabled = (this.options.disabled)? true : false;
		
	},
	
	//Need to fire event "autocomplete:open" to fix the overlap issue in IE"
	//This event is handled in BasicSearchBox.js
	onShow: function(element, update){
		if (this.closed == true || this.active == false) {
			this.hide();
			return;
		}
		
        if(!update.style.position || update.style.position=='absolute') {
        	update.style.position = 'absolute';

        	Element.clonePosition(update,element, {
        		setHeight: false,
                offsetTop: element.offsetHeight
              });

        	// The box is absolutely positioned, so will appear in the DOM at the correct position as long as the offset
        	// for the input box height is correct.
        	update.style.top = element.offsetHeight;
        }

        // Fixes IE bug where very long terms would misalign the autocomplete box
        if (update.style.left.charAt(0) == "-") {
    	   update.style.left = element.getStyle("margin-right");
       	}
       
        Effect.Appear(update,{duration:0.15});
       
        if (!this.options.autoExecute) {
        	Ajax.Autocompleter.blockSumbitOnEnter = true;
        }
        
        this.element.fire("autocomplete:open");
    },
    
    //Need to fire event "autocomplete:close" to fix the overlap issue in IE"
	//This event is handled in BasicSearchBox.js
    onHide: function(element, update){ 
    	new Effect.Fade(update,{duration:0.15});
    	if (!this.options.autoExecute) {
    		window.setTimeout(function() {
    			Ajax.Autocompleter.blockSumbitOnEnter = false; }, 1000);
        }
    	this.element.fire("autocomplete:close")
    },

	getUpdatedChoices: function() {
	    this.startIndicator();
	    var entry = encodeURIComponent(this.options.paramName) + '=' + 
	    encodeURIComponent(this.getToken());

	    this.options.parameters = this.options.callback ?
	    		this.options.callback(this.element, entry) : entry;

	    if(this.options.defaultParams) 
	    	this.options.parameters += '&' + this.options.defaultParams;
	    
	    new Ajax.Request(this.url, this.options);
	},

	onComplete: function(request) {
		this.updateChoices(request.responseText);
	},
  
	// Need to detect if the contents of the text field becomes empty.  If it does we'll want to
	// Unset the closed flag,
	// Also now handle KEY_RETURN, in the case where you haven't selected anything, ie you want to
	// run the search
	onKeyPress: function($super,event) {
		// Check if autocomplete has been disabled
		if (Ajax.Autocompleter.disabled) {
			return;
		}
		
		// Check if this field has had autocomplete disabled
		if (!Ajax.Autocompleter[this.elementId]) {
			return;
		}
				
		// Check if the field is empty.  If so reset the closed tag
		if(this.closed && this.getToken().length == 0) {
			this.closed = false;
		}  	
		
		if (event.keyCode == Event.KEY_ESC &&  this.active == false) {
			return;
		}
		
		if(this.active)
		      switch(event.keyCode) {
		       case Event.KEY_TAB:
		       case Event.KEY_RETURN:
		    	 if (this.index == this.entryCount-1) {
		    		 Event.stop(event);
		    	 }
		    	  
		    	 if (!this.options.autoExecute) {
		    		 Event.stop(event);
		    	 }

		    	 if(this.observer) {
	   		    	clearTimeout(this.observer);
	   		     }

		         this.hide();
		         this.active = false;
		         return;
		       case Event.KEY_ESC:
		    	 this.hide();
		         this.active = false;
		         this.element.value = this.originalTerm;
		         Event.stop(event);
		         return;
		       case Event.KEY_LEFT:
		       case Event.KEY_RIGHT:
		         return;
		       case Event.KEY_UP:
		         this.markPrevious();
		         this.render();
		         Event.stop(event);
		         this.pasteCurrent();
		         return;
		       case Event.KEY_DOWN:
		         this.markNext();
		         this.render();
		         Event.stop(event);
		         this.pasteCurrent();
		         return;
		      }
		     else 
		       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN || event.keyCode == 0) {
		    	   // If the autocomplete is not active, and we've hit enter, then we've submitted 
		    	   // the form, don't ever open the autocomplete.
		    	   if(event.keyCode==Event.KEY_RETURN) {
		    		   if(this.observer) {
		   		    		clearTimeout(this.observer);
		   		       }
		    		   this.closed = true;
		    		   return;
		    	   }
		       }

		    this.changed = true;
		    this.hasFocus = true;

		    if(this.observer) clearTimeout(this.observer);
		      this.observer = 
		        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
		
	},

	markPrevious: function() {
		if(this.index > -1) {
			this.index--;
		} 
		this.scrollToSelection(this.getEntry(this.index));
	},

	markNext: function() {
		if(this.index < this.entryCount-1) {
			this.index++;
		} 
		this.scrollToSelection(this.getEntry(this.index));
	},
	
	// Per bug NP2-14902:  fix for page jumping when arrow keys used to navigate
	scrollToSelection: function(selection) {
		if(selection!=null) {
			var offsetTop = selection.viewportOffset().top;
			var selection_bottom = offsetTop + selection.getHeight();
			if(selection_bottom > document.viewport.getHeight()){
				selection.scrollIntoView(false);
			} else if (offsetTop < 0) {
				selection.scrollIntoView(true);
			}
		} else {
			var input = $(this.elementId);
			if(input.viewportOffset().top<0) {
				input.scrollIntoView(true);
			}
		}
	},
	
	// Paste the currently selected search term into the search box
	pasteCurrent: function() {
		
		this.element.value = "";		
		
		if (this.index == -1 || this.index == this.entryCount - 1) {
			this.element.value = this.originalTerm;
		} else {
			var currentEntry = this.getCurrentEntry();
			if(currentEntry!=null) {
				this.updateElement(currentEntry);
			}
		}
	},
	
	// Override to ensure index gets set to -1
	updateChoices: function(choices) {
		this.suggestionCache[this.originalTerm] = choices;
		
		if(!this.changed && this.hasFocus) {
			this.update.innerHTML = choices;
			Element.cleanWhitespace(this.update);
			if(this.update.down()) Element.cleanWhitespace(this.update.down());

			if(this.update.firstChild && this.update.down().childNodes) {
				this.entryCount = 
					this.update.down().childNodes.length;
				for (var i = 0; i < this.entryCount; i++) {
					var entry = this.getEntry(i);
					entry.autocompleteIndex = i;
					this.addObservers(entry);
				}
			} else { 
				this.entryCount = 0;
			}

			this.stopIndicator();

			// Make sure index is set to -1
			this.index = -1;
      
			if(this.entryCount==1 && this.options.autoSelect) {
				this.selectEntry();
				this.hide();
			} else {
				this.render();
			}
		}
	},
  
  
	// Override.  Block opening of autocomplete box, if box has been closed
	onObserverEvent: function() {
		this.changed = false;   
		this.tokenBounds = null;
		if(!this.closed && this.getToken().length>=this.options.minChars) {
			this.active = true;
			this.getUpdatedChoices();
		} else {
			this.active = false;
			this.hide();
		}
		this.oldElementValue = this.element.value;
	},
	
	// Override.  Check for return of null from getCurrentEntry. 
	selectEntry: function() {
		this.active = false;
  		var currentEntry = this.getCurrentEntry();
  		if (currentEntry != null) {
  			this.updateElement(currentEntry);
  			if (this.options.formId && this.options.autoExecute) {
  				$(this.options.formId).submit();
  			}
  		}  		
	},
  
	// Override to detect close link, which will be the bottom link
	getCurrentEntry: function() {
		// First check we're not grabbing the last entry (ie close)  
		if (this.index == this.entryCount-1) {
			this.closed = true;
			this.hide();
			this.element.value = this.originalTerm;
			this.element.focus();
			// Need to permantly disable autocomplete for duration of session
			new Ajax.Request(this.options.disableUrl);
			
			Ajax.Autocompleter.disabled = true;
		
			
			return null;
		} else {
			return this.getEntry(this.index);
		}
	},
	
	// Override updateElement so that the end characters are not appended in the search term. 
	updateElement: function(selectedElement) {
	    if (this.options.updateElement) {
	      this.options.updateElement(selectedElement);
	      return;
	    }
	    var value = '';
	    if (this.options.select) {
	      var nodes = $(selectedElement).select('.' + this.options.select) || [];
	      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
	    } else
	      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

	    this.element.value = value;
	    this.oldElementValue = this.element.value;
	    this.element.focus();

	    if (this.options.afterUpdateElement)
	      this.options.afterUpdateElement(this.element, selectedElement);
	  },
	  
	// Override getUpdatedChoices so we can append the field as a parameter	
	getUpdatedChoices: function() {
	    
		this.originalTerm = this.getToken();
		
		if (this.suggestionCache[this.originalTerm]) { 
			this.updateChoices(this.suggestionCache[this.originalTerm]);
			return;
		}
		
		this.startIndicator();

	    var entry = encodeURIComponent(this.options.paramName) + '=' +
	      encodeURIComponent(this.getToken());

	    this.options.parameters = this.options.callback ?
	      this.options.callback(this.element, entry) : entry;

	    if(this.options.defaultParams)
	      this.options.parameters += '&' + this.options.defaultParams;
	    
	    if (this.options.autocompleteField) {
	    	this.options.parameters += "&field=" + this.options.autocompleteField;
	    } else if(Ajax.Autocompleter[this.elementId]) {
	    	this.options.parameters += "&field=" + Ajax.Autocompleter[this.elementId];
	    }
	    
	    new Ajax.Request(this.url, this.options);
	  }
});
/* /assets/r20131.3.2-4/pqc/mixins/ClickOnce.js */;
// A class that ignores clicks after the first one.
var ClickOnce = Class.create();
var alreadyClickedOnce = false;

ClickOnce.prototype = {
	initialize: function(element) {
		Event.observe($(element), 'click', this.doClickOnce.bindAsEventListener(this));
	},
	doClickOnce: function(e) {
		if (alreadyClickedOnce) {
			e.stop();
		}
		alreadyClickedOnce = true;
	},
	
	resetClicked: function() {
		alreadyClickedOnce = false;
	}
}

/* /assets/r20131.3.2-4/pqc/mixins/ZoneUpdater.js */;
var ZoneUpdater = Class.create();

ZoneUpdater.prototype = {

	initialize : function(zoneElementId, listeningElement, event, link, zone,
			placeholder) {

		this.zoneElement = $(zoneElementId);
		this.event = event;
		this.link = link;
		this.placeholder = placeholder;
		$T(this.zoneElement).zoneId = zone;
		listeningElement.observe(this.event, this.updateZone
				.bindAsEventListener(this));
	},

	updateZone : function(event) {
		var zoneObject = Tapestry.findZoneManager(this.zoneElement);
		if (!zoneObject)
			return;
		var param;
		if (this.zoneElement.value) {
			param = this.zoneElement.value;
		}
		if (!param)
			param = ' ';
		param = this.encodeForUrl(param);
		var updatedLink = this.link.gsub(this.placeholder, param);
		zoneObject.updateFromURL(updatedLink);
	},

	encodeForUrl : function(string) {
		/**
		 * 
		 * See equanda.js for updated version of this
		 * 
		 */
		string = string.replace(/\r\n/g, "\n");
		var res = "";
		for ( var n = 0; n < string.length; n++)
		{
			var c = string.charCodeAt(n);
			if ('$' == string.charAt(n))
			{
				res += '$$';
			}
			else if (this.inRange(c, "AZ") || this.inRange(c, "az")
					|| this.inRange(c, "09") || this.inRange(c, "..") || this.inRange(c, "__"))
			{
				res += string.charAt(n)
			}
			else
			{
				var tmp = c.toString(16);
				while (tmp.length < 4)
					tmp = "0" + tmp;
				res += '$' + tmp;
			}
		}
		return res;
	},
	inRange : function(code, range) {
		return code >= range.charCodeAt(0) && code <= range.charCodeAt(1);
	}
}
/* /assets/r20131.3.2-4/pqc/components/SubMenu.js */;
var subMenu = Class.create(
{
	initialize: function(spec)
	{	
		this.triggerId = spec.triggerId;
		this.targetElm = $(spec.targetElm);
		this.menuDiv = spec.targetElm;
		
		$(this.triggerId).observe('click', this.openDropDown.bindAsEventListener(this));		
		if (Prototype.Browser.IE) {
			$(this.menuDiv).observe('mouseleave', this.closeDropDown.bindAsEventListener(this));
		} else {
			$(this.menuDiv).observe('mouseout', this.closeDropDown.bindAsEventListener(this));
		}

	},
	openDropDown: function(event) {
		if (this.targetElm.getStyle('display') == 'block') {
			this.targetElm.setStyle("display:none");
			return;
		}
		this.targetElm.setStyle("display:block");
	},
	closeDropDown: function(event) {
		var tg = event.target;
		if (tg.nodeName != 'DIV') return;
		var reltg = (event.relatedTarget) ? event.relatedTarget : event.toElement;
		while (reltg != tg && reltg.nodeName != 'BODY')
			reltg= reltg.parentNode;
		if (reltg== tg) return;
		
		this.targetElm.setStyle("display:none");
	}
});

Tapestry.Initializer.subMenu = function(spec)
{
	new subMenu(spec);
}


/* /assets/r20131.3.2-4/pqc/components/SubMenuHover.js */;
var SubMenuHover = Class.create(
{
        initialize: function(spec) {
            this.menuDivId = spec.targetElm;
            this.triggerLinkId = spec.triggerLink;
            this.visible = false;
            this.updateURL = spec.updateURL;
    		this.zoneID = spec.zoneId;
    		this.loadOnce = spec.loadOnce;
            
            if (!SubMenuHover.Storage) {
				Event.observe(document, "mousemove", this.handleMouseMove.bind(this));
				document.observe('keydown', this.keyboardAction.bind(this));
				document.observe('keyup', this.keyboardActionUp.bind(this));
				SubMenuHover.Storage = $H();
			}
            SubMenuHover.Storage.set(spec.triggerLink, this);
        },
        handleMouseMove: function(event) {
    		var trigger = event.findElement();
    		if (trigger) {
    			 var tip = SubMenuHover.Storage.get(trigger.id);
    			 if (!tip) {
    				 if ((trigger.classList && trigger.classList.contains('dropdownMenu')) || (trigger.className && trigger.className.indexOf('dropdownMenu') != -1)) {
    				 	trigger = $(trigger).up('div');
    				 	if (trigger)
    				 		tip = SubMenuHover.Storage.get(trigger.id);
    				 }
    			 }
    			 if (tip) {
    				 if (SubMenuHover.LastOpened != trigger.id) {
    					 if (SubMenuHover.LastOpened !== null) {
    						 var last = SubMenuHover.Storage.get(SubMenuHover.LastOpened);
    						 last.closeLayer(event);
    					 }
    					 SubMenuHover.LastOpened = trigger.id;
    					 tip.openDropDown(event);
    				 } 
    			 } else {
    				 if (SubMenuHover.LastOpened != null) {
    					 var div = Event.findElement(event, 'div.dropdownMenu');
    					 if (div == null) {
    						 if (SubMenuHover.LastOpenedCloseTime == null) {
    							 SubMenuHover.LastOpenedCloseTime = new Date().getTime();
    						 } else {
    							 var elapsed = new Date().getTime() - SubMenuHover.LastOpenedCloseTime;
    							 if (elapsed > 50) {
	    							 tip = SubMenuHover.Storage.get(SubMenuHover.LastOpened);
	    							 tip.closeLayer();
    							 }
    						 }
    					 }
    				 }
    				 
    			 }
    				 
    		}
    	},
        openDropDown: function(event) {
        	if (! this.visible) {
        		if (this.updateURL)
					this.ajaxLoad(event);
        		this.visible = true;
	            $(this.menuDivId).setStyle("display:block");
	            if(Prototype.Browser.IE){
	            	if ((document.activeElement)){ 
	            		if((document.activeElement).tagName.toLowerCase() == "input"){
	            			SubMenuHover.LastFocusedElm = (document.activeElement);
	            			SubMenuHover.LastFocusedElm.blur();
	            		}
	            	}
	            }
	            var targetid = this.getTargetId(event);
	            if (targetid != null && targetid != "")
	            	$(targetid).fire('pq:showSubMenu');
        	}
        },
        ajaxLoad: function(event) {
        	if (!this.trigger)
				this.trigger = $(this.triggerLinkId);
			$T(this.trigger).zoneId = this.zoneID;
			
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
        getTargetId: function(event) {
        	var target = event.target; 
        	if (target.id == null || target.id == "")
        		target = target.up();
        	if ((target.id == null || target.id == "") && target != document)
        		target = target.up();
        	return target.id;
        },
        closeLayer: function(event) {
        	SubMenuHover.LastOpened = null;
        	SubMenuHover.LastOpenedCloseTime = null;
        	this.visible = false;
        	$(this.menuDivId).setStyle("display:none");

            if(Prototype.Browser.IE){
            	if(SubMenuHover.LastFocusedElm != null) {	
            		if(SubMenuHover.LastFocusedElm.tagName.toLowerCase() == "input"){
            			SubMenuHover.LastFocusedElm.focus();
            		}
            		SubMenuHover.LastFocusedElm = null;
            	}
            }
           	$(this.triggerLinkId).fire('pq:hideSubMenu');
        },
        keyboardAction: function(event) {
            var keycode = event.keyCode;
            
            var escapeKey;
            if (event.DOM_VK_ESCAPE) { escapeKey = event.DOM_VK_ESCAPE; } // mozilla
            else { escapeKey = 27; } // ie

            
            if (keycode == escapeKey) {
            	if (SubMenuHover.LastOpened != null) { 
            		tip = SubMenuHover.Storage.get(SubMenuHover.LastOpened);
            		tip.closeLayer(event);
            	}
            } 
        },
        keyboardActionUp: function(event) {
            var keycode = event.keyCode;
            
            var tabKey;
            if (event.DOM_VK_TAB) { tabKey = event.DOM_VK_TAB; } // mozilla
            else { tabKey = 9; } // ie
            
            
            if (keycode == tabKey) {
            	var tip = SubMenuHover.Storage.get(document.activeElement.id);
            	if (tip) {
            		SubMenuHover.LastOpened = document.activeElement.id;
            		tip.openDropDown(event);
            	} else if (SubMenuHover.LastOpened != null) {
            		var activeElement = $(document.activeElement.id);
            		if (activeElement) {
	            		var dropdown = activeElement.up('div.dropdownMenu');
	            		if (dropdown == null) {
		            		tip = SubMenuHover.Storage.get(SubMenuHover.LastOpened);
		            		tip.closeLayer(event);
	            		}
            		}
            	}
            }
        }
});


SubMenuHover.LastFocusedElm = null;
SubMenuHover.LastOpened = null;
SubMenuHover.LastOpenedCloseTime = null;
SubMenuHover.Storage;


Tapestry.Initializer.subMenuHover = function(spec)
{
      new SubMenuHover(spec);
}

/* /assets/r20131.3.2-4/pqc/components/EndSession.js */;
var EndSessionWarning = Class.create(
{
	initialize: function(spec)
	{
		this.timeout = spec.timeout;
		this.warntime = spec.warntime;
		this.pingURL = spec.pingURL;
		this.endSessionWarningCarryOnId = spec.endSessionWarningCarryOnId;
		this.endSessionWarningOverlayId = spec.endSessionWarningOverlayId;
		this.secondsText = spec.secondsText;
		this.minutesText = spec.minutesText;
		this.hoursText = spec.hoursText;
		
		this.sessonTimer = new PeriodicalExecuter(this.warn.bind(this), this.timeout - this.warntime - 5);
		$(this.endSessionWarningCarryOnId).observe('click', this.carryOn.bindAsEventListener(this));
		$('endSessionConfirmCancel').observe('click', this.cancelEnd.bindAsEventListener(this));
		
		this.createCookie();
	},
	warn: function(sessionPE)
	{
		sessionPE.stop();
		
		var warn = true;
		var ts = Cookies.read("osTimestamp");
		if (ts) {
			// Both cookie time and system time in seconds - makes comparisons easier to follow
			var sessTime = new Number(ts);
			var sysTime = new Date().getTime() / 1000;
			
			var timeDiff = sysTime - sessTime;
			var interval = this.timeout - this.warntime - 5;
			
			if (timeDiff < interval) {
				warn = false;
				
				// Reset session timer
				this.sessionTimer = new PeriodicalExecuter(this.warn.bind(this), interval - timeDiff);
			}
		}
		
		if (warn) {
			this.counter = this.warntime;
			this.warnSpan = $('warnTime');
			this.warnSpan.update( this.formatOutput() );
			this.warningTimer = new PeriodicalExecuter(this.countDown.bind(this), 1);
			Overlay.box.showOverlay(this.endSessionWarningOverlayId);
		}
	},
	// unwarn is called after a session has expired
	unwarn: function()
	{
		this.warningTimer.stop();
		Cookies.remove("AppVersion");
		Overlay.box.hideOverlay();
	},
	carryOn: function(event)
	{
		event.stop();
		this.unwarn();
		new Ajax.Request(this.pingURL);
		this.createCookie();
		this.resetWarning();
	},
	resetWarning: function()
	{
		this.sessonTimer = new PeriodicalExecuter(this.warn.bind(this), this.timeout - this.warntime - 5);
	},
	cancelEnd: function(event)
	{
		event.stop();
		Overlay.box.hideOverlay();
	},
	countDown: function()
	{
		this.counter--;
		this.warnSpan.update( this.formatOutput() );
		if (this.counter == 0) {
			// close the thesaurus browse window, if it is open. 
			if (window['wind'] != undefined) {
				wind.close(); 
				wind = null;
			}
			this.unwarn();
		}
	},
	formatOutput: function() {
		var hours, minutes, seconds, output="";
		seconds = this.counter % 60;
		minutes = Math.floor(this.counter / 60) % 60;
		hours = Math.floor(this.counter / 3600);
 
		if (hours > 0) {
			output += hours + " " + this.hoursText
		}
		if (minutes > 0) {
			if (output != "") output += " ";
			output += minutes + " " + this.minutesText;
		}
		
		if (output != "") output += " ";
		output += seconds + " " + this.secondsText;
 
		return output;
	},
	createCookie: function() {
		// Cookie stores timestamp in seconds, rather than millis
		Cookies.create("osTimestamp", new Date().getTime() / 1000);
	}
});

Tapestry.Initializer.endSessionWarning = function(spec)
{
	new EndSessionWarning(spec);
}

// Register an Ajax Responder to catch Ajax responses, and check for sessionEnded state.
// (see AjaxAccessDispatcher.java)
Ajax.Responders.register({
	onComplete: function(request, xmlReq, json) {
		if (request.transport.responseText == 'state:sessionEnded') {
			window.location.reload();
		}
	}
});

/* /assets/r20131.3.2-4/pqc/components/SearchTermsDynamicRows.js */;
var SearchTermsDynamicRows = Class.create(
{
	initialize: function(spec)
	{
		this.addText = spec.addTriggerText;
		this.removeText = spec.removeTriggerText;
		this.minRows = spec.minRows;
		this.maxRows = spec.maxRows;
		this.rowIndex = spec.rowIndex;
		
		this.updateTriggers();
	},
	getRowFragmentId: function(rowIndex)
	{
		return 'row' + rowIndex + 'frag';
	},
	addRowClick: function(event)
	{
		event.stop();
		var rowFragmentId = this.getRowFragmentId(this.rowIndex);
		this.resetRow(rowFragmentId);

		$(rowFragmentId).fire(Tapestry.CHANGE_VISIBILITY_EVENT, {visible : true}, true);
		// Set focus into the first revealed text input box, delay to allow reveal effect to finish.
		this.focusText.bind(this, rowFragmentId).delay(1.2);
		this.rowIndex++;
		this.updateTriggers();
	},
	removeRowClick: function(event)
	{
		event.stop();
		
		this.rowIndex--;
		var rowFragmentId = this.getRowFragmentId(this.rowIndex);

		$(rowFragmentId).fire(Tapestry.CHANGE_VISIBILITY_EVENT, {visible : false}, true);

		$(this.getRowFragmentId(this.rowIndex - 1)).select('textarea[type="textArea"]', 'input[type="text"]').each(function(e) {
					if (e && e.up('div').visible()) {
						try {
							e.focus();
							throw $break;
						} catch (err) { // catch it do nothing.
						}
					}
				});
		this.updateTriggers();
	},
	focusText: function(rowFragmentId)
	{
		var rowFragmentId = $(rowFragmentId).select('textarea[type="textArea"]', 'input[type="text"]').each(function (e) {
				if (e && e.up('div').visible()) {
					try{
						e.focus();
						//fire focus event, this will be handled in ThesaurusTrigger.js.
						document.fire('pq:focusQueryTerm', e.id);
						throw $break;
					} catch (err) { //catch it do nothing.
					}
				}
			}
		);
	},
	updateTriggers: function()
	{
		if (this.rowIndex > this.minRows) {
			this.enableRemoveTrigger();
		} else if (this.rowIndex <= this.minRows) {
			this.disableRemoveTrigger();
		}
		if (this.rowIndex < this.maxRows) {
			this.enableAddTrigger();
		} else if (this.rowIndex >= this.maxRows) {
			this.disableAddTrigger();
		}
	},
	enableAddTrigger: function()
	{
		if (this.addTrigger == null) {
			this.addTrigger = new Element('a', {'href': '#', 'id':'addRowLink','class':'float_left indicators_base_sprite indicator_expand'}).update(this.addText);
			$('addSTRow').update(this.addTrigger);
			this.addTrigger.observe('click', this.addRowClick.bindAsEventListener(this));
		}
	},
	disableAddTrigger: function()
	{
		if (this.addTrigger != null) {
			this.addTrigger.replace(this.addText);
			this.addTrigger = null;
		}
	},
	enableRemoveTrigger: function()
	{
		if (this.removeTrigger == null) {
			this.removeTrigger = new Element('a', {href: '#', 'id':'removeRowLink','class':'indicators_base_sprite indicator_collapse'}).update(this.removeText);
			$('removeSTRow').update(this.removeTrigger);
			this.removeTrigger.observe('click', this.removeRowClick.bindAsEventListener(this));
		}
	},
	disableRemoveTrigger: function()
	{
		if (this.removeTrigger != null) {
			this.removeTrigger.replace(this.removeText);
			this.removeTrigger = null;
		}
	},
	resetRow: function(rowFragmentId)
	{
		$(rowFragmentId).select('input[type="text"]').each(function(elem) {
			elem.value = "";
		});
	}
});

Tapestry.Initializer.searchTermsDynamicRows = function(spec)
{
	new SearchTermsDynamicRows(spec);
}

/* /assets/r20131.3.2-4/pqc/components/SearchTermFormRow.js */;
var SearchTermFormRowFieldSelectListener = Class.create({		
	initialize: function(spec) {
		this.selectId = spec.selectId;
		this.textFieldIds = spec.textFieldIds;
		this.autocompleteFields = spec.autocompleteFields;
		$(this.selectId).observe('change', this.handleSelectChange.bindAsEventListener(this));
	},

	handleSelectChange: function() {
		if (Ajax.Autocompleter) {
			var fieldValue = $F(this.selectId);
			var isAutocompleteField = null;
			this.autocompleteFields.each(
				function(autocompleteField) {
					isAutocompleteField |= (fieldValue == autocompleteField);
				}
			);
			
			this.textFieldIds.each(
				function(textFieldId) { 
					Ajax.Autocompleter[textFieldId] = (isAutocompleteField)? fieldValue : null;
				}
			);
		}
	}
	
});


Tapestry.Initializer.searchTermFormRow = function(spec) {
	var searchTermFormRowFieldSelectListener = new SearchTermFormRowFieldSelectListener(spec);
}



/* /assets/r20131.3.2-4/pqc/components/MultiDateRange.js */;

var DateRangeTypeSelector = Class.create(
{		
	initialize: function(spec) {
		this.selectId = spec.selectId;
		this.selectDropDown = $(this.selectId);
		this.startingLabelId = spec.startingLabelId;
		this.endingLabelId = spec.endingLabelId;
		this.dateId1 = spec.dateId1;
		this.date1 = $(this.dateId1);
		this.dateId2 = spec.dateId2;
		this.date2 = $(this.dateId2);
		this.onDateMessageId = spec.onDateMessageId;
		this.beforeDateMessageId = spec.beforeDateMessageId;
		this.afterDateMessageId = spec.afterDateMessageId;
		this.dateRangeMessageId = spec.dateRangeMessageId;
				
		this.selectDropDown.observe('change', this.handleChange.bindAsEventListener(this));

		this.handleChange.bind(this).defer();

	},
	
	handleChange: function() {
		var option = this.selectDropDown.value;		
		switch(option) {
			case 'ON':
				this.showDateField1(true);
				this.showDateField2(false);
				this.showMessage(null);				
				this.showMessage(this.onDateMessageId);
				this.showStartEndLabels(false);
				break;
			case 'BEFORE':
				this.showDateField1(true);
				this.showDateField2(false);
				this.showMessage(this.beforeDateMessageId);
				this.showStartEndLabels(false);
				break;
			case 'AFTER':
				this.showDateField1(true);
				this.showDateField2(false);
				this.showMessage(this.afterDateMessageId);
				this.showStartEndLabels(false);
				break;
			case 'RANGE':
				this.showDateField1(true);
				this.showDateField2(true);
				this.showMessage(this.dateRangeMessageId);
				this.showStartEndLabels(true);
				break;
			default:
				this.showDateField1(false);
				this.showDateField2(false);
				this.showMessage(null);
				this.showStartEndLabels(false);
		}
	},
	
	showDateField1: function(show) {
		if (show) {
			this.date1.show();
		}
		else
		{
			this.date1.hide();
		}
	},
	
	showDateField2: function(show) {
		if (show) {		
			this.date2.show();
		}else
		{
			this.date2.hide();
		}
	},
			
	showMessage: function(id) {		
		if ($(this.onDateMessageId) != null) {
			$(this.onDateMessageId).hide();
		}
		if ($(this.beforeDateMessageId) != null) {
			$(this.beforeDateMessageId).hide();
		}
		if ($(this.afterDateMessageId) != null) {
			$(this.afterDateMessageId).hide();
		}
		if ($(this.dateRangeMessageId) != null) {
			$(this.dateRangeMessageId).hide();
		}
		if ($(id) != null) {
			$(id).show();
		}
	},

	showStartEndLabels: function(show) {			
		if (show) {
			$(this.startingLabelId).show();
			$(this.endingLabelId).show();	
		} else {
			$(this.startingLabelId).hide();
			$(this.endingLabelId).hide();	
		}
	}

	
});

Tapestry.Initializer.dateRangeTypeSelector = function(spec) {
	var dateRangeTypeSelector = new DateRangeTypeSelector(spec);
}
/* /assets/r20131.3.2-4/pqc/components/MarkedListCheckbox.js */;
var MarkedListCheckbox = Class.create(
{
	initialize: function(spec)
	{
		this.checkboxId = spec.checkboxId;
		this.checkbox = $(this.checkboxId);
		markedListCheckboxElements.push(this.checkbox);
		
		this.markURL = spec.markURL;
		this.itemIds = spec.itemIds;
		this.formats = spec.formats;
		this.markAll = spec.markAll;
		this.marked = spec.marked;
		this.checkbox.checked = this.marked;
		
		if (this.markAll)
			this.checkAllSelected();
		
		this.checkbox.observe('click', this.markClick.bindAsEventListener(this));

	},
	
	markClick: function(theEvent)
	{
		new Ajax.Request(this.markURL + "/" + this.checkbox.checked,
		{
			method: 'post',
			parameters: {itemIds : Object.toJSON(this.itemIds), formats : Object.toJSON(this.formats)},
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
				var response = t.responseText.split(",");
				var method = response[1], numItems = response[2], result = response[3];
//				alert("Response: method= " + method + ", numItems= " + numItems + ", result= " + result);
				if (result == "success")
				{
					this.markedListSuccess(method, numItems);
				}
				else if (result == "successAll")
				{
					this.markedListAllSuccess(method, numItems);
				}
				else if (result == "reachedLimit")
				{	// Handle reaching ML limit, couldn't be added, so uncheck the checkbox and give the user the reason.
					this.checkbox.checked = false;
					this.notifyMarkedListLimitReached();
				}
				
				document.fire('pq:selectedItemsUpdate', numItems);
			}.bind(this)
		});
	},
	
	// These methods to be overridden in a subclass if necessary:
	markedListSuccess: function(method, numItems)
	{
		var itemDivId = this.checkboxId.replace('mlcb','mlditem');
		var copyDivId = this.checkboxId.replace('mlcb','mldcopy');
		$(itemDivId).toggleClassName('item_selected');
		$(copyDivId).toggleClassName('copy_selected');
		$$('span.markedTotal').each(function(span) {
			span.innerHTML = numItems;
		});
		this.checkAllSelected();
	},
	
	markedListAllSuccess: function(method, numItems)
	{
		var selected = (method == 'add');
		$$('div.item').invoke(method + 'ClassName', 'item_selected');
		$$('div.results_list_copy').invoke(method + 'ClassName', 'copy_selected');
		$$('input.marked_list_checkbox').each(function(cb) {
			cb.checked = selected;
		});
		$$('span.markedTotal').each(function(span) {
			span.innerHTML = numItems;
		});
		this.checkAllSelected();
	},
	
	notifyMarkedListLimitReached: function()
	{
		Overlay.box.showOverlay('reachLimit_warning');		
	},
	
	checkAllSelected: function()
	{
		var checkAll = $('mlcbAll');
		if (checkAll != null) {
			var checkAllCheckboxes = [];
			
			this.allSelected = true;
			for (var i = 0; i < markedListCheckboxElements.length; i ++) {
				var item = markedListCheckboxElements[i];
				// Skip checking "all selected" checkboxes - all have IDs starting mlcbAll
				if (item.id.search(/^mlcbAll/i) == -1) {
					var itemSelected = item.checked;
					this.allSelected = this.allSelected && itemSelected;
				}
				else {
					checkAllCheckboxes.push(item);
				}
			};
			
			// Loop through "all selected" checkboxes, setting checked status
			for (var i = 0; i < checkAllCheckboxes.length; i ++) {
				checkAllCheckboxes[i].checked = this.allSelected;
			}
		}
	}
	
});

var markedListCheckboxElements = [];

Tapestry.Initializer.markedListCheckbox = function(spec)
{
	new MarkedListCheckbox(spec);
}
/* /assets/r20131.3.2-4/pqc/components/checkboxtree/SimulateEvent.js */;
/**
 * Event.simulate(@element, eventName[, options]) -> Element
 * 
 * - @element: element to fire event on
 * - eventName: name of event to fire (only MouseEvents and HTMLEvents interfaces are supported)
 * - options: optional object to fine-tune event properties - pointerX, pointerY, ctrlKey, etc.
 *
 *    $('foo').simulate('click'); // => fires "click" event on an element with id=foo
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

function toggleSelectAll(value, browseMode){
	if(browseMode == 'true'){	
		if(value == 'true'){
			$('selectAllLabel').hide();		
			$('allSelectedLabel').show();
			document.getElementById('selectAll').checked = true;
		} else {
			$('selectAllLabel').show();		
			$('allSelectedLabel').hide();
			document.getElementById('selectAll').checked = false;
		}
	}else{		
		if(value == 'showAll'){
			$('selectAllDivEnabled').show();
			$('clearAllDivEnabled').show();
			$('selectAllDivDisabled').hide();
			$('clearAllDivDisabled').hide();
			
		}else if(value == 'true'){
				$('selectAllDivEnabled').hide();
				$('selectAllDivDisabled').show();
				$('clearAllDivEnabled').show();
				$('clearAllDivDisabled').hide();
				
		}else{
				$('selectAllDivEnabled').show();
				$('selectAllDivDisabled').hide();
				$('clearAllDivEnabled').hide();
				$('clearAllDivDisabled').show();
		}		
	}	
}

/* /assets/r20131.3.2-4/pqc/components/HiddenHitMarkerSwitch.js */;
var HiddenHitMarkerSwitch = Class.create(
{
	
	initialize: function(spec) {
		this.toggleId = spec.toggleId;
		this.toggleLink = $(this.toggleId);
		this.hitMarkerText = spec.hitMarkerText;
		this.markerOn = spec.markerOn;
		this.markerOnText = spec.markerOnText;
		this.markerOffText = spec.markerOffText;
		
		this.setupHitMarkers();
		this.toggleLink.observe('click', this.markClick.bindAsEventListener(this));
	},
	
	markClick: function(theEvent) {
		Event.stop(theEvent);
		this.markerOn = !this.markerOn;
		this.setupHitMarkers();
	},
	
	setupHitMarkers: function() {
		// Update the toggle link text
		this.toggleLink.update(this.markerOn ? this.markerOffText : this.markerOnText);
		
		if (this.markerOn) {
			// Add the hit markers
			this.addHitMarkers();
		}
		else {
			// Remove all hiddenText spans from hit spans
			this.removeHitMarkers();
		}
	},
	
	addHitMarkers: function() {
		var hitSpans = $$('span.hit');
		hitSpans.each(function(hitSpan) {
			var marker = new Element('span', {'class': 'hiddenText'}).update(this.hitMarkerText);
			Element.insert(hitSpan, {top: marker});
		}, this);
	},
	
	removeHitMarkers: function() {
		if (Prototype.BrowserFeatures.SelectorsAPI || Prototype.BrowserFeatures.XPath) {
			var hitMarkers = $$('span.hit span.hiddenText');
			hitMarkers.each(function(marker) {
				Element.remove(marker);
			});			
		} else {
			var candidateHitMarkers = document.getElementsByTagName("span"),
				hitClassName = /\bhit\b/,
				hiddenTextClassName = /\bhiddenText\b/,
				matches = [],
				i, j,
				span,
				candidateHiddenTexts;
			for (i = candidateHitMarkers.length; span = candidateHitMarkers[--i];) {
				if (hitClassName.test(span.className)) {
					candidateHiddenTexts = span.getElementsByTagName("span");
					for (j = candidateHiddenTexts.length; span = candidateHiddenTexts[--j];) {
						if (hiddenTextClassName.test(span.className)) {
							span.parentNode.removeChild(span);
						}
					}
				}
			}
		}
	}
		
});


Tapestry.Initializer.hiddenHitMarkerSwitch = function(spec)
{
	new HiddenHitMarkerSwitch(spec);
}
/* /assets/r20131.3.2-4/pqc/components/HitNavigationSwitch.js */;
var HitNavigationSwitch = Class.create(
{
	initialize: function(spec) {
		this.field = spec.field;
		this.fieldDiv = $(spec.fieldDiv);
		this.switchLink = $(spec.clientId);
		this.switchLink.observe('click', this.switchClick.bindAsEventListener(this));
		this.switchLink.observe('hitnav:refresh', this.refreshHitNav.bindAsEventListener(this));
		
		this.navEnabled = spec.navEnabled;
		this.enableText = spec.enableLinkText;
		this.disableText = spec.disableLinkText;
		
		this.prevLinkTitle = spec.prevLinkTitle;
		this.prevAltText = spec.prevAltText;
		this.prevImg = spec.imagesPath + '/prevhit.gif';
		this.nextLinkTitle = spec.nextLinkTitle;
		this.nextAltText = spec.nextAltText;
		this.nextImg = spec.imagesPath + '/nexthit.gif';

		
		if (!this.hitsAvailable()) {
			this.switchLink.hide();
			$(this.field + '_firsthit').hide();
		}
		else {
			this.switchLink.show();
		}
		if (this.navEnabled) {
			this.showNavigationLinks();
		}
		
	},
	
	refreshHitNav: function(event) {
		this.refresh();
		event.stop();
	},
	
	refresh: function() {
		if (!this.hitsAvailable()) {
			this.switchLink.hide();
			$(this.field + '_firsthit').hide();
			this.navEnabled = false;
		}
		else {
			this.switchLink.show();
		}
		if (this.navEnabled) {
			this.showNavigationLinks();
			this.switchLink.update(this.disableText);
		} else {
			this.hideNavigationLinks();
			this.switchLink.update(this.enableText);
		}		
	},
	
	hitsAvailable: function() {
		if (this.fieldDiv != null && this.fieldDiv.select('.hit').size() > 1) {
			return true;
		}
		else {
			return false;
		}
	},
	
	showNavigationLinks: function() {
		// Enable "jump to first hit" link
		$(this.field + '_firsthit').show();
		$(this.field + '_firsthit').observe('click', this.firstHit.bindAsEventListener(this));
		
		var hits = this.fieldDiv.select('.hit');
		hits.each(function(hitSpan, index) {
			if (index > 0) {
				// Add a previous link
				var prevLink = new Element('a', {'href': '#' + this.getAnchor(index - 1),
					'name': this.getAnchor(index),
					'title': this.prevLinkTitle,
					'class': 'prevHitLink bullets_base_sprite bullet_arrow_left',
					'id': "prev" + this.getAnchor(index)
				});
				//var prevImg = new Element('img', {'src': this.prevImg, 'alt': this.prevAltText});
				//prevLink.insert(prevImg);
				prevLink.observe('click', this.previousClick.bindAsEventListener(this));
				
				Element.insert(hitSpan, {before: prevLink});
			}
			
			if (index < (hits.size() - 1)) {
				// Add a next link
				var nextLink;
				if (index == 0) {
					// Next link should include name attribute
					nextLink = new Element('a', {
						'href': '#' + this.getAnchor(index + 1),
						'name': this.getAnchor(index),
						'title': this.nextLinkTitle,
						'class': 'nextHitLink bullets_base_sprite bullet_arrow_right',
						'id': "next" + this.getAnchor(index)
					});
				} else {
					// Next link has no name attribute
					nextLink = new Element('a', {'href': '#' + this.getAnchor(index + 1),
						'title': this.nextLinkTitle,
						'class': 'nextHitLink bullets_base_sprite bullet_arrow_right',
						'id': "next" + this.getAnchor(index)
					});
				}
				//var nextImg = new Element('img', {'src': this.nextImg, 'alt': this.nextAltText});
				//nextLink.insert(nextImg);
				nextLink.observe('click', this.nextClick.bindAsEventListener(this));
				
				Element.insert(hitSpan, {after: nextLink});
			}
		}.bind(this));

		// Initialise observers for the link clicks - doesn't seem to work if done
		// in loop above
		/*
		$$('.prevHitLink').each(function(link) {
			link.observe('click', this.previousClick.bindAsEventListener(this));
		}.bind(this));
		$$('.nextHitLink').each(function(link) {
			link.observe('click', this.nextClick.bindAsEventListener(this));
		}.bind(this));
		*/
	},
	
	hideNavigationLinks: function() {
		// Disable "jump to first hit" link
		$(this.field + '_firsthit').hide();
		
		this.fieldDiv.select('.prevHitLink').invoke('remove');
		this.fieldDiv.select('.nextHitLink').invoke('remove');
	},
	
	getAnchor: function(index) {
		return (this.field + 'hit_' + index);
	},
	
	switchClick: function(event) {
		this.navEnabled = !this.navEnabled;
		this.refresh();
		event.stop();
	},
	
	previousClick: function(event) {
		var linkElement = Event.findElement(event, 'a');
		var linkId = linkElement.id;
		var linkNumber = Number(linkId.split("_")[1]) - 1;
		var destId;
		if (linkNumber == 0) {
			destId = "next" + this.getAnchor(linkNumber);
		}
		else {
			destId = "prev" + this.getAnchor(linkNumber);
		}
		this.goToElement(destId);
		event.stop();
	},
	
	nextClick: function(event) {
		var linkElement = Event.findElement(event, 'a');
		var linkId = linkElement.id;
		var linkNumber = Number(linkId.split("_")[1]);
		this.goToElement("prev" + this.getAnchor(linkNumber + 1));
		event.stop();
	},
	
	firstHit: function(event) {
		this.goToElement("next" + this.getAnchor(0));
		event.stop();
	},
	
	goToElement: function(elementId) {
		var element = $(elementId);
		if (element) {
			Element.scrollTo(element);
		}
	}
	
});

Tapestry.Initializer.hitNavigationSwitch = function(spec) {
	new HitNavigationSwitch(spec);
}
/* /assets/r20131.3.2-4/pqc/components/MyResearchCheckbox.js */;
var MyResearchCheckbox = Class.create(
{
	initialize: function(spec)
	{
		this.checkboxId = spec.checkboxId;
		this.checkbox = $(this.checkboxId);
		this.attachedCheckbox = $(spec.attachedId);
		this.markURL = spec.markURL;
		this.itemIds = spec.itemIds;
		this.itemNos = spec.itemNos;
		this.resultId = spec.resultId;
		
		
		this.checkbox.observe('click', this.markClick.bindAsEventListener(this));
		this.checkbox.observe('pq:markClick', this.markClick.bindAsEventListener(this));
	},
	markClick: function(theEvent, folderId)
	{
		var parameters;
		if (folderId) {
			parameters = {itemIds : Object.toJSON(this.itemIds), folderId : folderId, resultId : this.resultId, itemNos : Object.toJSON(this.itemNos)};
		} else {
			parameters = {itemIds : Object.toJSON(this.itemIds), resultId : this.resultId, itemNos : Object.toJSON(this.itemNos)};
		}
		new Ajax.Request(this.markURL + "/" + this.checkbox.checked,
		{
			method: 'post',
			parameters: parameters,
			onFailure: function(t)
			{
				alert('Error communicating with the server');
			},
			onException: function(t, exception)
			{
				alert('Error communicating with the server');
			},
			onSuccess: function(t)
			{	// Process the response.
				var response = t.responseJSON;
//alert("Response: method= " + response.method + ", numMsg= " + response.numMsg + ", cbMsg= " + response.cbMsg + ", result= " + response.result);
				if (response.result == "success")
				{
					this.myResearchSuccess(response.method, response);
					if ($('my-research-link')) {
						$('my-research-link').fire('pq:myResearchCheckbox', {method: response.method, from: 'single', 
																			checkboxId: this.checkboxId, markURL: this.markURL,
																			itemIds: Object.toJSON(this.itemIds)});
					}
				}
				else if (response.result == "successAll")
				{
					this.myResearchAllSuccess(response.method, response);
					if ($('my-research-link')) {
						$('my-research-link').fire('pq:myResearchCheckbox', {method: response.method, from: 'all'});
					}
				}
				else if (response.result == "reachedLimit")
				{	// Handle reaching MR limit, couldn't be added, so uncheck the checkbox and give the user the reason.
					this.checkbox.checked = false;
					this.notifyMyResearchLimitReached();
				}
				
				if(this.attachedCheckbox != null)
				{
					var addtoMyResCheckboxes = $$('.marked_list_checkbox');
					for (var i = 0; i < addtoMyResCheckboxes.length; i ++) {
						addtoMyResCheckboxes[i].checked = this.checkbox.checked;
					}
				}
				
			}.bind(this)
		});
	},
// These methods to be overridden in a subclass if necessary:
	myResearchSuccess: function(method, response)
	{
		var itemDivId = this.checkboxId.replace('mrcb','mrditem');
		var copyDivId = this.checkboxId.replace('mrcb','mrdcopy');
		if ($(itemDivId)) {
			$(itemDivId).toggleClassName('item_selected');
		}
		if ($(copyDivId)) {
			$(copyDivId).toggleClassName('copy_selected');
		}
		$$('.myResearchNew').each(function(span) {
			span.innerHTML = response.numMsg;
		});
		var checkAll = $('mrcbAll');
		if (checkAll != null) {
			var addtoMyResCheckboxes = $$('.marked_list_checkbox');	
			this.allSelected = true;
			addtoMyResCheckboxes.each(function(item, index){
				if (index == 0) return;
				var itemSelected = item.checked;
				this.allSelected = this.allSelected && itemSelected;
				if (!this.allSelected) throw $break;
			},this);
			checkAll.checked = this.allSelected;	
		}
	},
	myResearchAllSuccess: function(method, response)
	{
		var selected = (method == 'add');
		$$('div.item').invoke(method + 'ClassName', 'item_selected');
		$$('div.results_list_copy').invoke(method + 'ClassName', 'copy_selected');
		$$('input.marked_list_checkbox').each(function(cb) {
			cb.checked = selected;
		});
		$$('.myResearchNew').each(function(span) {
			span.innerHTML = response.numMsg;
		});				
	},
	notifyMyResearchLimitReached: function()
	{
		alert("My Research has reached its limit, please remove some entries before attempting to add any more.");		
	}
});

Tapestry.Initializer.myResearchCheckbox = function(spec)
{
	new MyResearchCheckbox(spec);
}
/* /assets/r20131.3.2-4/pqc/components/RefWorksExport.js */;

function hideLearnMoreOverlayExport() {
	Overlay.box.showOverlay('learnMoreOverlayExport');
}

function loadPage(){
	setTimeout("window.location.reload()", 3000);
}

function closeRefWorksExportOverlay() {
	Event.stopObserving(window, 'beforeunload');
	Overlay.box.hideOverlay();
}
/* /assets/r20131.3.2-4/pqc/components/resultsfiltering/ResultsFilters.js */;
var ResultsFilter = Class.create(
{
	initialize: function(spec)
	{
		this.filterHeader = $(spec.filterHeaderId);
		this.filterDiv = $(spec.filterDivId);
		this.titleExpand = spec.titleExpand;
		this.titleContract = spec.titleContract;
		this.filterHeader.observe('click', this.toggleFilter.bindAsEventListener(this));
		if (spec.immediateExpand) {
			this.toggleFilter();
		}
	},
	toggleFilter: function(event)
	{
		if (event) {
			event.stop();
		}
		var element = this.filterHeader;
		var afterFin = function() {
			element.toggleClassName('expanded');
			if (element.hasClassName('expanded')) {
				element.title = this.titleContract;
			} else {
				element.title = this.titleExpand;
			}
		};
		Effect.toggle(this.filterDiv, 'blind', {
			duration: 0.5,
			afterFinish: afterFin.bind(this)
		});
	}
});

Tapestry.Initializer.resultsFilter = function(spec)
{
	new ResultsFilter(spec);
}

function handleCheckboxClick(thisElem, included)
{
	var thisClass = included ? 'included' : 'excluded';
	var otherClass = included ? 'excluded' : 'included';
	var rowElem = thisElem.up('tr.filter_more_row');
	var otherElem = $(otherClass + thisElem.identify().substr(8));

	if (!(Prototype.Browser.IE && (parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) <= 7))) {
		if (thisElem.checked) {
			otherElem.checked = false;
			rowElem.removeClassName(otherClass);
			rowElem.addClassName(thisClass);
		} else {
			rowElem.removeClassName(thisClass);
		}
	}
}

function resetCheckboxClicks(thisElem)
{
	var chooseMoreDiv = thisElem.next('div');
	if (chooseMoreDiv) {
		var overlayDiv = chooseMoreDiv.down('div.filter_more_overlay');
		if (overlayDiv) {
			var formElem = overlayDiv.down('form');
			if (formElem) {
				formElem.select('div.filter_more_row').each(function(rowElem) {
					rowElem.className = 'filter_more_row';
				});
				formElem.select('input').each(function(cbElem) {
					cbElem.checked = false;
				});
			}
		}
	}
}


/* /assets/r20131.3.2-4/pqc/components/resultsfiltering/DateRangeFilter.js */;
var DateRangeFilter = Class.create(
{
	initialize: function(spec)
	{
		this.filterHeader = $('dateFilter-header');
		this.filterDiv = $('dateFilter-div');
		this.titleExpand = spec.titleExpand;
		this.titleContract = spec.titleContract;
		this.filterHeader.observe('click', this.toggleFilter.bindAsEventListener(this));
		$$('#filterByRange')[0].observe('click', this.filterRange.bindAsEventListener(this));
		this.grouping = spec.grouping;
		// Init bar clicks.
		this.filterUrl = new String(spec.filterUrl);
		this.filterNames = spec.filterNames;
		$('dateFilter-graph').select('.count').each(function(elem, i) {
			if (this.filterNames[i] != '') {
				elem.observe('click', this.barClick.bindAsEventListener(this, i));
			}
		}, this);
		// Init handle range selection.
		this.trackDiv = $('dateFilter-track');
		this.trackDiv.setStyle({width: spec.trackWidth+'px', left: spec.trackOffset+'px'});
		this.handleDelay = spec.handleDelay;
		if (this.grouping == "daynav") {
			this.sliderStart = this.getNotNullValue(0, spec.numBars);
			this.sliderEnd = this.getNotNullValue(1, spec.numBars);
		} else {
			this.sliderStart = 0;
			this.sliderEnd = spec.numBars;
		}
		this.slider = new Control.Slider(
			['handle1', 'handle2'], this.trackDiv, {
				range: $R(0, spec.numBars),
				values: $R(0, spec.numBars),
				sliderValue: [this.sliderStart, this.sliderEnd],
				restricted: true,
				onChange: function(values) {
					if (values[0] == values[1]) {
						this.slider.setValue(values[1] + 1, 1);
					} else {
						if (this.rangeTimer) {
							this.rangeTimer.stop();
						}
						var groupNames = '';
						$('handle1').title = this.getDisplay(values[0]);
						$('handle2').title = this.getDisplay(values[1]-1);
						for (i=values[0]; i < values[1]; i++) {
							if (this.filterNames[i] != '')
								groupNames += '/' + this.filterNames[i];
						}
						if (groupNames != '') {
							this.filterRangeUrl = this.filterUrl.replace(':filter/', ':filterrange/').replace('groupName', groupNames.substring(1));
						}
					}
				}.bind(this),
				onSlide: function(values) {					
					$('filter_start').update(this.getDisplay(values[0]));
					$('filter_end').update(this.getDisplay(values[1]-1));
					if (this.rangeTimer) {
						this.rangeTimer.stop();
					}
				}.bind(this)
			}
		);
		$('handle1').title = this.getDisplay(this.sliderStart);
		$('handle2').title = this.getDisplay(this.sliderEnd - 1);		
		$('filter_start').update(this.getDisplay(this.sliderStart));
		$('filter_end').update(this.getDisplay(this.sliderEnd - 1));
	},
	toggleFilter: function(event)
	{
		event.stop();
		var element = this.filterHeader;

		var afterFin = function() {
			element.toggleClassName('expanded');
			if (element.hasClassName('expanded')) {
				element.title = this.titleContract;
			} else {
				element.title = this.titleExpand;
			}
		};

		Effect.toggle(this.filterDiv, 'blind', {
			duration: 0.5,
			afterFinish: afterFin.bind(this)
		});
	},
	barClick: function(event, i)
	{		
		$('spinDiv').style.display='';
		var url = this.filterUrl.replace('groupName', this.filterNames[i]);
		document.location = url;
	},
	filterRange: function(values)
	{
		if (this.rangeTimer) {
			this.rangeTimer.stop();
		}
		if(this.filterRangeUrl != undefined){
			$('spinDiv').style.display='';
			document.location = this.filterRangeUrl;
		}
	},
	getDisplay: function(value)
	{
		var display = $('bar_'+value).title;
		var pos = display.indexOf('(');
		return display.substring(0, pos);

	},
	getNotNullValue: function(hIndex, numBars)
	{
		if (hIndex == 0) {
			for (i=0; i < numBars; i++) {
				if (this.filterNames[i] != '')
					return i;
			}
		} else {
			for (i=numBars - 1; i >= 0; i--) {
				if (this.filterNames[i] != '')
					return i+1;
			}
		}
	}
});

Tapestry.Initializer.dateRangeFilter = function(spec)
{
	new DateRangeFilter(spec);
}

/* /assets/r20131.3.2-4/pqc/components/resultsfiltering/FilteredBy.js */;
var ShowHideFiltersSwitcher = Class.create ({
	
	initialize: function() {
		this.hideFilteredBy = $('hideFilteredBy');
		this.showFilteredBy = $('showFilteredBy');
		if (this.hideFilteredBy && this.showFilteredBy) {
			this.hideFilteredBy.observe('click', this.toggle.bindAsEventListener(this));
			this.showFilteredBy.observe('click', this.toggle.bindAsEventListener(this));
		}
	},

	toggle: function(event)
	{
		event.stop();
		this.hideFilteredBy.toggle();
		this.showFilteredBy.toggle();
		Effect.toggle('filteredBy', 'blind', {duration: 0.5});
		return false;
	}
});

Tapestry.Initializer.showHideFiltersSwitcher = function(spec) {
	new ShowHideFiltersSwitcher(spec);
}
/* /assets/r20131.3.2-4/pqc/components/resultsfiltering/TableSorter.js */;
Element.addMethods({
  collectTextNodes: function(element) {  
    return $A($(element).childNodes).collect( function(node) {
      return (node.nodeType==3 ? node.nodeValue : 
        (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
    }).flatten().join('');
  },

  removeClassNames: function(element, array) {
    if (!(element = $(element))) return;
    array.each(function(e) { element.removeClassName(e);})
    return element;
  }
});

var Comparator = {
  compareFunction: function(sortType) {
    switch(true) {
      case sortType.include("integer"):
        return Comparator.complexCompare(function(a) { return parseFloat(a.replace(/^.*?([\d\.]+).*$/,"$1")) });
      case sortType.include("date"):        
        return Comparator.complexCompare(Date.parse)
      case sortType.include("float"):
        return Comparator.complexCompare(function(a) { return parseFloat(a.replace(/^.*?([\d\.]+).*$/,"$1")) });
      default:
        return Comparator.complexCompare(function(a) { return a.toLowerCase(); });
    }
	
  },
  
  simpleCompare: function(a,b) { 
    return a < b ? -1 : a == b ? 0 : 1; 
  },
  
  complexCompare: function(compareFn) {
    return function(a, b) {return Comparator.simpleCompare(compareFn(a), compareFn(b)); }
  }
};

Object.extend(Array.prototype, {
  sortByColumnHead: function(sortType, iterator, context) {
    iterator = iterator.bind(context);
    return this.map(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      sortFn = Comparator.compareFunction(sortType);
      return sortFn(a, b);
    }).pluck('value');
  }
})

var TableSorter = Class.create({
  initialize: function(element, defaultSortIndex) {
    this.element = $(element);
    this.sortIndex = defaultSortIndex;
    this.sortOrder = 'desc';
    this.initDOMReferences();
    this.initEventHandlers();
  }, // initialize

  initDOMReferences: function() {
    var head = this.element.down('thead');
    var body = this.element.down('tbody');
    if (!head || !body)
      throw 'Table must have a head and a body to be sortable.';
    this.headers = head.down('tr').childElements(); 
    this.headers.each(function(e, i) { 
      if(!e.className.include('nosort')) //dont sort a column by setting the unsort property(isn't it GREAT)
        e._colIndex = i;
    });
    this.body = body;
  }, // initDOMReferences

  initEventHandlers: function() {
    this.handler = this.handleHeaderClick.bind(this); 
    this.element.observe('click', this.handler);
  }, // initEventHandlers



  handleHeaderClick: function(e) {
    var element = e.element();
    if (!('_colIndex' in element)) {
      element = element.ancestors().find(function(elt) { 
        return '_colIndex' in elt;
      });
      if (!((element) && '_colIndex' in element))
        return;
    }
    this.sort(element._colIndex, (element.className || ''));
  }, // handleHeaderClick

  //call this function when a row is added dynamically to make sure the existing sortoder is retained
  resort: function(index, sortType) {
    this.sort(index, sortType);
    //call it again to bring back the original sort order
    this.sort(index, sortType);
  },

  adjustSortMarkers: function(index) {
    if (this.sortIndex != -1)
      this.headers[this.sortIndex].removeClassName('sort-' +
        this.sortOrder);
    if (this.sortIndex != index) {
      this.sortOrder = 'asc';
      this.sortIndex = index;
    } else
      this.sortOrder = ('asc' == this.sortOrder ? 'desc' : 'asc');    
    this.headers[index].addClassName('sort-' + this.sortOrder);    
  }, // adjustSortMarkers

  sort: function(index, sortType) {

    this.adjustSortMarkers(index);
    var rows = this.body.childElements();
    rows = rows.sortByColumnHead(sortType, function(row) {       
      return row.childElements()[this.sortIndex].collectTextNodes(); 
    }.bind(this));
    
    if ('desc' == this.sortOrder)
      rows.reverse();

    rows.reverse().each(function(row, index) { 
      if (index > 0)
        this.body.insertBefore(row, rows[index - 1]);
    }.bind(this));
    
    rows.reverse().each(function(row, index) {
      row.removeClassNames(['odd', 'even']);
      (1 == index % 2) ? row.addClassName('odd') : row.addClassName('even');
    });

    var outerForm=this.element.up('form');
    if (outerForm!=undefined) {
    	if (outerForm['alphaOrder']!=undefined) {
    		outerForm['alphaOrder'].value=this.sortIndex==2;
    		outerForm['ascDescOrder'].value=this.sortOrder;
    	}	
    }	
  } // sort
}); // TableSorter



/**********************************/
var TableSortObserver = {
  sortableTables : {},
  
  bindEventsToTableRow: function(table_id) {
    defaultSortIndex = -1;
    $(table_id).down('thead').down('tr').childElements().each(function(e, i) {
      if(e.className.include('sort')) defaultSortIndex = i
    });
    this.sortableTables[table_id] = new TableSorter(table_id, defaultSortIndex);    
  }
}