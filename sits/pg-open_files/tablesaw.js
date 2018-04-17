//NOTE: This file has been amended by Tribal for use within e:Vision
//See "Tribal modification" comments for changes

/*! Tablesaw - v1.0.5 - 2015-02-19
* https://github.com/filamentgroup/tablesaw
* Copyright (c) 2015 Filament Group; Licensed MIT */
;(function( $ ) {
	var div = document.createElement('div'),
		all = div.getElementsByTagName('i'),
		$doc = $( document.documentElement );

	div.innerHTML = '<!--[if lte IE 8]><i></i><![endif]-->';
	if( all[ 0 ] ) {
		$doc.addClass( 'ie-lte8' );
	}

	// Cut the mustard
	if( !( 'querySelector' in document ) ||
			( window.blackberry && !window.WebKitPoint ) ||
			window.operamini ) {
		return;
	} else {
		$doc.addClass( 'tablesaw-enhanced' );

		// DOM-ready auto-init of plugins.
		// Many plugins bind to an "enhance" event to init themselves on dom ready, or when new markup is inserted into the DOM

		/*Tribal modification - initialisation now happens within sits_ajax rather than automatically
		$( function(){
			$( document ).trigger( "enhance.tablesaw" );
		});
		*/
	}

})( jQuery );
/*
* tablesaw: A set of plugins for responsive tables
* Stack and Column Toggle tables
* Copyright (c) 2013 Filament Group, Inc.
* MIT License
*/

if( typeof Tablesaw === "undefined" ) {
	Tablesaw = {
		i18n: {
			modes: [ 'Stack', 'Swipe', 'Toggle' ],
			columns: 'Col<span class=\"a11y-sm\">umn</span>s',
			columnBtnText: 'Columns',
			columnsDialogError: 'No eligible columns.',
			sort: 'Sort',
			sortAscText: ': activate to sort column ascending',
			sortDescText: ': activate to sort column descending',
			prevBtnText: 'Previous Column', //Tribal modification - allow text to be amended on buttons for Swipe table
			nextBtnText: 'Next Column',
			prevBtnDisabledText: 'Previous column (disabled)',
			nextBtnDisabledText: 'Next column (disabled)'
		}
	};
}
if( !Tablesaw.config ) {
	Tablesaw.config = {};
}

;(function( $ ) {
	var pluginName = "table",
		classes = {
			toolbar: "tablesaw-bar"
		},
		events = {
			create: "tablesawcreate",
			destroy: "tablesawdestroy",
			refresh: "tablesawrefresh"
		},
		defaultMode = "stack",
		initSelector = "table[data-tablesaw-mode],table[data-tablesaw-sortable]";

	var Table = function( element ) {
		if( !element ) {
			throw new Error( "Tablesaw requires an element." );
		}

		this.table = element;
		this.$table = $( element );

		this.mode = this.$table.attr( "data-tablesaw-mode" ) || defaultMode;

		this.init();
	};

	Table.prototype.init = function() {
		// assign an id if there is none
		if ( !this.$table.attr( "id" ) ) {
			this.$table.attr( "id", pluginName + "-" + Math.round( Math.random() * 10000 ) );
		}

		this.createToolbar();

		var colstart = this._initCells();

		this.$table.trigger( events.create, [ this, colstart ] );
	};

	Table.prototype._initCells = function() {
		var colstart,
			thrs = this.table.querySelectorAll( "thead tr" ),
			self = this;

		$( thrs ).each( function(){
			var coltally = 0;

			$( this ).children().each( function(){
				var span = parseInt( this.getAttribute( "colspan" ), 10 ),
					sel = ":nth-child(" + ( coltally + 1 ) + ")";

				colstart = coltally + 1;

				if( span ){
					for( var k = 0; k < span - 1; k++ ){
						coltally++;
						sel += ", :nth-child(" + ( coltally + 1 ) + ")";
					}
				}

				// Store "cells" data on header as a reference to all cells in the same column as this TH
				this.cells = self.$table.find("tr").not( $( thrs ).eq( 0 ) ).not( this ).children( sel );
				coltally++;
			});
		});

		return colstart;
	};

	Table.prototype.refresh = function() {
		this._initCells();

		this.$table.trigger( events.refresh );
	};

	Table.prototype.createToolbar = function() {
		// Insert the toolbar
		var $toolbar = this.$table.prev( '.' + classes.toolbar );
		if( !$toolbar.length ) {
			$toolbar = $( '<div>' )
				.addClass( classes.toolbar )
				.insertBefore( this.$table );
		}
		this.$toolbar = $toolbar;

		if( this.mode ) {
			this.$toolbar.addClass( 'mode-' + this.mode );
		}
	};

	//Tribal modification - added function to allow us to get a list of visible non-persistent columns (to reset them when refreshing the page)
	//Returns an array of row indexes (0-indexed)
	Table.prototype.tribalGetVisible = function() {
		//only applies to swipe and column tables, not to stack
		if(this.mode==="stack") return [];

		//find the header row as we use that to determine which columns are visible
		var visibleRows = [],
		mode = this.mode;

		//find the indexes of any non-persistent visible columns
		this.$table.find("thead tr:first th").each(function(index) {
			var th = $(this);
			if(!th.hasClass("tablesaw-cell-hidden")&&((mode==="swipe"&&!th.hasClass("tablesaw-cell-persist"))||(mode!=="swipe"&&th.data("tablesaw-priority")!=="persist"))){ //if th is showing but isn't persistent
				//in column toggle mode we also need to make a check to see the current breakpoint hasn't caused the cell to be hidden automatically
				if(mode==="swipe"||th.css( "display" )==="table-cell") {
					visibleRows.push(index);
				}
			}
		});

		return visibleRows;
	}

	//Tribal modification - added function to allow us to set an initial list of visible non-persistent columns (to reset them when refreshing a page for example)
	//Not intended for use long after the table has been initialised. visibleRows is an array of th indexes
	Table.prototype.tribalSetVisible = function(visibleRows) {
		//only applies to swipe and column tables, not to stack
		if(this.mode==="stack") return;

		//array must be passed in containing the indexes
		if(typeof visibleRows!=="object"||visibleRows.length===0) return;

		//in column toggle mode we can set multiple columns, but in swipe we just set the initial default column (i.e. the first non-persistant
		if(this.mode==="swipe") {
			var defaultIndex = parseInt(visibleRows[0],10);
			if(typeof defaultIndex!=="number"||defaultIndex < 0){
				return; //default index is an invalid value, so we don't set/update anything
			}

			//set the data-tablesaw-default-col attribute on the relevant th
			this.$table.find("thead tr:first th").each(function(index){
				if(index===defaultIndex){
					$(this).attr("data-tablesaw-default-col","true");
					return false; //stop looping
				}
			});
		}
		else {
			//loop through the th's and for any that are not persistant we need to find the matching column toggle (in the dropdown)
			//so we can find the cells that we need to switch the class on (to either showing or hiding)
			var nonPersistColCount = -1,
			$popup = $("#"+this.$table.attr( "id" )+"-popup"),
			$menu = $popup.find(".btn-group");

			this.$table.find("thead tr:first th").each(function(index){
				var $this = $(this),
				priority = $this.attr("data-tablesaw-priority");

				if( priority && priority !== "persist" ) { //will have a column toggle, so go and find it
					nonPersistColCount++; //track how many columns we have found that have toggles so far

					var colToggle = $menu.find("input").eq(nonPersistColCount),
					showColumn;
					if(colToggle) {
						if($.inArray(index,visibleRows)!==-1){ //is a column we want to be visible
							showColumn = true;
						}
						else{ //is a column we want to be hidden
							showColumn = false;
						}

						//show or hide the column as needed
						colToggle.data( "cells" )
							.toggleClass( "tablesaw-cell-hidden", !showColumn )
							.toggleClass( "tablesaw-cell-visible", showColumn );
					}
				}
			});
		}

		//re-set the display
		this.tribalReset();
	}

	//Tribal modification - added function to allow use to reset the display (e.g. reset back to the initial columns in the case of swipe - ignoring any default cols or user changes)
	Table.prototype.tribalReset = function() {
		//not available in Stack mode
		if(this.mode==="stack") return;

		//re-trigger the display calculations
		this.$table.trigger("tablesawresetdisplay");
	}


	Table.prototype.destroy = function() {
		// Don’t remove the toolbar. Some of the table features are not yet destroy-friendly.
		this.$table.prev( '.' + classes.toolbar ).each(function() {
			this.className = this.className.replace( /\bmode\-\w*\b/gi, '' );
		});

		var tableId = this.$table.attr( 'id' );
		$( document ).unbind( "." + tableId );
		$( window ).unbind( "." + tableId );

		// other plugins
		this.$table.trigger( events.destroy, [ this ] );

		//Tribal modification - leave tablesaw-mode in case we re-initialise later //this.$table.removeAttr( 'data-tablesaw-mode' );

		this.$table.removeData( pluginName );
	};

	// Collection method.
	$.fn[ pluginName ] = function() {
		return this.each( function() {
			var $t = $( this );

			if( $t.data( pluginName ) ){
				return;
			}

			var table = new Table( this );
			$t.data( pluginName, table );
		});
	};

	$( document ).on( "enhance.tablesaw", function( e ) {
		$( e.target ).find( initSelector )[ pluginName ]();
	});

}( jQuery ));

