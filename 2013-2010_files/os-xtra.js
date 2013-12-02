
/* /assets/r20131.3.2-4/app/pages/Browse.js */;
 function toggle(currentId,childId) {
	var ele = document.getElementById(childId);
	var text = document.getElementById(currentId);
	linkText = text.innerHTML;
	temp = linkText.replace('indicators_base_sprite indicator_expand','');
	temp = temp.replace('indicators_base_sprite indicator_collapse','');
	linkText = temp;
	if(ele.style.display == "block") {
    	ele.style.display = "none";
		text.innerHTML = '<span class="indicators_base_sprite indicator_expand">'+linkText+'</span>';
  	}
	else {
		ele.style.display = "block";
		text.innerHTML = '<span class="indicators_base_sprite indicator_collapse">'+linkText+'</span>';
	}
} 
/* /assets/r20131.3.2-4/app/pages/DataReports.js */;
function checkParent(targ) {
	var allIns = targ.getElementsByTagName('input');
	var a_i_ln = allIns.length;
	var ck_var = allIns[0].checked;
	for ( var i = 1; i < a_i_ln; i++) {
		if (allIns[i].type == 'checkbox')
			allIns[i].checked = ck_var;
	}
}

function checkChild(targ, parentId) {
	var count = 0;
	var allIns = targ.getElementsByTagName('input');
	var a_i_ln = allIns.length;
	var ck_var = allIns[0].checked;
	for ( var i = 0; i < a_i_ln; i++) {
		if (allIns[i].type == 'checkbox' && allIns[i].checked) {
			count++;
		}
	}
	document.getElementById(parentId).checked = (count == a_i_ln);
}
/* /assets/r20131.3.2-4/app/pages/Databases.js */;
var Databases = Class.create( {
	initialize : function(config) {

		this.resetUrl = config.resetUrl;
		this.linkObj = $('imgClassSwitch').firstDescendant();
		this.linkObj.observe('click', this.revertDatabaseSelections.bindAsEventListener(this));
	},
	revertDatabaseSelections : function(event) {
		Event.stop(event);
		new Ajax.Request(this.resetUrl, {
			method :'post',
			onSuccess : function(t) {
				if (this.linkObj.href)
					window.location = this.linkObj.href;
			}.bind(this)
		});

	}

});

var databases;
Tapestry.Initializer.databases = function(spec) {
	databases = new Databases(spec);
}
/* /assets/r20131.3.2-4/app/pages/FigTables.js */;
var FigTable = Class.create({
	initialize: function(spec){
		this.resetURL = spec.resetURL ;
		//this.resetTopLinkId = spec.resetTopLinkId ;
		//this.resetBotLinkId = spec.resetBotLinkId ;
		this.formElement = spec.formElement ;
		//alert('url = ' + this.resetURL) ;
		//Event.observe(this.resetTopLinkId, 'click', this.resetForm.bindAsEventListener(this)) ;
		//Event.observe(this.resetBotLinkId, 'click', this.resetForm.bindAsEventListener(this)) ;
		
	},
	
	resetForm: function(event){
		//alert('url = ' + this.resetURL) ;
		this.handleAjaxRequest(event, this.formElement) ;
	},
	
	handleAjaxRequest: function(event, formElement){
		
		var startOfQueryStr = this.resetURL.indexOf("?");
		if(startOfQueryStr != -1) {
			url = this.resetURL.substring(0, startOfQueryStr) ;
		}else{
			url = this.resetURL ;
		}
		//url = url + "/" + $('searchForm').advSearchOptionsDisplayed.value ;
		url = url + "/" + getCookie("advSearchOptionsDisplayed");
		//alert(url) ;
		new Ajax.Request(url, {
			method: 'post',
			onSuccess: function(t) {
				var zoneManager = Tapestry.findZoneManager(formElement);
				if (!zoneManager) {
					return;
				}
				zoneManager.processReply(t.responseJSON);
			}
		});
	}
	
}) ;

var figTable;
Tapestry.Initializer.figTable = function(spec) {
	figTable = new FigTable(spec);
}

