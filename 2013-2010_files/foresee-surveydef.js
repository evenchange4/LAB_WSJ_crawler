FSR.surveydefs = [{
    name: 'search',
    pin: 1,
    invite: {
        when: 'onentry'
    },
    pop: {
        when: 'later',
        what: 'qualifier'
    },
    criteria: {
        sp: 8,
        lf: 3
    },
    include: {
        urls: ['search.proquest.com']
    }
}, {
    name: 'browse',
    lock: 1,
    invite: {
        when: 'onentry'
    },
    pop: {
        when: 'later',
        what: 'qualifier'
    },
    criteria: {
        sp: 35,
        lf: 1
    },
    include: {
        urls: ['.']
    }
}];
FSR.properties = {
    repeatdays: 90,
    
    repeatoverride: false,
    
    altcookie: {},
    
    language: {
        locale: 'en'
    },
    
    exclude: {},
    
    zIndexPopup: 10000,
    
    ignoreWindowTopCheck: false,
    
    ipexclude: 'fsr$ip',
    
    mobileHeartbeat: {
        delay: 60, /*mobile on exit heartbeat delay seconds*/
        max: 3600 /*mobile on exit heartbeat max run time seconds*/
    },
    
    invite: {
    
        // For no site logo, comment this line:
        siteLogo: "sitelogo.gif",
        
        //alt text fore site logo img
        siteLogoAlt: "",
        
        /* Desktop */
        dialogs: [[{
            reverseButtons: false,
            headline: "We'd welcome your feedback!",
            blurb: "Thank you for using ProQuest or ProQuest Dialog. You have been selected to participate in a brief customer satisfaction survey to let us know how we can improve your experience.",
            noticeAboutSurvey: "The survey is designed to measure your entire experience, please look for it at the <u>conclusion</u> of your visit.",
            attribution: "This survey is conducted by an independent company ForeSee, on behalf of the site you are visiting.",
            closeInviteButtonText: "Click to close.",
            declineButton: "No, thanks",
            acceptButton: "Yes, I'll give feedback"
        
        }]],
        
        exclude: {
            urls: ['trials.proquest.com/pqte/cust/requestTrial.do', '/trials/requestTrialInput', '/en-US/utilities/widgets/', '/en-US/utilities/syndication/', 'support.proquest.com'],
            referrers: [],
            userAgents: [],
            browsers: [],
            cookies: [],
            variables: [{
                name: 'strUserIP',
                value: []
            }]
        },
        include: {
            local: ['.']
        },
        
        delay: 0,
        timeout: 0,
        
        hideOnClick: false,
        
        hideCloseButton: false,
        
        css: 'foresee-dhtml.css',
        
        hide: [],
        
        hideFlash: false,
        
        type: 'dhtml',
        /* desktop */
        // url: 'invite.html'
        /* mobile */
        url: 'invite-mobile.html',
        back: 'url'
    
        //SurveyMutex: 'SurveyMutex'
    },
    
    tracker: {
        width: '690',
        height: '415',
        timeout: 3,
        adjust: true,
        alert: {
            enabled: true,
            message: 'The survey is now available.'
        },
        url: 'tracker.html'
    },
    
    survey: {
        width: 690,
        height: 600
    },
    
    qualifier: {
        footer: '<div div id=\"fsrcontainer\"><div style=\"float:left;width:80%;font-size:8pt;text-align:left;line-height:12px;\">This survey is conducted by an independent company ForeSee,<br>on behalf of the site you are visiting.</div><div style=\"float:right;font-size:8pt;\"><a target="_blank" title="Validate TRUSTe privacy certification" href="//privacy-policy.truste.com/click-with-confidence/ctv/en/www.foreseeresults.com/seal_m"><img border=\"0\" src=\"{%baseHref%}truste.png\" alt=\"Validate TRUSTe Privacy Certification\"></a></div></div>',
        width: '690',
        height: '500',
        bgcolor: '#333',
        opacity: 0.7,
        x: 'center',
        y: 'center',
        delay: 0,
        buttons: {
            accept: 'Continue'
        },
        hideOnClick: false,
        css: 'foresee-dhtml.css',
        url: 'reminder.html'
    },
    
    cancel: {
        url: 'cancel.html',
        width: '690',
        height: '400'
    },
    
    pop: {
        what: 'survey',
        after: 'leaving-site',
        pu: false,
        tracker: true
    },
    
    meta: {
        referrer: true,
        terms: true,
        ref_url: true,
        url: true,
        url_params: false,
        user_agent: false,
        entry: false,
        entry_params: false
    },
    
    events: {
        enabled: true,
        id: true,
        codes: {
            purchase: 800,
            items: 801,
            dollars: 802,
            followup: 803,
            information: 804,
            content: 805
        },
        pd: 7,
        custom: {
            purchase: {
                enabled: true,
                repeat: false,
                source: 'url',
                patterns: ['/advanced', '/myresearch']
            }
        }
    },
    
    previous: false,
    
    analytics: {
        google_local: false,
        google_remote: false
    },
    
    cpps: {
        Error_Page: {
            source: 'url',
            init: 'no',
            patterns: [{
                regex: '/errorpage',
                value: 'yes'
            }]
        },
        No_Results: {
            source: 'url',
            init: 'no',
            patterns: [{
                regex: '/noresults',
                value: 'yes'
            }]
        },
        My_Research: {
            source: 'url',
            init: 'no',
            patterns: [{
                regex: '/myresearch',
                value: 'yes'
            }]
        },
        Advanced: {
            source: 'url',
            init: 'no',
            patterns: [{
                regex: '/advanced',
                value: 'yes'
            }]
        },
        Professional: {
            source: 'url',
            init: 'no',
            patterns: [{
                regex: '/professional',
                value: 'yes'
            }]
        },
        Account_ID: {
            source: 'parameter',
            name: 'accountid'
        },
        User_IP: { //This will need to be captured server side and assigned to a variable
            source: 'variable', //named "strUserIP"
            name: 'strUserIP'
        },
        Session_ID: { //This will be to be assigned to a variable named "strSessionID"
            source: 'variable', //from whatever source is available.
            name: 'strSessionID'
        }
    },
    
    mode: 'first-party'
};