;(function( win, $, undefined ){

	var classes = {
		stackTable: 'tablesaw tablesaw-stack', //Tribal modification - add tablesaw class as well
		cellLabels: 'tablesaw-cell-label',
		cellContentLabels: 'tablesaw-cell-content'
	};

	var data = {
		obj: 'tablesaw-stack'
	};

	var attrs = {
		labelless: 'data-tablesaw-no-labels',
		hideempty: 'data-tablesaw-hide-empty'
	};

	var Stack = function( element ) {

		this.$table = $( element );

		this.labelless = this.$table.is( '[' + attrs.labelless + ']' );
		this.hideempty = this.$table.is( '[' + attrs.hideempty + ']' );

		if( !this.labelless ) {
			// allHeaders references headers, plus all THs in the thead, which may include several rows, or not
			this.allHeaders = this.$table.find( "th" );
		}

		this.$table.data( data.obj, this );
	};

	Stack.prototype.init = function( colstart ) {
		this.$table.addClass( classes.stackTable );

		if( this.labelless ) {
			return;
		}

		// get headers in reverse order so that top-level headers are appended last
		var reverseHeaders = $( this.allHeaders );
		var hideempty = this.hideempty;

		// create the hide/show toggles
		for(var k=reverseHeaders.length;k>=0;k--){ //Tribal modification - reverse order so we create top-level headers last (as the comment above implied the code did previously)
			reverseHeaders.eq(k).each(function(){
				var $t = $( this ),
					$cells = $( this.cells ).filter(function() {
						return !$( this ).parent().is( "[" + attrs.labelless + "]" ) && ( !hideempty || !$( this ).is( ":empty" ) );
					}),
					hierarchyClass = $cells.not( this ).filter( "thead th" ).length && " tablesaw-cell-label-top",
					$sortableButton = $t.find( ".tablesaw-sortable-btn" ),
					html = $sortableButton.length ? $sortableButton.html() : $t.html(),
					htmlFragment;

				if( html !== "" ){
					//Tribal modification - if we have inputs in the table headers (e.g. hidden inputs) then strip them out to prevent form submission problems
					if(html.indexOf("<input ")>-1){
						htmlFragment = $("<span>").append(html);

						htmlFragment.find("input").each(function(){
							var thisInput = $(this);

							//if input is hidden then we remove it
							if(thisInput.is("input[type='hidden']")){
								thisInput.remove();
							}
							else{
								//otherwise remove the name (so it isn't submitted back to the server)
								thisInput.removeAttr("name");
							}
						})

						//convert fragment back to HTML
						html = htmlFragment.html();
					}

					if( hierarchyClass ){
						var iteration = parseInt( $( this ).attr( "colspan" ), 10 ),
							filter = "",
							$filteredCells;

						if( iteration && iteration > 1 ){
							//Tribal modification - adjust filter to correct issue with colspan processing on our tables
							$filteredCells = $cells.filter(function(i){
								return (i % iteration == 0)?true:false; //if it's the "iteration"-th item then it's the one we need
							});
						}	else{
							$filteredCells = $cells;
						}

						$filteredCells.prepend( "<b class='" + classes.cellLabels + hierarchyClass + "'>" + html + "</b>"  );
					} else {
						$cells.wrapInner( "<span class='" + classes.cellContentLabels + "'></span>" );
						$cells.prepend( "<b class='" + classes.cellLabels + "'>" + html + "</b>"  );
					}
				}
			});
		}
	};

	Stack.prototype.destroy = function() {
		this.$table.removeClass( classes.stackTable );
		this.$table.find( '.' + classes.cellLabels ).remove();
		this.$table.find( '.' + classes.cellContentLabels ).each(function() {
			$( this ).replaceWith( this.childNodes );
		});
	};

	// on tablecreate, init
	$( document ).on( "tablesawcreate", function( e, Tablesaw, colstart ){
		if( Tablesaw.mode === 'stack' ){
			var table = new Stack( Tablesaw.table );
			table.init( colstart );
		}

	} );

	$( document ).on( "tablesawdestroy", function( e, Tablesaw ){
		if( Tablesaw.mode === 'stack' ){
			$( Tablesaw.table ).data( data.obj ).destroy();
		}

	} );

}( this, jQuery ));
;(function( $ ) {
	var pluginName = "tablesawbtn",
		initSelector = ".btn",
		methods = {
			_create: function(){
				return $( this ).each(function() {
					$( this )
						.trigger( "beforecreate." + pluginName )
						[ pluginName ]( "_init" )
						.trigger( "create." + pluginName );
				});
			},
			_init: function(){
				var oEl = $( this ),
					sel = this.getElementsByTagName( "select" )[ 0 ];

				if( sel ) {
					$( this )
						.addClass( "btn-select" )
						[ pluginName ]( "_select", sel );
				}
				return oEl;
			},
			_select: function( sel ) {
				var update = function( oEl, sel ) {
					var opts = $( sel ).find( "option" ),
						label, el, children;

					opts.each(function() {
						var opt = this;
						if( opt.selected ) {
							label = document.createTextNode( opt.text );
						}
					});

					children = oEl.childNodes;
					if( opts.length > 0 ){
						for( var i = 0, l = children.length; i < l; i++ ) {
							el = children[ i ];

							if( el && el.nodeType === 3 ) {
								oEl.replaceChild( label, el );
							}
						}
					}
				};

				update( this, sel );
				$( this ).bind( "change refresh", function() {
					update( this, sel );
				});
			}
		};

	// Collection method.
	$.fn[ pluginName ] = function( arrg, a, b, c ) {
		return this.each(function() {

		// if it's a method
		if( arrg && typeof( arrg ) === "string" ){
			return $.fn[ pluginName ].prototype[ arrg ].call( this, a, b, c );
		}

		// don't re-init
		if( $( this ).data( pluginName + "active" ) ){
			return $( this );
		}

		// otherwise, init

		$( this ).data( pluginName + "active", true );
			$.fn[ pluginName ].prototype._create.call( this );
		});
	};

	// add methods
	$.extend( $.fn[ pluginName ].prototype, methods );

	$( document ).on( "enhance", function( e ) {
		$( initSelector, e.target )[ pluginName ]();
	});

}( jQuery ));
;(function( win, $, undefined ){

	var ColumnToggle = function( element ) {

		this.$table = $( element );

		this.classes = {
			columnToggleTable: 'tablesaw tablesaw-columntoggle', //Tribal modification - add tablesaw class as well
			columnBtnContain: 'tablesaw-columntoggle-btnwrap tablesaw-advance',
			columnBtn: 'tablesaw-columntoggle-btn tablesaw-nav-btn down',
			popup: 'tablesaw-columntoggle-popup',
			priorityPrefix: 'tablesaw-priority-',
			toolbar: 'tablesaw-bar'
		};

		// Expose headers and allHeaders properties on the widget
		// headers references the THs within the first TR in the table
		this.headers = this.$table.find( 'tr:first > th' );

		this.$table.data( 'tablesaw-coltoggle', this );
	};

	ColumnToggle.prototype.init = function() {

		var tableId,
			id,
			$menuButton,
			$popup,
			$menu,
			$btnContain,
			self = this;

		this.$table.addClass( this.classes.columnToggleTable );

		tableId = this.$table.attr( "id" );
		id = tableId + "-popup";
		$btnContain = $( "<div class='" + this.classes.columnBtnContain + "'></div>" );
		$menuButton = $( "<a href='#" + id + "' class='btn btn-micro " + this.classes.columnBtn +"' data-popup-link>" +
										"<span>" + Tablesaw.i18n.columnBtnText + "</span></a>" );
		$popup = $( "<div class='dialog-table-coltoggle " + this.classes.popup + "' id='" + id + "'></div>" );
		$menu = $( "<div class='btn-group'></div>" );

		var hasNonPersistentHeaders = false;
		$( this.headers ).not( "td" ).each( function() {
			var $this = $( this ),
				priority = $this.attr("data-tablesaw-priority"),
				$cells = $this.add( this.cells );

			if( priority && priority !== "persist" ) {
				$cells.addClass( self.classes.priorityPrefix + priority );

				$("<label><input type='checkbox' checked>" + $this.text() + "</label>" )
					.appendTo( $menu )
					.children( 0 )
					.data( "cells", $cells );

				hasNonPersistentHeaders = true;
			}
		});

		if( !hasNonPersistentHeaders ) {
			$menu.append( '<label>' + Tablesaw.i18n.columnsDialogError + '</label>' );
		}

		$menu.appendTo( $popup );

		// bind change event listeners to inputs
		$menu.find( 'input[type="checkbox"]' ).on( "change", function(e) {
			var checked = e.target.checked;

			$( e.target ).data( "cells" )
				.toggleClass( "tablesaw-cell-hidden", !checked )
				.toggleClass( "tablesaw-cell-visible", checked );

			self.$table.trigger( 'tablesawcolumns' );
			self.$table.trigger( 'tablesawcolchange' ); //Tribal modification - generate event only when column changes due to user interaction
		});

		$menuButton.appendTo( $btnContain );
		$btnContain.appendTo( this.$table.prev( '.' + this.classes.toolbar ) );

		var closeTimeout;
		function openPopup() {
			$btnContain.addClass( 'visible' );
			$menuButton.removeClass( 'down' ).addClass( 'up' );

			$( document ).unbind( 'click.' + tableId, closePopup );

			window.clearTimeout( closeTimeout );
			closeTimeout = window.setTimeout(function() {
				$( document ).one( 'click.' + tableId, closePopup );
			}, 15 );
		}

		function closePopup( event ) {
			// Click came from inside the popup, ignore.
			if( event && $( event.target ).closest( "." + self.classes.popup ).length ) {
				return;
			}

			$( document ).unbind( 'click.' + tableId );
			$menuButton.removeClass( 'up' ).addClass( 'down' );
			$btnContain.removeClass( 'visible' );
		}

		$menuButton.on( "click.tablesaw", function( event ) {
			event.preventDefault();

			if( !$btnContain.is( ".visible" ) ) {
				openPopup();
			} else {
				closePopup();
			}
		});

		$popup.appendTo( $btnContain );

		this.$menu = $menu;

		//Tribal modification - bind events required to reset the display or set the display (for our additional functions)
		this.$table.bind( "tablesawresetdisplay.columntoggle", function(){
			//update the column toggle dropdown based on which columns are currently visible
			self.refreshToggle();
		});

		$(window).on( "resize." + tableId, function(){
			self.refreshToggle();
		});

		this.refreshToggle();
	};

	ColumnToggle.prototype.refreshToggle = function() {
		this.$menu.find( "input" ).each( function() {
			var $this = $( this );

			this.checked = $this.data( "cells" ).eq( 0 ).css( "display" ) === "table-cell";
		});
	};

	ColumnToggle.prototype.refreshPriority = function(){
		var self = this;
		$(this.headers).not( "td" ).each( function() {
			var $this = $( this ),
				priority = $this.attr("data-tablesaw-priority"),
				$cells = $this.add( this.cells );

			if( priority && priority !== "persist" ) {
				$cells.addClass( self.classes.priorityPrefix + priority );
			}
		});
	};

	ColumnToggle.prototype.destroy = function() {
		// table toolbars, document and window .tableId events
		// removed in parent tables.js destroy method

		this.$table.removeClass( this.classes.columnToggleTable );
		this.$table.unbind(".columntoggle"); //Tribal modification - remove Tribal-added events
		this.$table.find( 'th, td' ).each(function() {
			var $cell = $( this );
			$cell.removeClass( 'tablesaw-cell-hidden' )
				.removeClass( 'tablesaw-cell-visible' );

			this.className = this.className.replace( /\bui\-table\-priority\-\d\b/g, '' );
		});
	};

	// on tablecreate, init
	$( document ).on( "tablesawcreate", function( e, Tablesaw ){

		if( Tablesaw.mode === 'columntoggle' ){
			var table = new ColumnToggle( Tablesaw.table );
			table.init();
		}

	} );

	$( document ).on( "tablesawdestroy", function( e, Tablesaw ){
		if( Tablesaw.mode === 'columntoggle' ){
			$( Tablesaw.table ).data( 'tablesaw-coltoggle' ).destroy();
		}
	} );

}( this, jQuery ));
;(function( win, $, undefined ){

	$.extend( Tablesaw.config, {
		swipe: {
			horizontalThreshold: 30, //Tribal modification - amended default thresholds to try and prevent some accidental swipes (was 15 and 30)
			verticalThreshold: 30
		}
	});

	function createSwipeTable( $table ){
		var $btns = $( "<div class='tablesaw-advance'></div>" ),
			$prevBtn = $( "<a href='#' class='tablesaw-nav-btn btn btn-micro left' title='"+Tablesaw.i18n.prevBtnText+"'></a>" ).appendTo( $btns ), //Tribal modification
			$nextBtn = $( "<a href='#' class='tablesaw-nav-btn btn btn-micro right' title='"+Tablesaw.i18n.nextBtnText+"'></a>" ).appendTo( $btns ),
			hideBtn = 'disabled',
			persistWidths = 'tablesaw-fix-persist',
			$headerCells = $table.find( "thead tr:first th" ), //Tribal modification - only pick up from first tr (to avoid issues with colspan and rowspan)
			$headerCellsNoPersist = $headerCells.not( '[data-tablesaw-priority="persist"]' ),
			headerWidths = [],
			compactWidths = [], //Tribal modification
			$head = $( document.head || 'head' ),
			tableId = $table.attr( 'id' ),
			isIE8 = $( 'html' ).is( '.ie-lte8' ),
			isSafari = (navigator.userAgent.indexOf("Safari")>-1)?true:false, //Tribal modification - issue with table width calculation on IOS means we need to browser sniff (at least temporarily)
			useCompactFit = ($table.attr("data-tablesaw-compact-fit")==="Y")?true:false, //Tribal modification - try and fit more columns on screen (by force wrapping text if needed)
			useMaintainWidths = ($table.attr("data-tablesaw-maintain-widths")!=="N")?true:false, //Tribal modification - include data attribute to disable "maintain widths" if they cause problems with any tables
			useExtraPadding = (!useMaintainWidths && $table.attr("data-tablesaw-extra-padding")==="Y")?true:false, //Tribal modification - allow extra padding in calculations (when "maintain widths" is disabled) to give leeway when you have a lot of fixed width content
			useCheckWidths = (!useMaintainWidths && $table.attr("data-tablesaw-check-widths")==="Y")?true:false, //Tribal modification - do we need to check and see if the table fits after swiping (and remove further columns if not)?
			checkWidthsHidden = 0, //Tribal modification - keep track of how many additional columns have been hidden because of the tablesaw-check-widths option
			useSwipeBlur = ($table.attr("data-tablesaw-swipe-blur")!=="N")?true:false; //Tribal modification - allow automatic unfocussing of fields when swiping to be disabled

		if( !$headerCells.length ) {
			throw new Error( "tablesaw swipe: no header cells found. Are you using <th> inside of <thead>?" );
		}

		// Calculate initial widths
		$table.css( 'width', 'auto' );

		$headerCells.each(function() {
			headerWidths.push( $( this ).outerWidth() );
		});

		//Tribal modification - if using compact fit mode then try and determine how small each column could be (rather than should be) and use that
		if( useCompactFit ) {
			//set the widths to be a cursory small value - to try and force maximum permissable wrapping
			$headerCells.css( 'width', '10px' );

			//calculate the widths of each column and, if smaller than the auto-calculated value for that column, use it as the calculated width
			$headerCells.each(function() {
				compactWidths.push( $( this ).outerWidth() );
			});

			//reset the widths back to "normal"
			$headerCells.css( 'width', '' );

			//compare the compact width with the auto width and use the lower of the two values
			for( var i = 0; i < headerWidths.length; i++ ) {
				if( compactWidths[i] < headerWidths[i] ) {
					headerWidths[i] = compactWidths[i];
				}
			}
		}

		$table.css( 'width', '' );

		$btns.appendTo( $table.prev( '.tablesaw-bar' ) );

		$table.addClass( "tablesaw tablesaw-swipe" ); //Tribal modification - add tablesaw class as well

		if( !tableId ) {
			tableId = 'tableswipe-' + Math.round( Math.random() * 10000 );
			$table.attr( 'id', tableId );
		}

		function $getCells( headerCell ) {
			return $( headerCell.cells ).add( headerCell );
		}

		function showColumn( headerCell ) {
			$getCells( headerCell ).removeClass( 'tablesaw-cell-hidden' );
		}

		function hideColumn( headerCell ) {
			$getCells( headerCell ).addClass( 'tablesaw-cell-hidden' );
		}

		function persistColumn( headerCell ) {
			$getCells( headerCell ).addClass( 'tablesaw-cell-persist' );
		}

		function isPersistent( headerCell ) {
			return $( headerCell ).is( '[data-tablesaw-priority="persist"]' );
		}

		function unmaintainWidths() {
			$table.removeClass( persistWidths );
			$( '#' + tableId + '-persist' ).remove();
		}

		function maintainWidths() {
			var prefix = '#' + tableId + '.tablesaw-swipe ',
				styles = [],
				tableWidth = $table.width(),
				hash = [],
				newHash;

			$headerCells.each(function( index ) {
				var width;
				if( isPersistent( this ) ) {
					width = $( this ).outerWidth();

					// Only save width on non-greedy columns (take up less than 75% of table width)
					if( width < tableWidth * 0.75 ) {
						hash.push( index + '-' + width );
						styles.push( prefix + ' .tablesaw-cell-persist:nth-child(' + ( index + 1 ) + ') { width: ' + width + 'px; }' );
					}
				}
			});
			newHash = hash.join( '_' );

			$table.addClass( persistWidths );

			var $style = $( '#' + tableId + '-persist' );
			// If style element not yet added OR if the widths have changed
			if( !$style.length || $style.data( 'hash' ) !== newHash ) {
				// Remove existing
				$style.remove();

				if( styles.length ) {
					$( '<style>' + styles.join( "\n" ) + '</style>' )
						.attr( 'id', tableId + '-persist' )
						.data( 'hash', newHash )
						.appendTo( $head );
				}
			}
		}

		function getNext(){
			var next = [],
				checkFound;

			$headerCellsNoPersist.each(function( i ) {
				var $t = $( this ),
					isHidden = $t.css( "display" ) === "none" || $t.is( ".tablesaw-cell-hidden" );

				if( !isHidden && !checkFound ) {
					checkFound = true;
					next[ 0 ] = i;
				} else if( isHidden && checkFound ) {
					next[ 1 ] = i;

					return false;
				}
			});

			return next;
		}

		function getPrev(){
			var next = getNext();
			return [ next[ 1 ] - 1 , next[ 0 ] - 1 ];
		}

		function nextpair( fwd ){
			return fwd ? getNext() : getPrev();
		}

		function canAdvance( pair ){
			return pair[ 1 ] > -1 && pair[ 1 ] < $headerCellsNoPersist.length;
		}

		function matchesMedia() {
			var matchMedia = $table.attr( "data-tablesaw-swipe-media" );
			return !matchMedia || ( "matchMedia" in win ) && win.matchMedia( matchMedia ).matches;
		}

		function fakeBreakpoints() {
			if( !matchesMedia() ) {
				return;
			}

			var extraPaddingPixels = (useExtraPadding)?30:20, //Tribal modification - if not maintaining widths then calculations may need more padding (so advancing is less likely to flow columns outside of the container border at certain widths)
				containerWidth = $table.parent().width(),
				persist = [],
				sum = 0,
				sums = [],
				persistSum = 0, //Tribal modification - sum the persistant column widths
				visibleNonPersistantCount = $headerCells.length,
				defaultIndex = -1,
				showingAll = true; //Tribal modification - track whether we have a "default" column or not (only used during initialisation) and whether we're showing all columns'

			//Tribal modification - determine the width of all persistant columns first, so we can determine how much space is left for others
			$headerCells.each(function( index ) {
				var $t = $( this ),
					isPersist = $t.is( '[data-tablesaw-priority="persist"]' ),
					isDefault = $t.is( '[data-tablesaw-default-col]' ); //Tribal modification - this is the default/first non-persistent column to show

				persist.push( isPersist );

				if( isPersist ) { //add up the column widths for persistent columns
					persistSum += headerWidths[ index ];
				}
				else{
					if ( isDefault ) {
						defaultIndex = index; //Tribal modification - keep track of first default column (the one we want to focus on)

						//remove the attribute so it doesn't interfere with future calculations
						$t.removeAttr("data-tablesaw-default-col");
					}
				}
			});

			sum = persistSum; //Tribal modification - include persistent columns in the total from the start

			$headerCells.each(function( index ) {
				var $t = $( this ),
					isPersist = persist[ index ];

				//Tribal modification - if we're setting a default columns display then we ignore all columns prior to it (so our calculation doesn't include a column we'll be hiding)
				if( defaultIndex == -1 || index >= defaultIndex ){
					sum += (isPersist)?0:(headerWidths[ index ] + extraPaddingPixels); //add column width (unless it's persistent as it's already in there)
				}

				sums.push( sum );

				// is persistent or is hidden
				if( isPersist || sum > containerWidth ) {
					visibleNonPersistantCount--;
				}
			});

			var needsNonPersistentColumn = visibleNonPersistantCount === 0;

			$headerCells.each(function( index ) {
				if( persist[ index ] ) {

					// for visual box-shadow
					persistColumn( this );
					return;
				}

				if ( index >= defaultIndex && ( sums[ index ] <= containerWidth || needsNonPersistentColumn ) ) { //Tribal modification - don't show non-persistant columns before the default/initial column
					needsNonPersistentColumn = false;
					showColumn( this );
				} else {
					hideColumn( this );
					showingAll = false; //Tribal modification - we're hiding at least one column'
				}
			});

			//Tribal modification - show navigation only when a column is hidden
			if(showingAll) {
				$table.prev( '.tablesaw-bar' ).hide();
			}
			else {
				$table.prev( '.tablesaw-bar' ).show();
			}

			//Tribal modification - reset the count of additional columns hidden (when tablesaw-check-widths is set)
			checkWidthsHidden = 0;

			if( !isIE8 && useMaintainWidths ) { //Tribal modification
				unmaintainWidths();
			}
			$table.trigger( 'tablesawcolumns' );
		}

		function resizeCheckFakeBreakpoints(){ //Tribal modification - only run FakeBreakpoints on resize if the window has actually resized horizontally (to workaround IOS bug)
			var oldWidth = $table.data("oldFbWidth"),
				newWidth,
				$window = $(window),
				requireResize = true;

			if(typeof oldWidth !== "undefined"){
				//compare old width to new width
				newWidth = $window.width();
				if ( newWidth == oldWidth){
					requireResize = false;
				}
			} else{
				newWidth = $window.width();
			}

			//fire fakeBreakpoints if the screensize has changed
			if( requireResize ){
				//update the values to use in the next check
				$table.data("oldFbWidth",newWidth);

				//trigger required function
				fakeBreakpoints();
			}
		}

		function advance( fwd ){
			var pair = nextpair( fwd );
			if( canAdvance( pair ) ){
				if( isNaN( pair[ 0 ] ) ){
					if( fwd ){
						pair[0] = 0;
					}
					else {
						pair[0] = $headerCellsNoPersist.length - 1;
					}
				}

				if( !isIE8 && useMaintainWidths ) { //Tribal modification
					maintainWidths();
				}

				hideColumn( $headerCellsNoPersist.get( pair[ 0 ] ) );
				showColumn( $headerCellsNoPersist.get( pair[ 1 ] ) );

				if( useCheckWidths ) { //Tribal modification - see if the table fits the space, and adjust if necessary
					checkWidths( fwd, pair );
				}

				$table.trigger( 'tablesawcolumns' );
				$table.trigger( 'tablesawcolchange' ); //Tribal modification - generate event only when column changes due to user interaction
			}
		}

		//Tribal modification - if table doesn't fit, try and hide columns until it does (only occurs when tablesaw-check-widths options is set on the table)
		function checkWidths( fwd, lastPair ){
			var parentEl = $table.parent(),
				parentWidth = parentEl.width(),
				tableWidth,
				fits = false,
				nextHidden = lastPair[ 0 ],
				nextShown = lastPair[ 1 ];

			if( checkWidthsHidden > 0 ) { //if we've automatically hidden additional columns before (due to lack of space) then see if we can restore them
				fits = true;
				while( fits  && checkWidthsHidden > 0 ){
					//check width of table and see if it fits in the parent element
					tableWidth = getTableWidth();
					if( tableWidth <= parentWidth ){ //table is not already overflowing
						//see if there is another columns available to show (from right if swiping right, or left if swiping left)
						nextShown = ( fwd )?nextShown + 1:nextShown - 1;
						if( nextShown > -1 && nextShown < $headerCellsNoPersist.length ){ //OK to show
							showColumn( $headerCellsNoPersist.get( nextShown ) );

							//update count to say we've restored one of the auto-hidden columns
							checkWidthsHidden--;
              // check if it still fits
              if ( checkWidthsHidden == 0 && getTableWidth() > parentWidth  ){
                fits = false;
              }
						}
						else{
							fits = false; //nothing left to show
						}
					}
					else{
						fits = false; //no more space, so stop checking
					}
				}
			}

			//automatically hide columns if the table is too wide for the container
			while( !fits ) {
        //check width of table and see if it fits in the parent element
				tableWidth = getTableWidth();
        parentWidth = parentEl.width();

				if( tableWidth > (parentWidth + 1) ){ //table is larger than parent (includes 1px adjustment to avoid rounding issues)
					//see if there is anything we can hide (from the left if swiping right, and the right if swiping left)
					nextHidden = ( fwd )?nextHidden + 1:nextHidden - 1;
					if( nextHidden > -1 && nextHidden < $headerCellsNoPersist.length ){ //OK to hide
						hideColumn( $headerCellsNoPersist.get( nextHidden ) );
						//keep track of how many additional columns we've hidden, so we can try and reset things back if we swipe again
						checkWidthsHidden++;
					}
					else{ //run out of things to hide - have to show "as is"
						fits = true;
					}
				}
				else{
					//table fits, so nothing to adjust
					fits = true;
				}
			}
		}

		//Tribal modification - calculate the width of a table (taking any browser issues in to account)
		function getTableWidth(){
			//if we're not using Safari then we calculate normally
			if(!isSafari){
				return $table.width();
			}

			//otherwise we have to add the column widths of all THs in the first row (as Safari IOS 8+ seemingly allows them to overflow the container)
			var width = 0;

			$headerCells.each(function(){
				var $t = $( this ),
					isHidden = $t.css( "display" ) === "none" || $t.is( ".tablesaw-cell-hidden" );

				//if cell isn't hidden then we can count it
				if(!isHidden) width += $t.outerWidth(true);
			});

			return width;
		}

		$prevBtn.add( $nextBtn ).click(function( e ){
			advance( !!$( e.target ).closest( $nextBtn ).length );
			e.preventDefault();
		});

		function getCoord( event, key ) {
			return ( event.touches || event.originalEvent.touches )[ 0 ][ key ];
		}

		$table
			.bind( "touchstart.swipetoggle", function( e ){
				var originX = getCoord( e, 'pageX' ),
					originY = getCoord( e, 'pageY' ),
					x,
					y;

				$( win ).off( "resize", resizeCheckFakeBreakpoints ); //Tribal modification - was fakeBreakpoints

				$( this )
					.bind( "touchmove", function( e ){
						x = getCoord( e, 'pageX' );
						y = getCoord( e, 'pageY' );
						var cfg = Tablesaw.config.swipe;
						if( Math.abs( x - originX ) > cfg.horizontalThreshold && Math.abs( y - originY ) < cfg.verticalThreshold ) {
							e.preventDefault();
						}
					})
					.bind( "touchend.swipetoggle", function(){
						var cfg = Tablesaw.config.swipe,
							advanceMode,
							activeEl;

						if( Math.abs( y - originY ) < cfg.verticalThreshold ) {
							if( x - originX < -1 * cfg.horizontalThreshold ){
								advanceMode = true;
							}
							else if( x - originX > cfg.horizontalThreshold ){
								advanceMode = false;
							}
						}

						//Tribal modification - prevent scrolling as best we can during "advancing" to avoid auto-scolling in Safari from causing the screen to move
						if(typeof advanceMode!=="undefined"){
							//if the setting isn't disabled, we unfocus/blur the active element and then restore focus if it's still visible afterwards (if we can)
							if( useSwipeBlur && document.activeElement && $table.has(document.activeElement) ){
								//unfocus the current element
								activeEl = $(document.activeElement);
								activeEl.blur();

								//update the column display
								advance( advanceMode );

								//focus on the previous activeElement again (if it's still visible)
								if( activeEl.is(":visible") ){
									activeEl.focus();
								}
							}
							else{
								//only update the column display
								advance( advanceMode );
							}
						}

						window.setTimeout(function() {
							$( win ).on( "resize", resizeCheckFakeBreakpoints ); //Tribal modification - was fakeBreakpoints
						}, 300);
						$( this ).unbind( "touchmove touchend" );
					});

			})
			.bind( "tablesawcolumns.swipetoggle", function(){
				//Tribal modification - change title text depending on whether button is disabled or not (to aid accessibility)
				var caPrev = canAdvance( getPrev() ),
				caNext = canAdvance( getNext() );

				$prevBtn[ caPrev ? "removeClass" : "addClass" ]( hideBtn );
				$nextBtn[ caNext ? "removeClass" : "addClass" ]( hideBtn );

				$prevBtn.attr("title",((caPrev)?Tablesaw.i18n.prevBtnText:Tablesaw.i18n.prevBtnDisabledText));
				$nextBtn.attr("title",((caNext)?Tablesaw.i18n.nextBtnText:Tablesaw.i18n.nextBtnDisabledText));
			})
			.bind( "tablesawnext.swipetoggle", function(){
				advance( true );
			} )
			.bind( "tablesawprev.swipetoggle", function(){
				advance( false );
			} )
			.bind( "tablesawdestroy.swipetoggle", function(){
				var $t = $( this );

				$t.removeClass( 'tablesaw tablesaw-swipe' ); //Tribal modification - remove tablesaw class as well
				$t.prev( '.tablesaw-bar' ).find( '.tablesaw-advance' ).remove();
				$( win ).off( "resize", resizeCheckFakeBreakpoints ); //Tribal modification - was fakeBreakpoints

				$t.unbind( ".swipetoggle" );
			})
			.bind( "tablesawresetdisplay.swipetoggle", function(){ //Tribal modification - include event to allow breakpoints to be reset
				fakeBreakpoints();
			});

		fakeBreakpoints();
		$( win ).on( "resize", resizeCheckFakeBreakpoints ); //Tribal modification - was fakeBreakpoints
	}

	// on tablecreate, init
	$( document ).on( "tablesawcreate", function( e, Tablesaw ){

		if( Tablesaw.mode === 'swipe' ){
			createSwipeTable( Tablesaw.$table );
		}

	} );

}( this, jQuery ));

