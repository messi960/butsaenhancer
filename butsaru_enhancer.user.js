// ==UserScript==
// @name butsa.ru enhancer
// @namespace http://butsa.ru
// @include http://*.butsa.ru/*
// @include http://butsa.ru/*
// @include http://*.champions.ru/*
// @include http://champions.ru/*
// @require https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @require http://tablesorter.ru/jquery.tablesorter.min.js
// ==/UserScript==

if(typeof GM_getValue === "undefined") {
  GM_getValue = function(name){
    var nameEQ = escape("_greasekit" + name) + "=", ca = document.cookie.split(';');
    for (var i = 0, c; i < ca.length; i++) { 
      var c = ca[i]; 
      while (c.charAt(0) == ' ') c = c.substring(1, c.length); 
      if (c.indexOf(nameEQ) == 0) {
        return unescape(c.substring(nameEQ.length, c.length));
      }
    } 
    return null; 
  }
}

if(typeof GM_setValue === "undefined") {
  GM_setValue = function( name, value, options ){ 
    options = (options || {}); 
    if ( options.expiresInOneYear ){ 
      var today = new Date(); 
      today.setFullYear(today.getFullYear()+1, today.getMonth, today.getDay()); 
      options.expires = today; 
    } 
    var curCookie = escape("_greasekit" + name) + "=" + escape(value) + 
    ((options.expires) ? "; expires=" + options.expires.toGMTString() : "") + 
    ((options.path)    ? "; path="    + options.path : "") + 
    ((options.domain)  ? "; domain="  + options.domain : "") + 
    ((options.secure)  ? "; secure" : ""); 
    document.cookie = curCookie; 
  }
}

if(typeof GM_addStyle === "undefined") { 
  GM_addStyle = function(styles) {
    var oStyle = document.createElement("style"); 
    oStyle.setAttribute("type", "text\/css"); 
    oStyle.appendChild(document.createTextNode(styles)); 
    document.getElementsByTagName("head")[0].appendChild(oStyle); 
  } 
} 

if(typeof GM_log === "undefined") { 
  GM_log = function(log) {
    if(console) 
      console.log(log); 
    else 
      alert(log); 
  }
}

var beScript = {
	VERSION : "0.0.2",
    NAMESPACE : "butsa_enhancer",
    UPDATES_CHECK_FREQ : 15, //minutes
    S_ID : 101727,
    manu : null,
	log : function(msg) {
        GM_log( msg )
	},
    positions : {
        "Gk" : 1,
        "Sw" : 2,
        "Ld" : 3,
        "Cd" : 4,
        "Rd" : 5,
        "Lwd": 6,
        "Dm" : 7,
        "Rwd": 8,
        "Lm" : 9,
        "Cm" : 10,
        "Rm" : 11,
        "Lw" : 12,
        "Am" : 13,
        "Rw" : 14,
        "Lf" : 15,
        "Cf" : 16,
        "Rf" : 17
    },
    init : function() {
        beScript.addBeScriptHeader();
        beScript.Update.init();
        beScript.Util.init();
        if (beScript.Util.checkLocation( "kp.php" )) {
            beScript.forecasts.process();
        }
        if (beScript.Util.checkLocation( "roster" )) {
            beScript.roster.process();
        }
        if (beScript.Util.checkLocation( "organizer" )) {
            beScript.organizer.process();
        }
	},
    addBeScriptHeader : function() {
        var greetingTd = $(".autoten");
        greetingTd.attr( "width", "800" );
        greetingTd.before( "<td width='160' id='beScript_td'/>" );
        
        var beScript_td = $( "#beScript_td" );
        beScript_td.html( "<span id='beScript_menu' style='margin-left:20px;color:grey;'>beScript (" + beScript.VERSION + ")</span>" );
        beScript.menu = $("#beScript_menu");
    },
};