function toggleAdvancedOptions(){
	var childDiv = $('queryBuilderFrag');
	//var hiddenElement = $('advSearchOptionsDisplayed') ;
	var linkText = $('linkSign');
	linkText.title='Show options to add additional search fields and combine them with Boolean operators';
	if(linkText) {
	   if(linkText.hasClassName("indicator_expand")){
		 linkText.removeClassName('indicator_expand'); 
		 linkText.addClassName('indicator_collapse');
		 linkText.title='Show options to add additional search fields and combine them with Boolean operators';
		 //hiddenElement.value = "false" ;
		 setCookie("advSearchOptionsDisplayed","false",0);
		 //$('searchForm').advSearchOptionsDisplayed.value="false" ;
		 setCookie("advSearchOptionsToggled","true",0);
		 //$('searchForm').advSearchOptionsToggled.value = "true";
	  }else if(linkText.hasClassName("indicator_collapse")){
		 linkText.removeClassName('indicator_collapse');
		 linkText.addClassName('indicator_expand');
		 linkText.title='Hide options to add additional search fields and combine them with Boolean operators';
		 //hiddenElement.value = "true" ;
		 setCookie("advSearchOptionsDisplayed","true",0);
		 //$('searchForm').advSearchOptionsDisplayed.value="true" ;
		 setCookie("advSearchOptionsToggled","false",0);
		 //$('searchForm').advSearchOptionsToggled.value = "false";
	  }
   }
	Effect.toggle(childDiv, 'blind', {duration: 1.0});
}

function setCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
/* /assets/r20131.3.2-4/app/pages/LookupCite.js */;
var LookupCite = Class.create(
{
	initialize: function(spec)
	{
		this.dateField = $('select_LookUpCiteDateRange');
		this.yearField = $('year');
		if (this.dateField != null && this.dateField.value != "ALL_DATES") {
			this.yearField.disable();
		}
		
		if (this.yearField.value != "") {
			this.dateField.disable();
		}
		this.authorLink = $('browseIndexAuthor');		
		this.authorLink.observe('click', this.showLoadingOverlay.bindAsEventListener(this));
		this.pubLink = $('browseIndexPub');
		this.pubLink.observe('click', this.showLoadingOverlay.bindAsEventListener(this));
		
		$('searchForm').observe('submit', this.onSubmit.bindAsEventListener(this));
		
		if (this.dateField != null) {
			this.dateField.observe('keydown', this.onDateKeyPress.bindAsEventListener(this));
			this.dateField.observe('change', this.onDateChangeOrBlur.bindAsEventListener(this));
			this.dateField.observe('blur', this.onDateChangeOrBlur.bindAsEventListener(this));
		}
		
		this.yearField.observe('keyup', this.onYearKeyPress.bindAsEventListener(this));
		this.yearField.observe('change', this.onYearChangeOrBlur.bindAsEventListener(this));
		this.yearField.observe('blur', this.onYearChangeOrBlur.bindAsEventListener(this));
		
		if (spec.showWellesleyAu) {
			this.showWellesleyAu = Boolean(spec.showWellesleyAu);
			this.markURL = spec.markURL;
			if (this.showWellesleyAu) {
				this.wellesleyauCkb = $("wellesleyAuthor");
//				$T(this.wellesleyauCkb).zoneId = "browseIndexAuthorZone";
				this.wellesleyauCkb.observe('click', this.onClick.bindAsEventListener(this));
			}
		}
	},
	
	onClick: function(event) {
//		var zoneObject = Tapestry.findZoneManager(this.wellesleyauCkb);
//		if (!zoneObject)
//			return;
//		zoneObject.updateFromURL(this.markURL + "/" + this.wellesleyauCkb.checked);
		new Ajax.Request(this.markURL + "/" + this.wellesleyauCkb.checked);
	},
	
	showLoadingOverlay: function(event) {
		Overlay.box.showOverlay('browseIndexLoadingOverlay');
	},

	onDateKeyPress: function(event){
		if (event.keyCode == Event.KEY_TAB && this.dateField.value == "ALL_DATES") {
			this.yearField.enable()
		} else {
			this.yearField.disable();
		}
	},
	onDateChangeOrBlur: function(event) {
		var option = this.dateField.value; 
		if (option == "ALL_DATES") {
			this.yearField.enable();
		} else {
			this.yearField.disable();
		}
	},	
	onYearKeyPress: function(event){
		if (this.dateField != null) {
			if (this.yearField.value == "") {
				this.dateField.enable()
			} else {
				this.dateField.disable();
			}
		}
	},	
	onYearChangeOrBlur: function(event){
		var year = this.yearField.value;
		if (this.dateField != null) {
			if (year == null || year =='') {
				this.dateField.enable();
			} else {
				this.dateField.disable();
			}
		}
	},
	onSubmit: function(event) {
		this.yearField.enable();
		this.dateField.enable();
	}
});