;(function( $ ) {
	function getSortValue( cell ) {
		return $.map( cell.childNodes, function( el ) {
				var $el = $( el );
				if( $el.is( 'input, select' ) ) {
					//Tribal modification - for non-editable field values, Uniface can include a hidden input with a duplicate value. Ignore this during sorting, or numberic/date sorting fails due to invalid values
					if( $el.attr("type") === "hidden" ){
						return;
					} else {
						return $el.val();
					}
				} else if( $el.hasClass( 'tablesaw-cell-label' ) ) {
					return;
				}
				return $.trim( $el.text() );
			}).join( '' );
	}

	function setSortAttributes( th, sort ){
		//Tribal modification - function to set/update required attributes for sorting (e.g. classes, aria, etc). Sort can be either "asc", "desc", or "" to reset
		var col = $(th),
				text = $.trim( col.text() ); //find the contents of the Th to use in the labelling (for screenreader users)

		//add the required attributes and classes based on sort mode
		switch(sort){
		case "asc": //using ascending sort order
			col.attr({
				"aria-sort": "ascending",
				"aria-label": "" + text + " " + Tablesaw.i18n.sortDescText
			});

			col.addClass( classes.ascend );
			col.removeClass( classes.descend );
			break;

		case "desc": //using descending sort order
			col.attr({
				"aria-sort": "descending",
				"aria-label": "" + text + " " + Tablesaw.i18n.sortAscText
			});

			col.removeClass( classes.ascend );
			col.addClass( classes.descend );
			break;

		default: //not sorting on this column
			if(col.is("th[data-tablesaw-sortable-col]")) {
				col.attr({
					"aria-label": "" + text + " " + Tablesaw.i18n.sortAscText
				});
				col.removeAttr("aria-sort");

				col.removeClass( classes.ascend );
				col.removeClass( classes.descend );
			}
			break;
		}
	}

	var pluginName = "tablesaw-sortable",
		initSelector = "table[data-" + pluginName + "]",
		sortableSwitchSelector = "[data-" + pluginName + "-switch]",
		attrs = {
			defaultCol: "data-tablesaw-sortable-default-col",
			defaultDesc: "data-tablesaw-sortable-default-desc", //Tribal modification - default order for column is descending (when used with defaultCol)
			initSort: "data-tablesaw-sortable-init-sort", //Tribal modification - sort table on initialisation
			colTotal: "data-tablesaw-sortable-col-total" //Tribal modification - total number of column headings
		},
		classes = {
			head: pluginName + "-head",
			ascend: pluginName + "-ascending",
			descend: pluginName + "-descending",
			switcher: pluginName + "-switch",
			tableToolbar: 'tablesaw-toolbar'
		},
		methods = {
			_create: function( o ){
				return $( this ).each(function() {
					var init = $( this ).data( "init" + pluginName );
					if( init ) {
						return false;
					}
					$( this )
						.data( "init"+ pluginName, true )
						.trigger( "beforecreate." + pluginName )
						[ pluginName ]( "_init" , o )
						.trigger( "create." + pluginName );
				});
			},
			_init: function(){
				var el = $( this ),
					heads;

				var addClassToTable = function(){
						el.addClass( pluginName );
					},
					addClassToHeads = function( h ){
						$.each( h , function( i , v ){
							$( v ).addClass( classes.head );
						});
					},
					makeHeadsActionable = function( h , fn ){
						$.each( h , function( i , v ){
							//Tribal modification - use Th rather than Button to activate sorting (to resolve Firefox focus accessibility issue)
							var $v = $(v);

							//add default attributes that are always needed and don't change during sorting
							$v.attr({
								"tabindex": 0,
								"aria-controls": el.attr("id")
							});

							//add function called when user activates column sorting
							$v.bind( "click.sortable" , { col: v } , function(e){
								$v.blur(); //lose outline for mouse users (consistent with Datatables)
								fn(e);
							} );
							$v.bind( "keypress.sortable" , { col: v }, function(e){ //allow keyboard activation of sorting by pressing enter
								if(e.which===13){
									e.preventDefault();
									fn(e);
								}
							})
						});

						//Tribal modification - attach the destroy function for sortable
						$(h).closest("table").bind( "tablesawdestroy.sortable", function(){
							var $t = $( this );

							//unbind the events and remove any associated classes on the THs
							$t.find("thead th").each(function(){
								var $th = $(this);

								$th.unbind(".sortable");

								$th.removeClass( classes.head );
								$th.removeClass( classes.ascend );
								$th.removeClass( classes.descend );

								$th.removeAttr("tabindex");
								$th.removeAttr("aria-controls");
								$th.removeAttr("aria-sort");
								$th.removeAttr("aria-label");
							})

							//clean up the table event and reset the initialised flag
							$t.unbind(".sortable").removeData( "init"+ pluginName );

							//remove "sort-init" attribute so we don't auto-sort again if we destroy and re-initialise (which would, for example, reset the order when switching mode)
							$t.removeAttr( attrs.initSort );
						} );
					},
					clearOthers = function( sibs ){
						$.each( sibs , function( i , v ){
							var col = $( v );
							col.removeAttr( attrs.defaultCol );
							col.removeAttr( attrs.defaultDesc ); //Tribal modification
							setSortAttributes( col, "" ); //Tribal modification
						});
					},
					headsOnAction = function( e ){
						if( $( e.target ).is( 'a[href]' ) ) {
							return;
						}

						e.stopPropagation();
						var head = $( e.target ).closest("th"),
							v = e.data.col;

						clearOthers( head.siblings() );
						if( head.hasClass( classes.ascend ) ){ //Tribal modification - sort ascending by default (matches Datatables)
							el[ pluginName ]( "sortBy" , v );
						} else {
							el[ pluginName ]( "sortBy" , v , true );
						}

						e.preventDefault();
					},
					handleDefault = function( heads ){
						var col,
							ascend = true;

						$.each( heads , function( idx , el ){
							var $el = $( el );
							if( $el.is( "[" + attrs.defaultCol + "]" ) ){
								if( $el.is( "[" + attrs.defaultDesc + "]" ) ){ //Tribal modification - if the default is descending
									ascend = false;
									setSortAttributes( $el, "desc" );
								}
								else {
									setSortAttributes( $el, "asc" ); //Tribal modification
								}

								col = el; //Tribal modification - keep reference to default column as we may need to trigger a sort
							}
							else {
								setSortAttributes( $el, "" ); //Tribal modification
							}
						});

						//Tribal modification - see if we need to sort the table during initialisation
						if( col ) {
							//Note: this "el" is the table element, not the same el (i.e. th) from the loop above
							if( el.is( "[" + attrs.initSort + "]" ) ) {
								el[ pluginName ]( "sortBy" , col , ascend );
							}
						}
					};

					addClassToTable();

					//Tribal modification - keep track of how many column headings there are so we can determine whether colspan might be in use for the data
					//Note: Sorting on column headings which are themselves part of a colspan is not supported.
					el.attr( attrs.colTotal, el.find("thead tr:first th").length );

					heads = el.find( "thead th[data-" + pluginName + "-col]" );
					addClassToHeads( heads );
					makeHeadsActionable( heads , headsOnAction );
					handleDefault( heads );
			},
			getColumnNumber: function( col ){
				return $( col ).prevAll().length;
			},
			getTableRows: function(){
				return $( this ).find( "tbody tr" );
			},
			sortRows: function( table, rows , colNum , ascending, col ){ //Tribal modification - include reference to table
				var cells, fn, sorted;
				var getCells = function( rows ){
						var cells = [],
							childCells,
							cellToSort,
							curColspan,
							curCol,
							totCols = parseInt($(table).attr( attrs.colTotal ), 10); //Tribal modification - number of columns in the table header

						$.each( rows , function( i , r ){
							//Tribal modification - if using colspan in the row then we need to calculate the column number to use by taking that in to account
							childCells = $( r ).children();

							if ( colNum === 0 || isNaN( totCols ) || totCols <= childCells.length ) {
								cellToSort = childCells.get( colNum ); //no colspan in use, or it's in used in the heading (meaning sorting isn't supported), so the column number directly relates to the cell
							}
							else {
								//if there is a mismatch between the header columns and the data columns then a colspan may be in use (or the table structure may be invalid, but we don't worry about that)
								curCol = 0;

								//add up the colspan on each column until we find the one that covers the header column
								$.each( childCells, function( i, c ){
									curColspan = $( c ).attr( "colspan" );
									if ( typeof curColspan === "undefined" ) curColspan = 1
									else curColspan = parseInt( curColspan, 10 );

									curCol += curColspan;
									if ( curCol > colNum ) { //the current column spans the one we're looking for, so use it as the sort value
										cellToSort = c;
										return false; //stop searching
									}
								});
							}

							//if we still haven't determined which cell to use then just assume the first column (to try and avoid JavaScript errors)
							if ( typeof cellToSort === "undefined" ) {
								cellToSort = childCells.get( 0 );
							}

							cells.push({
								cell: getSortValue( cellToSort ),
								rowNum: i
							});
						});
						return cells;
					},
					getSortFxn = function( ascending, forceNumeric ){
						var fn,
							regex = /[^\-\+\d\.]/g,
							val1,
							val2;
						if( ascending ){
							fn = function( a , b ){
								if( forceNumeric || !isNaN( parseFloat( a.cell ) ) ) {
									//Tribal modification - we have screens that use "-" or blank to denote no value so we need to better cope with that scenario
									val1 = parseFloat( a.cell.replace( regex, '' ) );
									val2 = parseFloat( b.cell.replace( regex, '' ) );

									if(isNaN(val1)||isNaN(val2)) {
										if(isNaN(val1)&&isNaN(val2)) return 0; //if both are not numbers then assume they're the same
										else if(isNaN(val1)) return -1; //if a isn't a number then a is lower
										else return 1; //if b isn't a number then a is higher
									}

									return val1 - val2;
								} else {
									return a.cell.toLowerCase() > b.cell.toLowerCase() ? 1 : -1;
								}
							};
						} else {
							fn = function( a , b ){
								if( forceNumeric || !isNaN( parseFloat( a.cell ) ) ) {
									//Tribal modification - we have screens that use "-" or blank to denote no value so we need to better cope with that scenario
									val1 = parseFloat( b.cell.replace( regex, '' ) );
									val2 = parseFloat( a.cell.replace( regex, '' ) );

									if(isNaN(val1)||isNaN(val2)) {
										if(isNaN(val1)&&isNaN(val2)) return 0; //if both are not numbers then assume they're the same
										else if(isNaN(val1)) return -1; //if b isn't a number then b is lower
										else return 1; //if a isn't a number then b is higher
									}

									return val1 - val2;
								} else {
									return a.cell.toLowerCase() < b.cell.toLowerCase() ? 1 : -1;
								}
							};
						}
						return fn;
					},
					applyToRows = function( sorted , rows ){
						var newRows = [], i, l, cur;
						for( i = 0, l = sorted.length ; i < l ; i++ ){
							cur = sorted[ i ].rowNum;
							newRows.push( rows[cur] );
						}
						return newRows;
					};

				cells = getCells( rows );
				var customFn = $( col ).data( 'tablesaw-sort' );
				fn = ( customFn && typeof customFn === "function" ? customFn( ascending ) : false ) ||
					getSortFxn( ascending, $( col ).is( '[data-sortable-numeric]' ) );
				sorted = cells.sort( fn );
				rows = applyToRows( sorted , rows );
				return rows;
			},
			replaceTableRows: function( rows ){
				var el = $( this ),
					body = el.find( "tbody" );

				//Tribal modification - re-worked to prevent loss of events and data items (used .html before)
				body.append(rows);
			},
			makeColDefault: function( col , a ){
				var c = $( col );
				c.attr( attrs.defaultCol , "true" );
				if( a ){
					c.attr( attrs.defaultDesc, "false" );
					setSortAttributes( col, "asc" ); //Tribal modification
				} else {
					c.attr( attrs.defaultDesc, "true" );
					setSortAttributes( col, "desc" ); //Tribal modification
				}
			},
			sortBy: function( col , ascending ){
				var el = $( this ), colNum, rows;

				colNum = el[ pluginName ]( "getColumnNumber" , col );
				rows = el[ pluginName ]( "getTableRows" );
				rows = el[ pluginName ]( "sortRows" , el, rows , colNum , ascending, col ); //Tribal modification - pass through reference to the table
				el[ pluginName ]( "replaceTableRows" , rows );
				el[ pluginName ]( "makeColDefault" , col , ascending );
			}
		};

	// Collection method.
	$.fn[ pluginName ] = function( arrg ) {
		var args = Array.prototype.slice.call( arguments , 1),
			returnVal;

		// if it's a method
		if( arrg && typeof( arrg ) === "string" ){
			returnVal = $.fn[ pluginName ].prototype[ arrg ].apply( this[0], args );
			return (typeof returnVal !== "undefined")? returnVal:$(this);
		}
		// check init
		if( !$( this ).data( pluginName + "data" ) ){
			$( this ).data( pluginName + "active", true );
			$.fn[ pluginName ].prototype._create.call( this , arrg );
		}
		return $(this);
	};
	// add methods
	$.extend( $.fn[ pluginName ].prototype, methods );

	$( document ).on( "tablesawcreate", function( e, Tablesaw ) {
		if( Tablesaw.$table.is( initSelector ) ) {
			Tablesaw.$table[ pluginName ]();
		}
	});

}( jQuery ));