beScript.Util = {
    init : function() {
        $.tablesorter.addWidget({
            id: "beScript.zebra",
            format: function(table) {
                $("tr:nth-child(odd)",table).attr("bgcolor", "#FFFFFF");
                $("tr:nth-child(even)",table).attr("bgcolor", "#EEF4FA");
            }
        });
        
        $.tablesorter.addParser({ 
            id: 'beScript.sorter.positions', 
            is: function(s) { 
                return false; 
            }, 
            format: function(s) { 
                var posMatch = beScript.Util.checkByRegExp( s, "(Gk|[LCR][dmf])/?(.*)" );
                var result = beScript.positions[posMatch[1]];
                if ( posMatch[2] != "" ) {
                    result += beScript.positions[posMatch[2]] / 10;
                }

                return result;
            }, 
            type: 'numeric' 
        }); 
        
        GM_addStyle( "th.headerSortUp { color:red; } th.headerSortDown { color:green; }" )
    },
    checkByRegExp : function( string, regExpString ) {
		var rx = new RegExp(regExpString);

		var res = rx.exec(string);
		if (res) {
			return res;
		}
        
        return null;
    },
	checkLocation : function(str) {
		var rx = new RegExp(str);
		var res = rx.exec(window.location.href);
		if (res) {
			return res.toString();
		}
	},
    serialize : function(container, source) {
		var str = beScript.NAMESPACE + "_" + container;
        if ( typeof uneval != 'undefined' ) {
            GM_setValue(str, uneval(source));
        } else {
            GM_setValue(str, source);
        }
	},
	deserialize : function(container, defaultValue) {
		var value = GM_getValue(beScript.NAMESPACE + "_" + container, defaultValue);
//        beScript.log(container + " value is " + value);
        
		if (defaultValue != null) {
			if (value == "" || value == null || value == "null") {
				value = defaultValue;
//				beScript.log(container + " value set to default "
//						+ defaultValue);
			}
		}
        
		return eval(value);
	},
    checkPeriod : function(timeSource, period) {
		var lastupdate = beScript.Util.deserialize(timeSource, 0);
		var now = new Date().getTime();
		var dif = (now - lastupdate);
        
		if ((dif >= period) || (dif <= -period)) {
			beScript.Util.serialize(timeSource, now);
			return true;
		}
        
        return false;
	},
};

beScript.forecasts = {
    colorizeC11Diff : function() {
        var forecastTable = $("#PrognosesTableDiv");
        var tableBody = $("tbody", forecastTable);
        var tableRows = $("tr", tableBody);
        var originalColumnArray = new Array();
        
        tableRows.each( function(i) {
            if ( i == 0 ) {
                return;
            }
            
            originalColumnArray[i - 1] = new Object;
            originalColumnArray[i - 1].oldIndex = i;

            var home_c11 = $("td:nth-child(3)", $(this)).text();
            var away_c11 = $("td:nth-child(5)", $(this)).text();

            originalColumnArray[i - 1].value = home_c11 - away_c11;
        });
              
        originalColumnArray.sort( function(x, y) {
            var xValue = Math.abs(parseFloat(x.value));
            var yValue = Math.abs(parseFloat(y.value));
            return (xValue - yValue);
        });
        
        originalColumnArray.reverse();
        var sortedTableBody = $("<tbody/>");
        sortedTableBody.append($(tableRows[0]).clone());

        for (var i = 0; i < originalColumnArray.length; i++) {
            var newNode = $(tableRows[originalColumnArray[i].oldIndex]).clone();
            newNode.attr("bgColor", (i % 2 == 0)?"#EEF4FA":"#FFFFFF");
            var midNode = $( "td:nth-child(4)", newNode );
            midNode.attr( "align", "center" );
            
            if ( originalColumnArray[i].value > 0 ) {
                midNode.html( "<span style='color:green;'>◀</span>&nbsp;" );
            }
            
            midNode.append( "<span style='color:grey;'>" + (Math.round(originalColumnArray[i].value * 100) / 100) + "</span>" );
            
            if ( originalColumnArray[i].value < 0 ) {
                midNode.append( "&nbsp;<span style='color:red;'>▶</span>" );
            }
            
            sortedTableBody.append(newNode);
        }
      
        tableBody.replaceWith(sortedTableBody);
    },
    process : function () {
        beScript.forecasts.colorizeC11Diff();
    }
};