Tapestry.Initializer.lookupCite = function(spec)
{
	lookupCite = new LookupCite(spec);
}

function showAuthorOverlay() {
	Overlay.box.showOverlay('authorBrowseOverlay');
}

/* /assets/r20131.3.2-4/app/pages/publications/PublicationBrowsePage.js */;
// Javascript to disable/enable autocomple for pub search field.
// Autocomplete should only be enabled if "begins with" radio button is selected

Tapestry.Initializer.autocompleteEnabler = function(spec) {
	Ajax.Autocompleter.disabled = true;
};

function showLookUp(optionSelected){
	var value = (optionSelected != null ? optionSelected.value : "");
	
	if (value == 'startsWith') {
		Ajax.Autocompleter.disabled = false;  // 'startsWith' ==> enabled
	} else {
		Ajax.Autocompleter.disabled = true;
	}
	if (value == 'InSubject'){
		$('lookUpLink').show();
	} else {
		$('lookUpLink').hide();
	}
}

/* /assets/r20131.3.2-4/app/components/alertrss/PubEmailAlertCreate.js */;

function showMessageOverlay(emailAddress,sendAlertsMessage) {
	$('sendTo').innerHTML = emailAddress;
	$('sendAlerts').innerHTML = sendAlertsMessage;
	Overlay.box.showOverlay('alertMsgOverlay');
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
		if(emailStr.indexOf(" ") != -1) return false;
	}
	return true;
}