;(function( win, $, undefined ){

	var MM = {
		attr: {
			init: 'data-tablesaw-minimap'
		}
	};

	function createMiniMap( $table ){

		var $btns = $( '<div class="tablesaw-advance minimap">' ),
			$dotNav = $( '<ul class="tablesaw-advance-dots">' ).appendTo( $btns ),
			hideDot = 'tablesaw-advance-dots-hide',
			$headerCells = $table.find( 'thead tr:first th' ); //Tribal modification - only pick up the th's from the first tr (in case we have colspans)

		// populate dots
		$headerCells.each(function(){
			$dotNav.append( '<li><i></i></li>' );
		});

		$btns.appendTo( $table.prev( '.tablesaw-bar' ) );

		function showMinimap( $table ) {
			var mq = $table.attr( MM.attr.init );
			return !mq || win.matchMedia && win.matchMedia( mq ).matches;
		}

		function showHideNav(){
			if( !showMinimap( $table ) ) {
				$btns.hide();
				return;
			}
			$btns.show();

			// show/hide dots
			var dots = $dotNav.find( "li" ).removeClass( hideDot );
			$table.find( "thead th" ).each(function(i){
				if( $( this ).css( "display" ) === "none" ){
					dots.eq( i ).addClass( hideDot );
				}
			});
		}

		// run on init and resize
		showHideNav();
		$( win ).on( "resize", showHideNav );


		$table
			.bind( "tablesawcolumns.minimap", function(){
				showHideNav();
			})
			.bind( "tablesawdestroy.minimap", function(){
				var $t = $( this );

				$t.prev( '.tablesaw-bar' ).find( '.tablesaw-advance' ).remove();
				$( win ).off( "resize", showHideNav );

				$t.unbind( ".minimap" );
			});
	}



	// on tablecreate, init
	$( document ).on( "tablesawcreate", function( e, Tablesaw ){

		if( ( Tablesaw.mode === 'swipe' || Tablesaw.mode === 'columntoggle' ) && Tablesaw.$table.is( '[ ' + MM.attr.init + ']' ) ){
			createMiniMap( Tablesaw.$table );
		}

	} );

}( this, jQuery ));