beScript.organizer = {
    _parseMatchesPage : function( text ) {
        var regex = new RegExp( /<tr\s*bgcolor=#ffffff\s*><td>\s<nobr>([^<]*)<\/nobr><\/td>\s<td>\s<a\shref=\/roster\/([^\/]+)\/>([^<]+)<\/a><\/td>\s<td>\s<center><a\shref=\/xml\/tour\/match.php\?id=(\d+)><b>(\d+:\d+)<\/b><\/a><\/td>\s<td>\s<div\salign="right"><a\shref=\/roster\/([^\/]+)\/>([^<]+)<\/a><\/td>\s<td>\s*([^<]+)<\/td>/ig );

        var a = regex.exec( text );
        
        a.shift();

        var regex2 = new RegExp( /<input\stype="hidden"\sname="ShortName"\s+value="(\w{3})\s.(\d+)."/ig );

        var a2 = regex2.exec( text );
        a.push( a2[1] );
        
        var regex3 = new RegExp( /<input\stype="hidden"\sname="Money"\s+value="([^\"]+)"/ig );

        var a3 = regex3.exec( text );
        a.push( a3[1] );
        
        return a;
    },

    // 0 - date
    // 1 - first_team_id
    // 2 - first_team_name
    // 3 - match_id
    // 4 - match_result
    // 5 - second_team_id
    // 6 - second_team_name
    // 7 - tour_name
    // 8 - my_team_num_id
    // 9 - team_money
    _addLastMatchesResults : function( team, result ) {
        var tablerow = document.evaluate('//td[contains(.,"' + team.name + '") and parent::tr[@bgcolor="#ffffff" or @bgcolor="#EEF4FA"]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode;
        var isHost = false;

        if ( result[8] == result[1] ) {
            isHost = true;
        }
        
        var matchresult = 1; // -1 - lost; 0 - draw; 1 - win
        var scores = result[4].split( ":" );
        var color = "green";

        if ( scores[0] == scores[1] ) {
            matchresult = 0;
            color = "grey";
        } else if ((isHost && scores[0] < scores[1]) || (!isHost && scores[0] > scores[1])) {
            matchresult = -1;
            color = "red";
        }
        
        $(tablerow).append( "<td align=\"center\"><a href=/matches/" + result[3] + "><div style=\"color:" + color + ";\">" + result[4] + "</div></a></td>" );
    },

    _getLastMatchResultForTeam : function( team ) {
        $.ajax({
            url: "/xml/players/roster.php?act=allmatches&id=" + team.id,
            success: function(data) {
                var a = beScript.organizer._parseMatchesPage(data);   

                try {
                    GM_setValue( beScript.NAMESPACE + ".organizer.team." + team.id, a.join("|"), {expiresInOneYear:true} );
                } catch(e) {
                    GM_setValue( beScript.NAMESPACE + ".organizer.team." + team.id, a.join("|") );
                }

                beScript.organizer._addLastMatchesResults( team, a );
            }
        });
    },
    addLastMatchesResults : function() {
        var teams = [];
        var teamOptions = $("select").children();
        
        if ( teamOptions.length > 0 ) {
            var tableheader = $('tr[bgcolor="#D3E1EC"][align="center"]');
        
            tableheader.append("<td><span title=\"Результат последнего матча\"><b>Последний матч</b></span></td>");

            for ( var i = 0; i < teamOptions.length; i++ )
            {
                teams[i] = {};
                teams[i].name = teamOptions[i].innerHTML;
                teams[i].id = teamOptions[i].value;

                var t = GM_getValue( beScript.NAMESPACE + ".organizer.team." + teams[i].id);
                var teamtablerow = document.evaluate('//td[contains(.,"' + teams[i].name + '") and parent::tr[@bgcolor="#ffffff" or @bgcolor="#EEF4FA"]]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue.parentNode;
                var teamMoney = teamtablerow.childNodes[4].textContent.replace(/[\.\s]/g,'');;

                if ( t && teamMoney == t.split("|")[9] ) {
                    beScript.organizer._addLastMatchesResults( teams[i], t.split("|") );
                } else {
                    beScript.organizer._getLastMatchResultForTeam( teams[i] );
                }
            }
        }
    },
    process : function() {
        beScript.organizer.addLastMatchesResults();
    }
};

beScript.roster = {
    makeTableSortable : function() {
        var playersTable = $($(".maintable")[2]);
        var playersTableBody = $(playersTable.children()[0]);
        var headerRow = $(playersTableBody.children()[0]);
        var footerRow = playersTableBody.children();
        footerRow = $(footerRow[footerRow.length - 1]);
        
        footerRow.remove();
        headerRow.remove();
        
        playersTableBody.before(headerRow);
        playersTableBody.after(footerRow);
        
        headerRow.children().each(function(i) {
            if ( $(this).attr("id") == "numrows" ) {
                return ;
            }
            
            $(this).replaceWith("<th>" + $(this).children().html() + "</th>");
        });
        
        headerRow.wrap( "<thead style='font-size: 10px;'/>" )
        footerRow.wrap( "<tfoot style='font-size: 10px;'/>" )

        var _headers = { 
                3: { sorter:'beScript.sorter.positions' },
            };
        
        if ( beScript.Util.checkLocation( "act=exp" ) ) {
            $.extend( true, _headers, {    
                10: { sorter:'digit' } 
            });
        } else if ( beScript.Util.checkLocation( "act=parameters" ) ) {
            $.extend( true, _headers, {
                10: { sorter:'digit' },
                11: { sorter:'digit' },
                12: { sorter:'digit' },
            });
        } else if ( beScript.Util.checkLocation( "school" ) && beScript.Util.checkLocation( "act=finance" ) ) {
            $.extend( true, _headers, {
                6: { sorter:'digit' },
                7: { sorter:'digit' },
                8: { sorter:'digit' },
            });
        } else {
            $.extend( true, _headers, {
                12: { sorter:'digit' }
            });
        }

        playersTable.tablesorter({
            widgets: ['beScript.zebra'],
            sortList: [[3,0]],
            headers: _headers,
            textExtraction : function(node) {
                var text = $(node).text();
                if ( text != "" ) {
                    var expMatch = beScript.Util.checkByRegExp( text, /(\d+)\((\d+)\)/ );
                    if ( expMatch ) {
                        return parseInt(expMatch[1]) / parseInt(expMatch[2]);
                    }

                    return text.replace( /\./g, "" ); 
                }
                
                if ( $(node).attr("title") ) {
                    return ( beScript.Util.checkByRegExp( $(node).attr("title"), /(\d+)/ )[1] );
                }
                
                if ( $("img", node).attr( "title" ) ) {
                    return ( $("img", node).attr( "title" ) );
                }
                
                return "";
            }
        });
    },
    process : function() {
        beScript.roster.makeTableSortable();
    }
};

beScript.Update = {
	UpdaterClass : function(updTime) {
		var _t = this;
		var url = 'http://butsaenhancer.googlecode.com/svn/trunk/version.txt';
		var randSeed = Math.floor(1 + (9999) * Math.random());

		this.init = function() {
			if (beScript.Util.checkPeriod("updTime", updTime)) {
				beScript.log("update check");
				this.check();
			}
		};

		this.check = function() {
			randSeed = Math.floor(1 + (9999) * Math.random());
			beScript.log("update url: " + url + "?seed=" + randSeed);
            
            if(typeof GM_xmlhttpRequest != "undefined") {
                GM_xmlhttpRequest({
						method : "GET",
						url : url + "?seed=" + randSeed,
						onreadystatechange : function(o) {
                            if (o.readyState == 4) {
                                _t.update(o.responseText);
                            }
                        }
					});
            } else {
                $.get(url + "?seed=" + randSeed, function(data) {_t.update($(data.responseText).text()); });
            }
		};

		this.update = function(checkver) {
                beScript.log(checkver);
                vnum = checkver;
                checkver = checkver.split('.');

                var thisver = beScript.VERSION.split('.');
                var flag = false;
                checkver = parseInt(checkver[0] * 10000, 10)
                        + parseInt(checkver[1] * 100, 10)
                        + parseInt(checkver[2], 10);
                thisver = parseInt(thisver[0] * 10000, 10)
                        + parseInt(thisver[1] * 100, 10)
                        + parseInt(thisver[2], 10);
                beScript.log("update processed");
                beScript.log("v:" + thisver + " u:" + checkver);

                if (checkver - thisver > 0) {
                    beScript.menu.css( {'color':'red','text-decoration':'underline'} );
                    beScript.menu.attr( "title", "Кликните, чтобы поставить версию " + vnum );
                    beScript.menu.attr( "onClick", "javascript:window.location='http://userscripts.org/scripts/source/101727.user.js'" );
                }
		};

		this.install = function() {
			window.location = 'http://userscripts.org/scripts/source/' + beScript.S_ID + '.user.js';

		};

		this.init();
	},
	updater : null,
	init : function() {
        beScript.Update.updater = new beScript.Update.UpdaterClass(beScript.UPDATES_CHECK_FREQ * 1000 * 60);
		setTimeout(function() {
					beScript.Update.updater.check();
				}, beScript.UPDATES_CHECK_FREQ * 1000 * 60);
	}
};

jQuery.ajax=(function(_ajax){var protocol=location.protocol,hostname=location.hostname,exRegex=RegExp(protocol+'//'+hostname),YQL='http'+(/^https/.test(protocol)?'s':'')+'://query.yahooapis.com/v1/public/yql?callback=?',query='select * from html where url="{URL}" and xpath="*"';function isExternal(url){return!exRegex.test(url)&&/:\/\//.test(url)}return function(o){var url=o.url;if(/get/i.test(o.type)&&!/json/i.test(o.dataType)&&isExternal(url)){o.url=YQL;o.dataType='json';o.data={q:query.replace('{URL}',url+(o.data?(/\?/.test(url)?'&':'?')+jQuery.param(o.data):'')),format:'xml'};if(!o.success&&o.complete){o.success=o.complete;delete o.complete}o.success=(function(_success){return function(data){if(_success){_success.call(this,{responseText:data.results[0].replace(/<script[^>]+?\/>|<script(.|\s)*?\/script>/gi,'')},'success')}}})(o.success)}return _ajax.apply(this,arguments)}})(jQuery.ajax);

(function(){
    if (typeof jQuery.tablesorter == 'undefined') {
        var GM_Head = document.getElementsByTagName('head')[0] || document.documentElement,
            GM_JQ = document.createElement('script');

        GM_JQ.src = 'http://tablesorter.ru/jquery.tablesorter.min.js';
        GM_JQ.type = 'text/javascript';
        GM_JQ.async = true;

        GM_Head.insertBefore(GM_JQ, GM_Head.firstChild);
    }
    GM_wait();
})();

function GM_wait() {
    if (typeof jQuery.tablesorter == 'undefined') {
        window.setTimeout(GM_wait, 100);
    } else {
        runBEScript();
    }
}

function runBEScript() {
    try {
        beScript.init();
    } catch (e) {
        beScript.log( e );
    }
}