/* /assets/r20131.3.2-4/app/components/figtables/FTLimitersCheckboxGroup.js */;
var FTLimitersCheckboxGroup = Class.create({

	initialize: function(spec) {
	
		this.controlledGraphCB = $$('input.Graph');
		this.controlledGraphChildrenCB = $$('input.GraphChildren');
		$$('input.Graph').each(function(checkbox) {
			checkbox.observe('click', this.handelCheckboxGroup.bindAsEventListener(this, this.controlledGraphChildrenCB));
		}, this);
		this.controlledGraphCB.each(function(n) {
			n.observe('click', this.checkAllSelectedFigures.bindAsEventListener(this));
			}.bind(this));
		
		this.controlledGraphChildrenCB.each(function(n) {
			n.observe('click', this.checkAllSelectedGroups.bindAsEventListener(this, this.controlledGraphChildrenCB,'cb_Graph'));
			}.bind(this));
		
		this.controlledIllustrationCB = $$('input.Illustration');
		this.controlledIllustrationChildrenCB = $$('input.IllustrationChildren');
		$$('input.Illustration').each(function(checkbox) {
			checkbox.observe('click', this.handelCheckboxGroup.bindAsEventListener(this, this.controlledIllustrationChildrenCB));
		}, this);
		this.controlledIllustrationCB.each(function(n) {
			n.observe('click', this.checkAllSelectedFigures.bindAsEventListener(this));
			}.bind(this));
		
		this.controlledIllustrationChildrenCB.each(function(n) {
			n.observe('click', this.checkAllSelectedGroups.bindAsEventListener(this, this.controlledIllustrationChildrenCB,'cb_Illustration'));
			}.bind(this));
		
		this.controlledPhotographCB = $$('input.Photograph');
		this.controlledPhotographChildrenCB = $$('input.PhotographChildren');
		$$('input.Photograph').each(function(checkbox) {
			checkbox.observe('click', this.handelCheckboxGroup.bindAsEventListener(this, this.controlledPhotographChildrenCB));
		}, this);
		this.controlledPhotographCB.each(function(n) {
			n.observe('click', this.checkAllSelectedFigures.bindAsEventListener(this));
			}.bind(this));
		
		this.controlledPhotographChildrenCB.each(function(n) {
			n.observe('click', this.checkAllSelectedGroups.bindAsEventListener(this, this.controlledPhotographChildrenCB,'cb_Photograph'));
			}.bind(this));
		
		
		
		this.controlledMapCB = $$('input.Map');
		this.controlledMapChildrenCB = $$('input.MapChildren');
		$$('input.Map').each(function(checkbox) {
			checkbox.observe('click', this.handelCheckboxGroup.bindAsEventListener(this, this.controlledMapChildrenCB));
		}, this);
		
		this.controlledMapCB.each(function(n) {
			n.observe('click', this.checkAllSelectedFigures.bindAsEventListener(this));
			}.bind(this));
		
		this.controlledMapChildrenCB.each(function(n) {
			n.observe('click', this.checkAllSelectedGroups.bindAsEventListener(this, this.controlledMapChildrenCB, 'cb_Map'));
			}.bind(this));
		
		
		
		this.controlledFigureCB = $$('input.figureTypes');
		this.controlledFigureCB.each(function(n) {
			n.observe('click', this.checkAllSelectedFigures.bindAsEventListener(this));			
		}.bind(this));
		
		$$('input.selectAllFigCheckbox').each(function(checkbox) {
			checkbox.observe('click', this.handleFigureCheckbox.bindAsEventListener(this));
		}, this);
		
		this.controlledTableCB = $$('input.tableTypes');
		this.controlledTableCB.each(function(n) {
		n.observe('click', this.checkAllSelectedTables.bindAsEventListener(this));
		}.bind(this));
		
		$$('input.selectAllTableCheckbox').each(function(checkbox) {
			checkbox.observe('click', this.handleTableCheckbox.bindAsEventListener(this));
		}, this);
	},

	handelCheckboxGroup: function(event, checkboxGroup){
		var checkbox = event.element();
		if(checkbox.checked){
			checkboxGroup.each(function(n){n.checked = true;});
		}else{
			checkboxGroup.each(function(n){n.checked = false;});
		}
	},
	
	handleFigureCheckbox: function(event) {
		this.handelCheckboxGroup(event, this.controlledFigureCB) ;
		this.handelCheckboxGroup(event, this.controlledGraphCB) ;
		this.handelCheckboxGroup(event, this.controlledIllustrationCB) ;
		this.handelCheckboxGroup(event, this.controlledMapCB) ;
		this.handelCheckboxGroup(event, this.controlledPhotographCB) ;
		this.handelCheckboxGroup(event, this.controlledGraphChildrenCB) ;
		this.handelCheckboxGroup(event, this.controlledIllustrationChildrenCB) ;
		this.handelCheckboxGroup(event, this.controlledMapChildrenCB) ;
		this.handelCheckboxGroup(event, this.controlledPhotographChildrenCB) ;
		return false;
	},
	
	handleTableCheckbox: function(event) {
		var checkbox = event.element();
		if (checkbox.checked) {
			this.controlledTableCB.each(function(n){n.checked = true;});
			this.changeTableLinkState(true);
			return false;
		} else {
			this.controlledTableCB.each(function(n){n.checked = false;});
			this.changeTableLinkState(false);
			return false;
		}
	},
	
	checkAllSelectedFigures: function(event) {		
		var allSelected = true;
		this.controlledFigureCB.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});
		
		this.controlledGraphCB.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});
		this.controlledIllustrationCB.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});
		this.controlledMapCB.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});
		this.controlledPhotographCB.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});

		this.changeLinkState(allSelected,'selectAllFig');
	},
	
	checkAllSelectedGroups: function(event, checkBoxGroup, elementId) {
		var value = checkBoxGroup[0].checked;
		var allSelected = true;
		checkBoxGroup.each(function(n) {
			if (!n.checked) {
				allSelected = false;
			}
		});
		this.changeLinkState(allSelected, elementId);
		this.checkAllSelectedFigures(event);
	},
	
	

	checkAllSelectedTables: function(event) {
		var value = this.controlledTableCB[0].checked;
		var allSelected = true;
		this.controlledTableCB.each(function(n) {
			allSelected &= n.checked;
		});
		this.changeTableLinkState(allSelected);
	},
	
	changeLinkState: function(allSelected, elementId) {
		if (allSelected) {
			$(elementId).checked=true;
		} else {
			$(elementId).checked=false;
		}
	},
	
	changeTableLinkState: function(allSelected) {
		if (allSelected) {
			$('selectAllTable').checked=true;
		} else {
			$('selectAllTable').checked=false;
		}
	},	
	
	updateCheckboxes: function(checkBoxGroup, allSelected) {
		$$(checkBoxGroup).each(function(checkbox) {
			if (allSelected) {
				checkbox.checked = true;
			}
			else {
				checkbox.checked = false;
			}
		}, this);
	}
});

