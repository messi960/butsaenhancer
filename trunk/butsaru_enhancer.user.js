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

if (typeof(this['uneval']) !== 'function') {
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var protos = [];
    var char2esc = {
        '\t': 't',
        '\n': 'n',
        '\v': 'v',
        '\f': 'f',
        '\r': '\r',
        '\'': '\'',
        '\"': '\"',
        '\\': '\\'
    };
    var escapeChar = function(c){
        if (c in char2esc) return '\\' + char2esc[c];
        var ord = c.charCodeAt(0);
        return ord < 0x20 ? '\\x0' + ord.toString(16) : ord < 0x7F ? '\\' + c : ord < 0x100 ? '\\x' + ord.toString(16) : ord < 0x1000 ? '\\u0' + ord.toString(16) : '\\u' + ord.toString(16);
    };
    var uneval_asis = function(o){
        return o.toString();
    };
    /* predefine objects where typeof(o) != 'object' */
    var name2uneval = {
        'boolean': uneval_asis,
        'number': uneval_asis,
        'string': function(o){
            return '\'' +
            o.toString().replace(/[\x00-\x1F\'\"\\\u007F-\uFFFF]/g, escapeChar) +
            '\'';
        },
        'undefined': function(o){
            return 'undefined';
        },
        'function': uneval_asis
    };
    var uneval_default = function(o, np){
        var src = []; // a-ha!
        for (var p in o) {
            if (!hasOwnProperty.call(o, p)) continue;
            src[src.length] = uneval(p) + ':' + uneval(o[p], 1);
        }
        // parens needed to make eval() happy
        return np ? '{' + src.toString() + '}' : '({' + src.toString() + '})';
    };
    uneval_set = function(proto, name, func){
        protos[protos.length] = [proto, name];
        name2uneval[name] = func || uneval_default;
    };
    uneval_set(Array, 'array', function(o){
        var src = [];
        for (var i = 0, l = o.length; i < l; i++) 
            src[i] = uneval(o[i]);
        return '[' + src.toString() + ']';
    });
    uneval_set(RegExp, 'regexp', uneval_asis);
    uneval_set(Date, 'date', function(o){
        return '(new Date(' + o.valueOf() + '))';
    });
    var typeName = function(o){
        // if (o === null) return 'null';
        var t = typeof o;
        if (t != 'object') return t;
        // we have to lenear-search. sigh.
        for (var i = 0, l = protos.length; i < l; i++) {
            if (o instanceof protos[i][0]) return protos[i][1];
        }
        return 'object';
    };
    uneval = function(o, np){
        // if (o.toSource) return o.toSource();
        if (o === null) return 'null';
        var func = name2uneval[typeName(o)] || uneval_default;
        return func(o, np);
    };
}

var beScript = {
	VERSION : "0.0.4",
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
        if (beScript.Util.checkLocation( "school" )) {
            beScript.school.process();
        }
        if (beScript.Util.checkLocation( "train" )) {
            beScript.train.process();
        }
        if (beScript.Util.checkLocation( "roster" ) && !beScript.Util.checkLocation( "school" )) {
            beScript.roster.process();
        }
        if (beScript.Util.checkLocation( "ratings" )) {
            beScript.ratings.process();
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
        
        GM_addStyle( "th.headerSortUp { color:red; } th.headerSortDown { color:green; } th { background-color: #D3E1EC;}" )
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
            GM_setValue(str, $.serialize(source));
        }
	},
	deserialize : function(container, defaultValue) {
		var value = GM_getValue(beScript.NAMESPACE + "_" + container, defaultValue);
        beScript.log(container + " value is " + value);
        
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
    makeTableSortable : function( settingName, table, sorters, defaultSort, hasBottomRow, tableIndexOnAPage ) {
        var autoName = beScript.Util.checkByRegExp(window.location.href, /act=(\w+)/);
        
        if ( autoName ) {
            settingName += autoName[1];
        }
        
        if ( tableIndexOnAPage ) {
            settingName += "_" + tableIndexOnAPage;
        }
        
        var playersTableBody = $(table.children()[0]);
        var headerRow = $(playersTableBody.children()[0]);
        
        if ( hasBottomRow != false ) {
            var footerRow = playersTableBody.children();
            footerRow = $(footerRow[footerRow.length - 1]);
            
            footerRow.remove();
            footerRow.wrap( "<tfoot style='font-size: 10px;'/>" )
            playersTableBody.after(footerRow);
        }
        
        headerRow.remove();
        playersTableBody.before(headerRow);
        
        $( "td", headerRow ).each(function(i) {
            if ( $(this).attr("id") == "numrows" ) {
                return ;
            }

            var thistd = this;
            var newElement = $("<th></th>");            
            $.each(this.attributes, function(index) {
                $(newElement).attr(thistd.attributes[index].name, thistd.attributes[index].value);
            });
            newElement.html($(thistd).children().html())
            $(this).after(newElement).remove();
        });
        
        headerRow.wrap( "<thead style='font-size: 10px;'/>" )

        //var sortSettings = [defaultSort];
        var sortSettings = beScript.Util.deserialize( settingName, [defaultSort] );
        
        table.tablesorter({
            widgets: ['beScript.zebra'],
            sortList: sortSettings,
            headers: sorters,
            textExtraction : function(node) {
                if ( $("select", $(node)).length > 0 ) {
                    return $(":selected", $(node)).text().trim();
                }

                var text = $(node).text().trim();
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
                
                if ( $("img", node).attr( "src" ) ) {
                    return ( $("img", node).attr( "src" ) );
                }
                
                return "";
            }
        });
        
        table.bind("sortEnd", function() { 
            var sortedColumns = $(".headerSortDown,.headerSortUp", table);
            var prnt = $("th", $(sortedColumns[0]).parent());
            if ( sortedColumns.length == 1 ) {
                sortSettings = [];
            }
            for (var i = 0; i < sortedColumns.length; i++ ) {
                var sortedClass = $(sortedColumns[i]).attr( "class" );
                var index = prnt.index( sortedColumns[i] );

                if ( index < 0 ) {
                    continue;
                }
                
                var sortDirection = 1;
                
                if ( beScript.Util.checkByRegExp( sortedClass, "Down" ) ) {
                    sortDirection = 0;
                }
                var found = false;
                for ( var k = 0; k < sortSettings.length; k++ ) {
                    if ( sortSettings[k][0] == index ) {
                        found = true;
                        sortSettings[k][1] = sortDirection;
                        
                        break;
                    }
                }
                
                if ( !found ) {
                    sortSettings.push( [index, sortDirection] );
                }
            }
            beScript.Util.serialize( settingName, sortSettings );
        });
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
        if (beScript.Util.checkLocation( "act=teamstatistics" )) {
            beScript.organizer.addLastMatchesResults();
        }
    }
};

beScript.roster = {
    makeC11Links : function() {
        var division = $("input[name='Division']").attr( "value" );
        if ( division ) {
            var divisionId = beScript.Util.checkByRegExp(division, /division=(\d+)/)[1];
            var powerSpan = $("input[name='Power']").next();
            powerSpan.wrap( "<a href='http://www.butsa.ru/xml/ratings/ratings.php?class=1&id=1&Division=" + divisionId + "' />" );
            var power11Span = $("input[name='Power11']").next();
            power11Span.wrap( "<a href='http://www.butsa.ru/xml/ratings/ratings.php?class=1&id=28&Division=" + divisionId + "' />" );
        }
    },
    process : function() {
        var playersTable = $($(".maintable")[2]);
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
        } else {
            $.extend( true, _headers, {
                12: { sorter:'digit' }
            });
        }

        beScript.Util.makeTableSortable( "roster", playersTable, _headers, [3, 0] );
        beScript.roster.makeC11Links();
    }
};

beScript.ratings = {
    highlightMyTeam : function() {
        var table = $( ".center-table-1" );
        $.scrollTo(table);
        
        var myId = beScript.Util.checkByRegExp( $( ".autoten > b > a" ).attr( "href" ), /(\d+)/ )[1];
        $("a[href*='" + myId + "']", $(".maintable")).parent().parent().animate({
            backgroundColor: "#abcdef"
        }, 1500 );
    },
    process : function() {
        beScript.ratings.highlightMyTeam();
    }
};

beScript.school = {
    process : function() {
        if ( beScript.Util.checkLocation( "roster" ) && !beScript.Util.checkLocation( "act=getplayer" ) ) {
            var playersTable = $($(".maintable")[2]);
            var _headers = { 
                3: { sorter:'beScript.sorter.positions' },
            };
            
            if ( beScript.Util.checkLocation( "roster" ) && beScript.Util.checkLocation( "act=finance" ) ) {
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
            
            beScript.Util.makeTableSortable( "school", playersTable, _headers, [3, 0] );
        }
    }
};

beScript.train = {
    process : function() {
//        if ( beScript.Util.checkLocation( "act=report" ) ) {
            var trainTable = $(".maintable");
            var _headers = {};
            var hasBottomRow = true;
            var sort = [0, 1];
            
            if ( beScript.Util.checkLocation( "act=history" ) ) {
                hasBottomRow = false;
            } else if ( !beScript.Util.checkLocation( "act" ) ) {
                sort = [3, 0];
                $.extend( true, _headers, { 
                    3: { sorter:'beScript.sorter.positions' },
                    7: { sorter:false },
                });
            } else {
                sort = [3, 0];
                $.extend( true, _headers, { 
                    3: { sorter:'beScript.sorter.positions' },
                });
            }

            trainTable.each( function(i) {
                beScript.Util.makeTableSortable( "train", $(this), _headers, sort, hasBottomRow, i );
            });
//        }
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

(function(d){var k=d.scrollTo=function(a,i,e){d(window).scrollTo(a,i,e)};k.defaults={axis:'xy',duration:parseFloat(d.fn.jquery)>=1.3?0:1};k.window=function(a){return d(window)._scrollable()};d.fn._scrollable=function(){return this.map(function(){var a=this,i=!a.nodeName||d.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!i)return a;var e=(a.contentWindow||a).document||a.ownerDocument||a;return d.browser.safari||e.compatMode=='BackCompat'?e.body:e.documentElement})};d.fn.scrollTo=function(n,j,b){if(typeof j=='object'){b=j;j=0}if(typeof b=='function')b={onAfter:b};if(n=='max')n=9e9;b=d.extend({},k.defaults,b);j=j||b.speed||b.duration;b.queue=b.queue&&b.axis.length>1;if(b.queue)j/=2;b.offset=p(b.offset);b.over=p(b.over);return this._scrollable().each(function(){var q=this,r=d(q),f=n,s,g={},u=r.is('html,body');switch(typeof f){case'number':case'string':if(/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(f)){f=p(f);break}f=d(f,this);case'object':if(f.is||f.style)s=(f=d(f)).offset()}d.each(b.axis.split(''),function(a,i){var e=i=='x'?'Left':'Top',h=e.toLowerCase(),c='scroll'+e,l=q[c],m=k.max(q,i);if(s){g[c]=s[h]+(u?0:l-r.offset()[h]);if(b.margin){g[c]-=parseInt(f.css('margin'+e))||0;g[c]-=parseInt(f.css('border'+e+'Width'))||0}g[c]+=b.offset[h]||0;if(b.over[h])g[c]+=f[i=='x'?'width':'height']()*b.over[h]}else{var o=f[h];g[c]=o.slice&&o.slice(-1)=='%'?parseFloat(o)/100*m:o}if(/^\d+$/.test(g[c]))g[c]=g[c]<=0?0:Math.min(g[c],m);if(!a&&b.queue){if(l!=g[c])t(b.onAfterFirst);delete g[c]}});t(b.onAfter);function t(a){r.animate(g,j,b.easing,a&&function(){a.call(this,n,b)})}}).end()};k.max=function(a,i){var e=i=='x'?'Width':'Height',h='scroll'+e;if(!d(a).is('html,body'))return a[h]-d(a)[e.toLowerCase()]();var c='client'+e,l=a.ownerDocument.documentElement,m=a.ownerDocument.body;return Math.max(l[h],m[h])-Math.min(l[c],m[c])};function p(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);

(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.curCSS(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

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
