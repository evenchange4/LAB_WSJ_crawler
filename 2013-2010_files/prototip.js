//  Prototip 2.2.0.2 - 16-03-2010
//  Copyright (c) 2008-2010 Nick Stakenburg (http://www.nickstakenburg.com)
//
//  Licensed under a Creative Commons Attribution-Noncommercial-No Derivative Works 3.0 Unported License
//  http://creativecommons.org/licenses/by-nc-nd/3.0/

//  More information on this project:
//  http://www.nickstakenburg.com/projects/prototip2/

var Prototip = {
  Version: '2.2.0.2'
};

var Tips = {
  options: {
    paths: {                                // paths can be relative to this file or an absolute url
      images:     '../images/prototip/',
      javascript: ''
    },
    zIndex: 900                            // raise if required - DF theis was 6000 but I reduced to get Scholar popoups showing above
  }
};

Prototip.Styles = {
		  // The default style every other style will inherit from.
		  // Used when no style is set through the options on a tooltip.
		  'default': {
		    border: 3,
		    borderColor: '#046091',
		    className: 'default',
		    closeButton: false,
		    hideAfter: false,
		    hideOn: 'mouseleave',
		    hook: false,
			//images: 'styles/creamy/',    // Example: different images. An absolute url or relative to the images url defined above.
		    radius: 6,
			showOn: 'mousemove',
		    stem: {
		      //position: 'topLeft',       // Example: optional default stem position, this will also enable the stem
		      height: 12,
		      width: 15
		    }
		  },

		  'protoblue': {
		    className: 'protoblue',
		    border: 6,
		    borderColor: '#116497',
		    radius: 6,
		    stem: { height: 12, width: 15 }
		  },

		  'darkgrey': {
		    className: 'darkgrey',
		    border: 6,
		    borderColor: '#363636',
		    radius: 6,
		    stem: { height: 12, width: 15 }
		  },

		  'creamy': {
		    className: 'creamy',
		    border: 6,
		    borderColor: '#ebe4b4',
		    radius: 6,
		    stem: { height: 12, width: 15 }
		  },

  'protogrey': {
    className: 'protogrey',
    border: 6,
    borderColor: '#606060',
    radius: 6,
    stem: { height: 12, width: 15 }
  },
    
  'proquest': {
    className: 'proquest',
    border: 6,
    borderColor: '#999',
    radius: 4,
    closeButton: false,
    hideAfter: false,	
	hideOn: {element: 'tip', event: 'mouseout'},
    stem: { height: 2, width: 2 }
  },
	
  'proquestAdv': {
    className: 'proquestAdv',
    border: 6,
    borderColor: '#FEB511',
    radius: 6,
    stem: { height: 12, width: 15 }
  },
	
  'orig_default': {
    border: 6,
    borderColor: '#c7c7c7',
    className: 'orig_default',
    closeButton: false,
    hideAfter: false,
    hideOn: 'mouseleave',
    hook: false,
	//images: 'styles/creamy/',    // Example: different images. An absolute url or relative to the images url defined above.
    radius: 6,
	showOn: 'mousemove',
    stem: {
      //position: 'topLeft',       // Example: optional default stem position, this will also enable the stem
      height: 12,
      width: 15
    }
  }

};

eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('M.10(11,{6w:"1.6.1",3o:{26:!!X.6v("26").3r},3s:p(a){6u{X.6m("<2G 3Q=\'3U/1x\' 1I=\'"+a+"\'><\\/2G>")}6k(b){$$("6j")[0].J(I G("2G",{1I:a,3Q:"3U/1x"}))}},42:p(){3.49("3g");q a=/1K([\\w\\d-36.]+)?\\.3O(.*)/;3.35=(($$("2G[1I]").6h(p(b){K b.1I.27(a)})||{}).1I||"").32(a,"");s.22=(p(b){K{U:(/^(4l?:\\/\\/|\\/)/.4o(b.U))?b.U:3.35+b.U,1x:(/^(4l?:\\/\\/|\\/)/.4o(b.1x))?b.1x:3.35+b.1x}}.1h(3))(s.9.22);o(!11.2B){3.3s(s.22.1x+"3x.3O")}o(!3.3o.26){o(X.68>=8&&!X.3K.2z){X.3K.2W("2z","61:60-5Z-5Y:5L","#2v#4b")}Y{X.1a("4k:2O",p(){q b=X.5K();b.5J="2z\\\\:*{5G:2N(#2v#4b)}"})}}s.2s();G.1a(2J,"2I",3.2I)},49:p(a){o((5F 2J[a]=="5D")||(3.3f(2J[a].5C)<3.3f(3["3z"+a]))){3B("11 5z "+a+" >= "+3["3z"+a]);}},3f:p(a){q b=a.32(/36.*|\\./g,"");b=5x(b+"0".5q(4-b.1V));K a.5p("36")>-1?b-1:b},3b:p(a){K(a>0)?(-1*a):(a).5n()},2I:p(){s.3Z()}});M.10(s,(p(){p a(b){o(!b){K}b.40();o(b.13){b.E.1C();o(s.1j){b.1r.1C()}}s.1p=s.1p.4d(b)}K{1p:[],15:[],2s:p(){3.2o=3.1s},24:{C:"30",30:"C",v:"1o",1o:"v",1P:"1P",1c:"1e",1e:"1c"},3t:{H:"1c",F:"1e"},2Z:p(b){K!!21[1]?3.24[b]:b},1j:(p(c){q b=I 5m("5l ([\\\\d.]+)").5k(c);K b?(3G(b[1])<7):T})(5j.5i),2Q:(3g.5h.5g&&!X.5f),2W:p(b){3.1p.23(b)},1C:p(d){q g,e=[];1W(q c=0,b=3.1p.1V;c<b;c++){q f=3.1p[c];o(!g&&f.B==$(d)){g=f}Y{o(!f.B.46){e.23(f)}}}a(g);1W(q c=0,b=e.1V;c<b;c++){q f=e[c];a(f)}d.1K=25},3Z:p(){1W(q c=0,b=3.1p.1V;c<b;c++){a(3.1p[c])}},2k:p(d){o(d==3.4c){K}o(3.15.1V===0){3.2o=3.9.1s;1W(q c=0,b=3.1p.1V;c<b;c++){3.1p[c].E.r({1s:3.9.1s})}}d.E.r({1s:3.2o++});o(d.R){d.R.r({1s:3.2o})}3.4c=d},4e:p(b){3.3j(b);3.15.23(b)},3j:p(b){3.15=3.15.4d(b)},4h:p(){s.15.1N("S")},V:p(c,g){c=$(c),g=$(g);q l=M.10({1b:{x:0,y:0},N:T},21[2]||{});q e=l.1A||g.2j();e.C+=l.1b.x;e.v+=l.1b.y;q d=l.1A?[0,0]:g.3v(),b=X.1B.2i(),h=l.1A?"1O":"19";e.C+=(-1*(d[0]-b[0]));e.v+=(-1*(d[1]-b[1]));o(l.1A){q f=[0,0];f.H=0;f.F=0}q j={B:c.1R()},k={B:M.28(e)};j[h]=l.1A?f:g.1R();k[h]=M.28(e);1W(q i 3I k){3J(l[i]){Q"5b":Q"5a":k[i].C+=j[i].H;17;Q"57":k[i].C+=(j[i].H/2);17;Q"55":k[i].C+=j[i].H;k[i].v+=(j[i].F/2);17;Q"54":Q"53":k[i].v+=j[i].F;17;Q"52":Q"4Z":k[i].C+=j[i].H;k[i].v+=j[i].F;17;Q"4Y":k[i].C+=(j[i].H/2);k[i].v+=j[i].F;17;Q"4X":k[i].v+=(j[i].F/2);17}}e.C+=-1*(k.B.C-k[h].C);e.v+=-1*(k.B.v-k[h].v);o(l.N){c.r({C:e.C+"u",v:e.v+"u"})}K e}}})());s.2s();q 4W=4V.45({2s:p(c,e){3.B=$(c);o(!3.B){3B("11: G 4U 4T, 4S 45 a 13.");K}s.1C(3.B);q a=(M.2h(e)||M.37(e)),b=a?21[2]||[]:e;3.1n=a?e:25;o(b.1X){b=M.10(M.28(11.2B[b.1X]),b)}3.9=M.10(M.10({1i:T,1d:0,2K:"#4R",1k:0,L:s.9.L,18:s.9.4Q,1v:!(b.W&&b.W=="1S")?0.14:T,1q:T,1f:"1G",3u:T,V:b.V,1b:b.V?{x:0,y:0}:{x:16,y:16},1H:(b.V&&!b.V.1A)?1g:T,W:"2r",D:T,1X:"2v",19:3.B,12:T,1B:(b.V&&!b.V.1A)?T:1g,H:T},11.2B["2v"]),b);3.19=$(3.9.19);3.1k=3.9.1k;3.1d=(3.1k>3.9.1d)?3.1k:3.9.1d;o(3.9.U){3.U=3.9.U.3A("://")?3.9.U:s.22.U+3.9.U}Y{3.U=s.22.U+"3x/"+(3.9.1X||"")+"/"}o(!3.U.4P("/")){3.U+="/"}o(M.2h(3.9.D)){3.9.D={N:3.9.D}}o(3.9.D.N){3.9.D=M.10(M.28(11.2B[3.9.1X].D)||{},3.9.D);3.9.D.N=[3.9.D.N.27(/[a-z]+/)[0].2t(),3.9.D.N.27(/[A-Z][a-z]+/)[0].2t()];3.9.D.1z=["C","30"].4N(3.9.D.N[0])?"1c":"1e";3.1m={1c:T,1e:T}}o(3.9.1i){3.9.1i.9=M.10({2P:3g.4M},3.9.1i.9||{})}o(3.9.V.1A){q d=3.9.V.1l.27(/[a-z]+/)[0].2t();3.1O=s.24[d]+s.24[3.9.V.1l.27(/[A-Z][a-z]+/)[0].2t()].2w()}3.3L=(s.2Q&&3.1k);3.3M();s.2W(3);3.3N();11.10(3)},3M:p(){3.E=I G("P",{L:"1K"}).r({1s:s.9.1s});o(3.3L){3.E.S=p(){3.r("C:-3P;v:-3P;1F:2y;");K 3};3.E.O=p(){3.r("1F:15");K 3};3.E.15=p(){K(3.2X("1F")=="15"&&3G(3.2X("v").32("u",""))>-4L)}}3.E.S();o(s.1j){3.1r=I G("4K",{L:"1r",1I:"1x:T;",4J:0}).r({2A:"29",1s:s.9.1s-1,4I:0})}o(3.9.1i){3.1Y=3.1Y.33(3.34)}3.1l=I G("P",{L:"1n"});3.12=I G("P",{L:"12"}).S();o(3.9.18||(3.9.1f.B&&3.9.1f.B=="18")){3.18=I G("P",{L:"2e"}).1Z(3.U+"2e.2g")}},2D:p(){o(X.2O){3.39();3.43=1g;K 1g}Y{o(!3.43){X.1a("4k:2O",3.39);K T}}},39:p(){$(X.3a).J(3.E);o(s.1j){$(X.3a).J(3.1r)}o(3.9.1i){$(X.3a).J(3.R=I G("P",{L:"4D"}).1Z(3.U+"R.4z").S())}q g="E";o(3.9.D.N){3.D=I G("P",{L:"4y"}).r({F:3.9.D[3.9.D.1z=="1e"?"F":"H"]+"u"});q b=3.9.D.1z=="1c";3[g].J(3.3d=I G("P",{L:"4x 2F"}).J(3.4f=I G("P",{L:"4w 2F"})));3.D.J(3.1D=I G("P",{L:"4u"}).r({F:3.9.D[b?"H":"F"]+"u",H:3.9.D[b?"F":"H"]+"u"}));o(s.1j&&!3.9.D.N[1].4j().3A("4t")){3.1D.r({2A:"4r"})}g="4f"}o(3.1d){q d=3.1d,f;3[g].J(3.1Q=I G("6f",{L:"1Q"}).J(3.1U=I G("3n",{L:"1U 3l"}).r("F: "+d+"u").J(I G("P",{L:"2H 4q"}).J(I G("P",{L:"20"}))).J(f=I G("P",{L:"4s"}).r({F:d+"u"}).J(I G("P",{L:"4i"}).r({1t:"0 "+d+"u",F:d+"u"}))).J(I G("P",{L:"2H 4v"}).J(I G("P",{L:"20"})))).J(3.3e=I G("3n",{L:"3e 3l"}).J(3.3c=I G("P",{L:"3c"}).r("2E: 0 "+d+"u"))).J(3.4a=I G("3n",{L:"4a 3l"}).r("F: "+d+"u").J(I G("P",{L:"2H 4A"}).J(I G("P",{L:"20"}))).J(f.4B(1g)).J(I G("P",{L:"2H 4C"}).J(I G("P",{L:"20"})))));g="3c";q c=3.1Q.31(".20");$w("4E 4F 4G 4H").3W(p(j,h){o(3.1k>0){11.3V(c[h],j,{1M:3.9.2K,1d:d,1k:3.9.1k})}Y{c[h].2u("3F")}c[h].r({H:d+"u",F:d+"u"}).2u("20"+j.2w())}.1h(3));3.1Q.31(".4i",".3e",".3F").1N("r",{1M:3.9.2K})}3[g].J(3.13=I G("P",{L:"13 "+3.9.L}).J(3.1T=I G("P",{L:"1T"}).J(3.12)));o(3.9.H){q e=3.9.H;o(M.4O(e)){e+="u"}3.13.r("H:"+e)}o(3.D){q a={};a[3.9.D.1z=="1c"?"v":"1o"]=3.D;3.E.J(a);3.2f()}3.13.J(3.1l);o(!3.9.1i){3.2T({12:3.9.12,1n:3.1n})}},2T:p(e){q a=3.E.2X("1F");3.E.r("F:1J;H:1J;1F:2y").O();o(3.1d){3.1U.r("F:0");3.1U.r("F:0")}o(e.12){3.12.O().48(e.12);3.1T.O()}Y{o(!3.18){3.12.S();3.1T.S()}}o(M.37(e.1n)){e.1n.O()}o(M.2h(e.1n)||M.37(e.1n)){3.1l.48(e.1n)}3.13.r({H:3.13.47()+"u"});3.E.r("1F:15").O();3.13.O();q c=3.13.1R(),b={H:c.H+"u"},d=[3.E];o(s.1j){d.23(3.1r)}o(3.18){3.12.O().J({v:3.18});3.1T.O()}o(e.12||3.18){3.1T.r("H: 2S%")}b.F=25;3.E.r({1F:a});3.1l.2u("2F");o(e.12||3.18){3.12.2u("2F")}o(3.1d){3.1U.r("F:"+3.1d+"u");3.1U.r("F:"+3.1d+"u");b="H: "+(c.H+2*3.1d)+"u";d.23(3.1Q)}d.1N("r",b);o(3.D){3.2f();o(3.9.D.1z=="1c"){3.E.r({H:3.E.47()+3.9.D.F+"u"})}}3.E.S()},3N:p(){3.2M=3.1Y.1w(3);3.41=3.S.1w(3);o(3.9.1H&&3.9.W=="2r"){3.9.W="38"}o(3.9.W&&3.9.W==3.9.1f){3.1E=3.3Y.1w(3);3.B.1a(3.9.W,3.1E)}o(3.18){3.18.1a("38",p(d){d.1Z(3.U+"51.2g")}.1h(3,3.18)).1a("2L",p(d){d.1Z(3.U+"2e.2g")}.1h(3,3.18))}q c={B:3.1E?[]:[3.B],19:3.1E?[]:[3.19],1l:3.1E?[]:[3.E],18:[],29:[]},a=3.9.1f.B;3.2Y=a||(!3.9.1f?"29":"B");3.1L=c[3.2Y];o(!3.1L&&a&&M.2h(a)){3.1L=3.1l.31(a)}$w("O S").3W(p(g){q f=g.2w(),d=(3.9[g+"3S"].56||3.9[g+"3S"]);o(d=="38"){d=="3h"}Y{o(d=="2L"){d=="1G"}}3[g+"58"]=d}.1h(3));o(!3.1E&&3.9.W){3.B.1a(3.9.W,3.2M)}o(3.1L&&3.9.1f){3.1L.1N("1a",3.59,3.41)}o(!3.9.1H&&3.9.W=="1S"){3.2C=3.N.1w(3);3.B.1a("2r",3.2C)}3.3X=3.S.33(p(f,e){q d=e.5c(".2e");o(d){d.5d();e.5e();f(e)}}).1w(3);o(3.18||(3.9.1f&&(3.9.1f.B==".2e"))){3.E.1a("1S",3.3X)}o(3.9.W!="1S"&&(3.2Y!="B")){3.2l=p(){3.1y("O")}.1w(3);3.B.1a("1G",3.2l)}o(3.9.1f||3.9.1q){q b=[3.B,3.E];3.2R=p(){s.2k(3);3.2m()}.1w(3);3.2V=3.1q.1w(3);b.1N("1a","3h",3.2R).1N("1a","1G",3.2V)}o(3.9.1i&&3.9.W!="1S"){3.2n=3.3D.1w(3);3.B.1a("1G",3.2n)}},40:p(){o(3.9.W&&3.9.W==3.9.1f){3.B.1u(3.9.W,3.1E)}Y{o(3.9.W){3.B.1u(3.9.W,3.2M)}o(3.1L&&3.9.1f){3.1L.1N("1u")}}o(3.2C){3.B.1u("2r",3.2C)}o(3.2l){3.B.1u("2L",3.2l)}3.E.1u();o(3.9.1f||3.9.1q){3.B.1u("3h",3.2R).1u("1G",3.2V)}o(3.2n){3.B.1u("1G",3.2n)}},34:p(c,b){o(!3.13){o(!3.2D()){K}}3.N(b);o(3.2p){K}Y{o(3.3R){c(b);K}}3.2p=1g;q e=b.5o(),d={2c:{2b:e.x,2a:e.y}};q a=M.28(3.9.1i.9);a.2P=a.2P.33(p(g,f){3.2T({12:3.9.12,1n:f.5r});3.N(d);(p(){g(f);q h=(3.R&&3.R.15());o(3.R){3.1y("R");3.R.1C();3.R=25}o(h){3.O()}3.3R=1g;3.2p=25}.1h(3)).1v(0.6)}.1h(3));3.5s=G.O.1v(3.9.1v,3.R);3.E.S();3.2p=1g;3.R.O();3.5t=(p(){I 5u.5v(3.9.1i.2N,a)}.1h(3)).1v(3.9.1v);K T},3D:p(){3.1y("R")},1Y:p(a){o(!3.13){o(!3.2D()){K}}3.N(a);o(3.E.15()){K}3.1y("O");3.5w=3.O.1h(3).1v(3.9.1v)},1y:p(a){o(3[a+"3C"]){5y(3[a+"3C"])}},O:p(){o(3.E.15()){K}o(s.1j){3.1r.O()}o(3.9.3u){s.4h()}s.4e(3);3.13.O();3.E.O();o(3.D){3.D.O()}3.B.3y("1K:5A")},1q:p(a){o(3.9.1i){o(3.R&&3.9.W!="1S"){3.R.S()}}o(!3.9.1q){K}3.2m();3.5B=3.S.1h(3).1v(3.9.1q)},2m:p(){o(3.9.1q){3.1y("1q")}},S:p(){3.1y("O");3.1y("R");o(!3.E.15()){K}3.3w()},3w:p(){o(s.1j){3.1r.S()}o(3.R){3.R.S()}3.E.S();(3.1Q||3.13).O();s.3j(3);3.B.3y("1K:2y")},3Y:p(a){o(3.E&&3.E.15()){3.S(a)}Y{3.1Y(a)}},2f:p(){q c=3.9.D,b=21[0]||3.1m,d=s.2Z(c.N[0],b[c.1z]),f=s.2Z(c.N[1],b[s.24[c.1z]]),a=3.1k||0;3.1D.1Z(3.U+d+f+".2g");o(c.1z=="1c"){q e=(d=="C")?c.F:0;3.3d.r("C: "+e+"u;");3.1D.r({"2q":d});3.D.r({C:0,v:(f=="1o"?"2S%":f=="1P"?"50%":0),5E:(f=="1o"?-1*c.H:f=="1P"?-0.5*c.H:0)+(f=="1o"?-1*a:f=="v"?a:0)+"u"})}Y{3.3d.r(d=="v"?"1t: 0; 2E: "+c.F+"u 0 0 0;":"2E: 0; 1t: 0 0 "+c.F+"u 0;");3.D.r(d=="v"?"v: 0; 1o: 1J;":"v: 1J; 1o: 0;");3.1D.r({1t:0,"2q":f!="1P"?f:"29"});o(f=="1P"){3.1D.r("1t: 0 1J;")}Y{3.1D.r("1t-"+f+": "+a+"u;")}o(s.2Q){o(d=="1o"){3.D.r({N:"4n",5H:"5I",v:"1J",1o:"1J","2q":"C",H:"2S%",1t:(-1*c.F)+"u 0 0 0"});3.D.1X.2A="4m"}Y{3.D.r({N:"44","2q":"29",1t:0})}}}3.1m=b},N:p(b){o(!3.13){o(!3.2D()){K}}s.2k(3);o(s.1j){q a=3.E.1R();o(!3.2x||3.2x.F!=a.F||3.2x.H!=a.H){3.1r.r({H:a.H+"u",F:a.F+"u"})}3.2x=a}o(3.9.V){q j,h;o(3.1O){q k=X.1B.2i(),c=b.2c||{};q g,i=2;3J(3.1O.4j()){Q"5M":Q"5N":g={x:0-i,y:0-i};17;Q"5O":g={x:0,y:0-i};17;Q"5P":Q"5Q":g={x:i,y:0-i};17;Q"5R":g={x:i,y:0};17;Q"5S":Q"5T":g={x:i,y:i};17;Q"5U":g={x:0,y:i};17;Q"5V":Q"5W":g={x:0-i,y:i};17;Q"5X":g={x:0-i,y:0};17}g.x+=3.9.1b.x;g.y+=3.9.1b.y;j=M.10({1b:g},{B:3.9.V.1l,1O:3.1O});h=s.V(3.E,3.19,j);o(3.9.1B){q n=3.2U(h),m=n.1m;h=n.N;h.C+=m.1e?2*11.3b(g.x-3.9.1b.x):0;h.v+=m.1e?2*11.3b(g.y-3.9.1b.y):0;o(3.D&&(3.1m.1c!=m.1c||3.1m.1e!=m.1e)){3.2f(m)}}h={C:h.C+"u",v:h.v+"u"};3.E.r(h)}Y{j=M.10({1b:3.9.1b},{B:3.9.V.1l,19:3.9.V.19});h=s.V(3.E,3.19,M.10({N:1g},j));h={C:h.C+"u",v:h.v+"u"}}o(3.R){q e=s.V(3.R,3.19,M.10({N:1g},j))}o(s.1j){3.1r.r(h)}}Y{q f=3.19.2j(),c=b.2c||{},h={C:((3.9.1H)?f[0]:c.2b||3H.2b(b))+3.9.1b.x,v:((3.9.1H)?f[1]:c.2a||3H.2a(b))+3.9.1b.y};o(!3.9.1H&&3.B!==3.19){q d=3.B.2j();h.C+=-1*(d[0]-f[0]);h.v+=-1*(d[1]-f[1])}o(!3.9.1H&&3.9.1B){q n=3.2U(h),m=n.1m;h=n.N;o(3.D&&(3.1m.1c!=m.1c||3.1m.1e!=m.1e)){3.2f(m)}}h={C:h.C+"u",v:h.v+"u"};3.E.r(h);o(3.R){3.R.r(h)}o(s.1j){3.1r.r(h)}}},2U:p(c){q e={1c:T,1e:T},d=3.E.1R(),b=X.1B.2i(),a=X.1B.1R(),g={C:"H",v:"F"};1W(q f 3I g){o((c[f]+d[g[f]]-b[f])>a[g[f]]){c[f]=c[f]-(d[g[f]]+(2*3.9.1b[f=="C"?"x":"y"]));o(3.D){e[s.3t[g[f]]]=1g}}}K{N:c,1m:e}}});M.10(11,{3V:p(d,g){q j=21[2]||3.9,f=j.1k,c=j.1d,e={v:(g.3E(0)=="t"),C:(g.3E(1)=="l")};o(3.3o.26){q b=I G("26",{L:"62"+g.2w(),H:c+"u",F:c+"u"});d.J(b);q i=b.3r("2d");i.63=j.1M;i.64((e.C?f:c-f),(e.v?f:c-f),f,0,65.66*2,1g);i.67();i.3T((e.C?f:0),0,c-f,c);i.3T(0,(e.v?f:0),c,c-f)}Y{q h;d.J(h=I G("P").r({H:c+"u",F:c+"u",1t:0,2E:0,2A:"4m",N:"4n",69:"2y"}));q a=I G("2z:6a",{6b:j.1M,6c:"6d",6e:j.1M,4p:(f/c*0.5).6g(2)}).r({H:2*c-1+"u",F:2*c-1+"u",N:"44",C:(e.C?0:(-1*c))+"u",v:(e.v?0:(-1*c))+"u"});h.J(a);a.3q=a.3q}}});G.6i({1Z:p(c,b){c=$(c);q a=M.10({4g:"v C",3i:"6l-3i",3k:"6n",1M:""},21[2]||{});c.r(s.1j?{6o:"6p:6q.6r.6s(1I=\'"+b+"\'\', 3k=\'"+a.3k+"\')"}:{6t:a.1M+" 2N("+b+") "+a.4g+" "+a.3i});K c}});11.3m={3p:p(a){o(a.B&&!a.B.46){K 1g}K T},O:p(){o(11.3m.3p(3)){K}s.2k(3);3.2m();q d={};o(3.9.V){d.2c={2b:0,2a:0}}Y{q a=3.19.2j(),c=3.19.3v(),b=X.1B.2i();a.C+=(-1*(c[0]-b[0]));a.v+=(-1*(c[1]-b[1]));d.2c={2b:a.C,2a:a.v}}o(3.9.1i){3.34(d)}Y{3.1Y(d)}3.1q()}};11.10=p(a){a.B.1K={};M.10(a.B.1K,{O:11.3m.O.1h(a),S:a.S.1h(a),1C:s.1C.1h(s,a.B)})};11.42();',62,405,'|||this||||||options|||||||||||||||if|function|var|setStyle|Tips||px|top||||||element|left|stem|wrapper|height|Element|width|new|insert|return|className|Object|position|show|div|case|loader|hide|false|images|hook|showOn|document|else||extend|Prototip|title|tooltip||visible||break|closeButton|target|observe|offset|horizontal|border|vertical|hideOn|true|bind|ajax|fixIE|radius|tip|stemInverse|content|bottom|tips|hideAfter|iframeShim|zIndex|margin|stopObserving|delay|bindAsEventListener|javascript|clearTimer|orientation|mouse|viewport|remove|stemImage|eventToggle|visibility|mouseleave|fixed|src|auto|prototip|hideTargets|backgroundColor|invoke|mouseHook|middle|borderFrame|getDimensions|click|toolbar|borderTop|length|for|style|showDelayed|setPngBackground|prototip_Corner|arguments|paths|push|_inverse|null|canvas|match|clone|none|pointerY|pointerX|fakePointer||close|positionStem|png|isString|getScrollOffsets|cumulativeOffset|raise|eventCheckDelay|cancelHideAfter|ajaxHideEvent|zIndexTop|ajaxContentLoading|float|mousemove|initialize|toLowerCase|addClassName|default|capitalize|iframeShimDimensions|hidden|ns_vml|display|Styles|eventPosition|build|padding|clearfix|script|prototip_CornerWrapper|unload|window|borderColor|mouseout|eventShow|url|loaded|onComplete|WebKit419|activityEnter|100|_update|getPositionWithinViewport|activityLeave|add|getStyle|hideElement|inverseStem|right|select|replace|wrap|ajaxShow|path|_|isElement|mouseover|_build|body|toggleInt|borderCenter|stemWrapper|borderMiddle|convertVersionString|Prototype|mouseenter|repeat|removeVisible|sizingMethod|borderRow|Methods|li|support|hold|outerHTML|getContext|insertScript|_stemTranslation|hideOthers|cumulativeScrollOffset|afterHide|styles|fire|REQUIRED_|include|throw|Timer|ajaxHide|charAt|prototip_Fill|parseFloat|Event|in|switch|namespaces|fixSafari2|setup|activate|js|9500px|type|ajaxContentLoaded|On|fillRect|text|createCorner|each|buttonEvent|toggle|removeAll|deactivate|eventHide|start|_isBuilding|absolute|create|parentNode|getWidth|update|require|borderBottom|VML|_highest|without|addVisibile|stemBox|align|hideAll|prototip_Between|toUpperCase|dom|https|block|relative|test|arcSize|prototip_CornerWrapperTopLeft|inline|prototip_BetweenCorners|MIDDLE|prototip_StemImage|prototip_CornerWrapperTopRight|prototip_StemBox|prototip_StemWrapper|prototip_Stem|gif|prototip_CornerWrapperBottomLeft|cloneNode|prototip_CornerWrapperBottomRight|prototipLoader|tl|tr|bl|br|opacity|frameBorder|iframe|9500|emptyFunction|member|isNumber|endsWith|closeButtons|000000|cannot|available|not|Class|Tip|leftMiddle|bottomMiddle|rightBottom||close_hover|bottomRight|leftBottom|bottomLeft|rightMiddle|event|topMiddle|Action|hideAction|rightTop|topRight|findElement|blur|stop|evaluate|WebKit|Browser|userAgent|navigator|exec|MSIE|RegExp|abs|pointer|indexOf|times|responseText|loaderTimer|ajaxTimer|Ajax|Request|showTimer|parseInt|clearTimeout|requires|shown|hideAfterTimer|Version|undefined|marginTop|typeof|behavior|clear|both|cssText|createStyleSheet|vml|LEFTTOP|TOPLEFT|TOPMIDDLE|TOPRIGHT|RIGHTTOP|RIGHTMIDDLE|RIGHTBOTTOM|BOTTOMRIGHT|BOTTOMMIDDLE|BOTTOMLEFT|LEFTBOTTOM|LEFTMIDDLE|com|microsoft|schemas|urn|cornerCanvas|fillStyle|arc|Math|PI|fill|documentMode|overflow|roundrect|fillcolor|strokeWeight|1px|strokeColor|ul|toFixed|find|addMethods|head|catch|no|write|scale|filter|progid|DXImageTransform|Microsoft|AlphaImageLoader|background|try|createElement|REQUIRED_Prototype'.split('|'),0,{}))