Tapestry.Initializer.fTLimitersCheckboxGroup = function(spec) {
	new FTLimitersCheckboxGroup(spec);
}

function toggleChildNodes(divid, linkid){
	var linkText = $(linkid);
	var childDiv = $(divid);
	 //if(linkText && (childDiv.getStyle("overflow") == "visible")) {
	if(linkText.hasClassName("indicator_expand")){
		// var text = linkText.innerHTML;
		//linkText.innerHTML = (text == '-' ? '+' : '-');
		linkText.title='Close category';
		linkText.removeClassName('indicator_expand'); 
		linkText.addClassName('indicator_collapse');
	 }else if(linkText.hasClassName("indicator_collapse")){
		 	linkText.title='Expand category';
			linkText.removeClassName('indicator_collapse');
			linkText.addClassName('indicator_expand');
				 
	 }
	 Effect.toggle(childDiv, 'blind', {duration: 1.0});
} ;
/* /assets/r20131.3.2-4/app/components/publications/PublicationIssueBrowse.js */;

function toggleFilter(event, filterDiv)
{
	event.stop();
	var element = this;
	Effect.toggle(filterDiv, 'blind', {
		duration: 0.5,
		afterFinish: function() {
			element.toggleClassName('expanded');
		} 
	});
}
//Effect.toggle('filter${filterIdx}-div', 'blind'); Element.toggleClassName(this, 'expanded');
/* /assets/r20131.3.2-4/app/components/publications/PublicationBrowseGroups.js */;
var PublicationBrowseGroup = Class.create(
{	
	initialize: function(config) {
		this.drillDownUrl = config.drillDownUrl;
		this.anchorID = config.anchorID;
		this.ajaxID = config.ajaxID;
		this.grouping = config.grouping;
		this.displayName = config.displayName;
		this.groupName = config.groupName;
		this.groupNameOriginal = config.groupNameOriginal;
		this.parentId = config.parentId;
		this.parentIdOriginal = config.parentIdOriginal;
		
		this.parentGrouping = config.parentGrouping;
		this.parentGroupName = config.parentGroupName;
		if (config.collapse != null) {
			
			var contractParentId = "CONTRACT" + this.anchorID;
			if($(contractParentId)!=null)
				$(contractParentId).observe('click', this.colapseSection.bindAsEventListener(this, true));
				
		} else {
			if($(this.anchorID)!=null){
				$(this.anchorID).observe('click', this.doFilter.bindAsEventListener(this, true));
			}
		}
	},

	doFilter: function(theEvent) {
		theEvent.stop();
		if ($(this.ajaxID).empty()) {
			var url = this.drillDownUrl;
			var startOfQueryStr = url.indexOf("?");
			var encodedDisplayName = encodeURIComponent( this.displayName );
			if (startOfQueryStr != -1) {
				url = url.substring(0, startOfQueryStr) +  "/" + this.grouping + "/" + encodedDisplayName + "/" + this.groupName + "/" + this.parentGrouping + "/" + this.parentGroupName + "/" + this.parentId + url.substring(startOfQueryStr);
			} else {
				url = url +  "/" + this.grouping + "/" + encodedDisplayName + "/" + this.groupName + "/" + this.parentId;
			}
			new Ajax.Request(url,
				{
					method: 'post',
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
						this.handleAjaxResponse(resp);
					}.bind(this)
				});
		} else {
			$(this.anchorID).observe('click', this.colapseSection.bindAsEventListener(this, true));
			$(this.ajaxID).show();
		}
	},
	
	handleAjaxResponse: function(resp) {
		var items = resp.items;
		var parentId = resp.parentId;
		var contractParentId = "CONTRACT"+parentId;
		var parentName = resp.parentName;
		var contractLink = "<a href=\"#\" id=\""+contractParentId+"\" class=\"indicators_base_sprite indicator_collapse\">"+parentName+"</a>";
		var html = "";
		var itemCount = 0;
		var allFilters=new Array();
		var count = 0;
		
		items.each( function(item) {
			if (item.issueUrl){
				var classValue = "pipe";
				if (count == 0)
					classValue = "firstpipe";
				if (count > 0)
					html = html + "<li class=\""+classValue+"\">";
				else
					html = html + "<li class=\""+classValue+"\">";
				html = html + "<a href=\""+item.issueUrl+"\" id=\""+item.anchor+"\" >"+item.displayName+"</a></li>";
				count ++;
			} else {
				if (count > 0)
					html = html + "<br/>";
				html = html + "<div id=\""+item.parent+"\"><a href=\"#\" id=\""+item.anchor+"\" class=\"indicators_base_sprite indicator_expand\">"+item.displayName+"</a></div>";
				//html = html + "<ul>";
				html = html + "<ul id=\""+item.ajax+"\" class=\"lichild\"></ul>";
				html = html + "<div class=\"clear\"></div>";
				html = html + "<div class=\"clear_left progressiveDisplay\"></div>";
				//html = html + "</ul>";
				count = 0;
			}
			allFilters[itemCount] = {"drillDownUrl" : item.drillUrl, "anchorID" : item.anchor, "ajaxID" : item.ajax, "grouping" : item.grouping, "groupName" : item.name , "parentId" : item.parent , "parentIdOriginal" : item.parent , "groupNameOriginal" : item.name, "displayName" : item.displayName, "parentGrouping" : item.parentGrouping, "parentGroupName" : item.parentGroupName};
			itemCount++;
		});
		
		
		$(parentId).innerHTML = contractLink;
		$(contractParentId).observe('click', this.colapseSection.bindAsEventListener(this, true));
		$(this.ajaxID).update(html);
		$(this.ajaxID).style.display = "block";
		itemCount = 0;
		items.each ( function(item) {
			if (!item.issueUrl){
				new PublicationBrowseGroup(allFilters[itemCount]);
			}
			itemCount++;
		});
	},
	colapseSection: function(theEvent) {
		theEvent.stop();
		var expandLink = "<a href=\"#\" id=\""+this.anchorID+"\" class=\"indicators_base_sprite indicator_expand\">"+this.displayName+"</a>";
		$(this.parentIdOriginal).update(expandLink);
		$(this.ajaxID).hide();
		$(this.anchorID).observe('click', this.doFilter.bindAsEventListener(this, true));
	}	
	
});

Tapestry.Initializer.publicationBrowseGroup = function(spec)
{
	new PublicationBrowseGroup(spec);
}
/* /assets/r20131.3.2-4/app/components/database/SubjectCookie.js */;
var SubjectCookie = {
		
	cookieName : "expandedSubjects",
	
	remove : function (subjectCode){
		var cookieValue = unescape(Cookies.read(this.cookieName));
		if (cookieValue != "null") {
			var newCookieValues = [];
			var values = cookieValue.split(',');
			for (var index = 0; index < values.length; index++) {
				if (subjectCode != values[index]) {
					newCookieValues[newCookieValues.length] = values[index];
				}
			}
			if (newCookieValues.length > 0) {
				Cookies.create(this.cookieName, escape(newCookieValues.join(',')));
			} else {
				Cookies.remove(this.cookieName);
			}
		}
		return true;
	},

	add : function (subjectCode){
		var cookieValue = unescape(Cookies.read(this.cookieName));
		var expanded = false;
		if (cookieValue != "null") {
			var values = cookieValue.split(',');
			for (var index = 0; index < values.length; index++) {
				if (subjectCode == values[index]) {
					expanded = true;
				}
			}
			if (! expanded) {
				cookieValue += ","+ subjectCode;
			}
		} else {
			cookieValue = subjectCode;
		}
		Cookies.create(this.cookieName, escape(cookieValue));
		return true;
	}
	
};

function setFocus(collapsed, expandLink, collapseLink){
	if(collapsed){
		document.getElementById(expandLink).focus();
	}else{
		document.getElementById(collapseLink).focus();
	}
}

/* /assets/r20131.3.2-4/app/components/database/SelectDatabases.js */;
var SelectDatabases = Class.create(
{
	initialize: function(spec)
	{
		if (spec.detailedView)
			$('briefViewLi').firstDescendant().observe('click', this.clickBriefViewLink.bindAsEventListener(this));
		else
			$('detailedViewLi').firstDescendant().observe('click', this.clickDetailedViewLink.bindAsEventListener(this));

	},
	
	clickDetailedViewLink : function(env) {
		$$('div.databaseDetailsContent').toggle();
	},
	clickBriefViewLink : function(env) {
		$$('div.databaseDetailsContent').toggle();
	}
});

Tapestry.Initializer.selectDatabases = function(spec)
{
	new SelectDatabases(spec);
}
/* /assets/r20131.3.2-4/app/components/search/CommandLine.js */;
function autoGrowFromEvent(event) {
	el = Event.element(event);
	autoGrow(el);
	return false;
}

function autoGrow(el) {
	if (el.scrollHeight > el.offsetHeight) {
	    while(el.scrollHeight > el.offsetHeight){
	    	el.rows++;
	    }
	} else {
	    if(el.rows > 4){
	    	el.rows--;
	    	this.autoGrow(el);
	    }
	}
}


/* /assets/r20131.3.2-4/app/components/AddSearchFields.js */;
var OverlayInit = Class.create( {
	initialize : function(spec) {
		this.overlayDisplay = spec.overlayDisplayURI;
		this.popupid = spec.overlayZone;
		
	}
});




Tapestry.Initializer.overlayInit = function(spec) {
	var overlayInit = new OverlayInit(spec);
};


var FieldSelectListener = Class.create( {
	initialize : function(spec) {
		this.selectId = spec.selectId;
		this.browseFields = spec.browseFieldsArr;
		this.optHelpZoneId = spec.optHelpZoneId;
		this.defaultFieldSelect = spec.defaultFieldSelect;
		this.searchTearmId = spec.searchTearmId;
		this.focusTermChangeURI = spec.focusTermChangeURI;
		this.page = spec.page;
		$(this.selectId).observe('change',
				this.handleSelectChange.bindAsEventListener(this));
		this.handleSelectChange();
		$(this.optHelpZoneId).observe(Tapestry.ZONE_UPDATED_EVENT,
				this.searchZoneUpdate.bindAsEventListener(this));
		document.observe('pq:focusSearchTerm', this.searchTermFocused.bindAsEventListener(this));
		document.observe('pq:addtoFormEvent', this.addToForm.bindAsEventListener(this));
	},
	searchTermFocused:function(event){
		event.stop(event);
		if(event.memo) {
			lastFocused= event.memo;
		}
		if(lastFocused && lastFocused != 'undefined'){
			this.searchTearmId = lastFocused;
			new Ajax.Request(this.focusTermChangeURI, {
				method :'post',
				parameters : {
					'searchTearmId' :this.searchTearmId
				},
				onSuccess : function(t) {}
			});
		}
		
	},
	addToForm:function(event) {
		var searchTermText = $(this.searchTearmId).value;
		if (searchTermText != '')
			searchTermText = searchTermText + ' ';
		
		var options = $$('.ops_options');
		var clientId = "";
		if (options[0].id.indexOf("_") != -1)
			clientId = (options[0].id).substring(options[0].id.indexOf("_"),
					options[0].id.length);

		var option = $('opsSelect' + clientId).value;
		var fieldSelect = $('fieldsSelect' + clientId).value;

		if(fieldSelect.length == 0 && option.length == 0) {
	    	$('fieldsErrorMsg').show();
	    } else {
	    	$('fieldsErrorMsg').hide();
	    }
		
		if (fieldSelect == "")
			fieldSelect = '';
		if (fieldSelect.indexOf("&mdash;") != -1)
			fieldSelect = fieldSelect.substring(fieldSelect.indexOf("&mdash;") + 7,
					fieldSelect.length);

		if (option == 'lessThan') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId),
						' ' + fieldSelect.toUpperCase() + '(\< )');
			} else {
				$(this.searchTearmId).value = searchTermText + fieldSelect.toUpperCase()
						+ '(\< )';
			}
		} else if (option == 'greaterThan') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId),
						' ' + fieldSelect.toUpperCase() + '(\> )');
			} else {
				$(this.searchTearmId).value = searchTermText + fieldSelect.toUpperCase()
						+ '(\> )';
			}
		} else if (option == 'equals') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId),
						' ' + fieldSelect.toUpperCase() + '(\= )');
			} else {
				$(this.searchTearmId).value = searchTermText + fieldSelect.toUpperCase()
						+ '(\= )';
			}
		} else if (option == 'lessThanEqualTo') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId),
						' ' + fieldSelect.toUpperCase() + '(\<= )');
			} else {
				$(this.searchTearmId).value = searchTermText + fieldSelect.toUpperCase()
						+ '(\<= )';
			}
		} else if (option == 'greaterThanEqualTo') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId),
						' ' + fieldSelect.toUpperCase() + '(\>= )');
			} else {
				$(this.searchTearmId).value = searchTermText + fieldSelect.toUpperCase()
						+ '(\>= )';
			}
		} else if (fieldSelect == '') {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId), ' ' + option.toUpperCase());
			} else {
				$(this.searchTearmId).value = searchTermText + option.toUpperCase();
			}
		} else {
			if (this.page == 'editsearchstrategy') {
				insertAtCaret($(this.searchTearmId), ' ' + option.toUpperCase() + ' '
						+ fieldSelect.toUpperCase() + '( )');
			} else {
				$(this.searchTearmId).value = searchTermText + option.toUpperCase()
						+ ' ' + fieldSelect.toUpperCase() + '( )';
			}
		}
		if (this.page == 'editsearchstrategy') {
			$(this.searchTearmId).focus();
		}
	},
	searchZoneUpdate : function(){
		this.handleSelectChange();
	},
	handleSelectChange : function() {
		var value = $(this.selectId).value;
		var mnemonic = value.substring(value.indexOf("&mdash;") + 7,
				value.length);
		var field = value.substring(0, value.indexOf("&mdash;"));
		var isBrowseField = false;
		this.browseFields.each( function(browseField) {
			isBrowseField |= (mnemonic == browseField.toUpperCase());
			if ($(currentSelection + 'Span')) {
				$(currentSelection + 'Span').hide();
			}
			if (isBrowseField) {
				var spanId =$(mnemonic.toLowerCase() + 'Span')
				if (spanId) {
					spanId.show();
					var link = spanId.down('a');
					link.observe('click', showLoadingOverlay.bindAsEventListener(this));
				}
				currentSelection = mnemonic.toLowerCase();
			}
		});
	}
	
});

function showLoadingOverlay(event) 
{
	var overlay = $('browseIndexLoadingOverlay');
	Overlay.box.showOverlay('browseIndexLoadingOverlay');
}

var currentSelection = "";



function insertAtCaret(obj, text) {
	var start = null;
	var temp = '';
	
	if (document.selection) {
		obj.focus();
		var range = document.selection.createRange();
		if (range.parentElement() != obj) {
			temp = text + ' ' + obj.value;
			obj.value = temp;
			return false;
		}

		range.text = text + ' ';
		range.select();

	} else if (obj.selectionStart >= 0) {
		start = obj.selectionStart;
		var end = obj.selectionEnd;
		if (start == obj.value.length) {
			temp = obj.value + ' '+ text;
			obj.value = temp;
			obj.focus();
			start = text.length;
			obj.setSelectionRange(start, start);
		} else {
			obj.value = obj.value.substr(0, start) + text
					+ obj.value.substr(end, obj.value.length);
			start = start + text.length;
			obj.focus();
			obj.setSelectionRange(start, start);
		}
	} else {
		obj.value += text;
		obj.focus();
	}

}

var fieldSelectListener;
Tapestry.Initializer.addSearchFields = function(spec) {
	fieldSelectListener = new FieldSelectListener(spec);
};
