//NOTE: This file has been amended by Tribal to fit within e:Vision, and combines both the Bootstrap and Responsive plugins for DataTables.
//See "Tribal modification" comments for changes

/*! DataTables Bootstrap 3 integration
 * ©2011-2014 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 3. This requires Bootstrap 3 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function(window, document, undefined){

var factory = function( $, DataTable ) {
"use strict";


/* Set the defaults for DataTables initialisation */
$.extend( true, DataTable.defaults, {
	dom:
		"<'sv-row'<'sv-col-sm-6'l><'sv-col-sm-6'f>>" +
		"<'sv-row'<'sv-col-sm-12'rt>>" +
		"<'sv-row'<'sv-form-pagination'<'sv-col-sm-12 sv-form-pagination-rec-count'i><'sv-col-sm-12'p>>>",
	renderer: 'bootstrap'
} );


/* Default class modification */
$.extend( DataTable.ext.classes, {
	sWrapper:      "dataTables_wrapper sv-form-inline dt-bootstrap",
	sFilterInput:  "sv-form-control sv-input-sm",
	sLengthSelect: "sv-form-control sv-input-sm"
} );


/* Bootstrap paging button renderer */
DataTable.ext.renderer.pageButton.bootstrap = function ( settings, host, idx, buttons, page, pages ) {
	var api     = new DataTable.Api( settings );
	var classes = settings.oClasses;
	var lang    = settings.oLanguage.oPaginate;
	var btnDisplay, btnClass, counter=0;

	var attach = function( container, buttons ) {
		var i, ien, node, button;
		var clickHandler = function ( e ) {
			e.preventDefault();
			if ( !$(e.currentTarget).hasClass('disabled') ) {
				api.page( e.data.action ).draw( false );
			}
		};

		for ( i=0, ien=buttons.length ; i<ien ; i++ ) {
			button = buttons[i];

			if ( $.isArray( button ) ) {
				attach( container, button );
			}
			else {
				btnDisplay = '';
				btnClass = '';

				switch ( button ) {
					case 'ellipsis':
						btnDisplay = '&hellip;';
						btnClass = 'sv-disabled';
						break;

					case 'first':
						btnDisplay = lang.sFirst;
						btnClass = button + (page > 0 ?
							'' : ' sv-disabled');
						break;

					case 'previous':
						btnDisplay = lang.sPrevious;
						btnClass = button + (page > 0 ?
							'' : ' sv-disabled');
						break;

					case 'next':
						btnDisplay = lang.sNext;
						btnClass = button + (page < pages-1 ?
							'' : ' sv-disabled');
						break;

					case 'last':
						btnDisplay = lang.sLast;
						btnClass = button + (page < pages-1 ?
							'' : ' sv-disabled');
						break;

					default:
						btnDisplay = button + 1;
						btnClass = 'sv-pagination-page' + (page === button ?
							' sv-active' : ''); //Tribal modification - include class specifically for page buttons
						break;
				}

				if ( btnDisplay ) {
					node = $('<li>', {
							'class': classes.sPageButton+' '+btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId +'_'+ button :
								null
						} )
						.append( $('<a>', {
								'href': '#',
								'aria-controls': settings.sTableId,
								'data-dt-idx': counter,
								'tabindex': settings.iTabIndex
							} )
							.html( btnDisplay )
						)
						.appendTo( container );

					settings.oApi._fnBindAction(
						node, {action: button}, clickHandler
					);

					counter++;
				}
			}
		}
	};

	// IE9 throws an 'unknown error' if document.activeElement is used
	// inside an iframe or frame.
	var activeEl;

	try {
		// Because this approach is destroying and recreating the paging
		// elements, focus is lost on the select button which is bad for
		// accessibility. So we want to restore focus once the draw has
		// completed
		activeEl = $(document.activeElement).text(); //Tribal modification - keep track of the actual button text so we can find the proper match (rather than an approximate index)
	}
	catch (e) {}

	attach(
		$(host).empty().html('<ul class="sv-pagination"/>').children('ul'),
		buttons
	);

	//Tribal modification - add class to nav if only one page (so it can be styled differently)
	$(host).closest(".sv-form-pagination").toggleClass("sv-form-pagination-single-page",(pages===1?true:false));

	if ( activeEl ) {
		var thisButton;
		$(host).find( '[data-dt-idx]' ).each(function(){ //Tribal modification - look for the previous button
			thisButton = $(this);
			if(thisButton.text()===activeEl){ //match found, so focus on it
				thisButton.focus();
				return false;
			}
		});
	}
};


/*
 * TableTools Bootstrap compatibility
 * Required TableTools 2.1+
 */
if ( DataTable.TableTools ) {
	// Set the classes that TableTools uses to something suitable for Bootstrap
	$.extend( true, DataTable.TableTools.classes, {
		"container": "DTTT sv-btn-group",
		"buttons": {
			"normal": "sv-btn sv-btn-default",
			"disabled": "sv-disabled"
		},
		"collection": {
			"container": "DTTT_dropdown sv-dropdown-menu",
			"buttons": {
				"normal": "",
				"disabled": "sv-disabled"
			}
		},
		"print": {
			"info": "DTTT_print_info"
		},
		"select": {
			"row": "sv-active"
		}
	} );

	// Have the collection use a bootstrap compatible drop down
	$.extend( true, DataTable.TableTools.DEFAULTS.oTags, {
		"collection": {
			"container": "ul",
			"button": "li",
			"liner": "a"
		}
	} );
}

}; // /factory


// Define as an AMD module if possible
if ( typeof define === 'function' && define.amd ) {
	define( ['jquery', 'datatables'], factory );
}
else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    factory( require('jquery'), require('datatables') );
}
else if ( jQuery ) {
	// Otherwise simply initialise as normal, stopping multiple evaluation
	factory( jQuery, jQuery.fn.dataTable );
}


})(window, document);

/*! Responsive 1.0.6
 * 2014-2015 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     Responsive
 * @description Responsive tables plug-in for DataTables
 * @version     1.0.6
 * @file        dataTables.responsive.js
 * @author      SpryMedia Ltd (www.sprymedia.co.uk)
 * @contact     www.sprymedia.co.uk/contact
 * @copyright   Copyright 2014-2015 SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

(function(window, document, undefined) {


var factory = function( $, DataTable ) {
"use strict";

/**
 * Responsive is a plug-in for the DataTables library that makes use of
 * DataTables' ability to change the visibility of columns, changing the
 * visibility of columns so the displayed columns fit into the table container.
 * The end result is that complex tables will be dynamically adjusted to fit
 * into the viewport, be it on a desktop, tablet or mobile browser.
 *
 * Responsive for DataTables has two modes of operation, which can used
 * individually or combined:
 *
 * * Class name based control - columns assigned class names that match the
 *   breakpoint logic can be shown / hidden as required for each breakpoint.
 * * Automatic control - columns are automatically hidden when there is no
 *   room left to display them. Columns removed from the right.
 *
 * In additional to column visibility control, Responsive also has built into
 * options to use DataTables' child row display to show / hide the information
 * from the table that has been hidden. There are also two modes of operation
 * for this child row display:
 *
 * * Inline - when the control element that the user can use to show / hide
 *   child rows is displayed inside the first column of the table.
 * * Column - where a whole column is dedicated to be the show / hide control.
 *
 * Initialisation of Responsive is performed by:
 *
 * * Adding the class `responsive` or `dt-responsive` to the table. In this case
 *   Responsive will automatically be initialised with the default configuration
 *   options when the DataTable is created.
 * * Using the `responsive` option in the DataTables configuration options. This
 *   can also be used to specify the configuration options, or simply set to
 *   `true` to use the defaults.
 *
 *  @class
 *  @param {object} settings DataTables settings object for the host table
 *  @param {object} [opts] Configuration options
 *  @requires jQuery 1.7+
 *  @requires DataTables 1.10.1+
 *
 *  @example
 *      $('#example').DataTable( {
 *        responsive: true
 *      } );
 *    } );
 */
var Responsive = function ( settings, opts ) {
	// Sanity check that we are using DataTables 1.10 or newer
	if ( ! DataTable.versionCheck || ! DataTable.versionCheck( '1.10.1' ) ) {
		throw 'DataTables Responsive requires DataTables 1.10.1 or newer';
	}

	this.s = {
		dt: new DataTable.Api( settings ),
		columns: []
	};

	// Check if responsive has already been initialised on this table
	if ( this.s.dt.settings()[0].responsive ) {
		return;
	}

	// details is an object, but for simplicity the user can give it as a string
	if ( opts && typeof opts.details === 'string' ) {
		opts.details = { type: opts.details };
	}

	this.c = $.extend( true, {}, Responsive.defaults, DataTable.defaults.responsive, opts );
	settings.responsive = this;
	this._constructor();
};

Responsive.prototype = {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */

	/**
	 * Initialise the Responsive instance
	 *
	 * @private
	 */
	_constructor: function ()
	{
		var that = this;
		var dt = this.s.dt;

		dt.settings()[0]._responsive = this;

		// Use DataTables' private throttle function to avoid processor thrashing
		$(window).on( 'resize.dtr orientationchange.dtr', dt.settings()[0].oApi._fnThrottle( function () {
			that._resize();
		} ) );

		// Destroy event handler
		dt.on( 'destroy.dtr', function () {
			$(window).off( 'resize.dtr orientationchange.dtr draw.dtr' );
		} );

		// Reorder the breakpoints array here in case they have been added out
		// of order
		this.c.breakpoints.sort( function (a, b) {
			return a.width < b.width ? 1 :
				a.width > b.width ? -1 : 0;
		} );

		// Determine which columns are already hidden, and should therefore
		// remain hidden. todo - should this be done? See thread 22677
		//
		// this.s.alwaysHidden = dt.columns(':hidden').indexes();

		this._classLogic();
		this._resizeAuto();

		// Details handler
		var details = this.c.details;
		if ( details.type ) {
			that._detailsInit();
			this._detailsVis();

			//Tribal modification - child row access needs to be keyboard accessible (default is to use :before style which isn't)
			that._tribalBuildDetailsAccess(dt,details.type);

			dt.on( 'column-visibility.dtr', function () {
				that._detailsVis();
			} );

			// Redraw the details box on each draw. This is used until
			// DataTables implements a native `updated` event for rows
			dt.on( 'draw.dtr', function () {
				//Tribal modification - determine whether the table width has changed enough to require recalculation (if a column is much wider than on the previous draw for example)
				var m_currWidth = $(dt.table().node()).width();
				if(typeof m_currWidth!=="undefined"&&typeof that._tribalTableWidth!=="undefined"&&typeof that._tribalAutoResizePadding==="number") {
					if(Math.abs(that._tribalTableWidth - m_currWidth) > that._tribalAutoResizePadding) {
						that._resizeAuto();
						that._resize();

						//update the calculated width to reflect the latest calculations
						that._tribalTableWidth = m_currWidth;
					}
				}

				dt.rows( {page: 'current'} ).iterator( 'row', function ( settings, idx ) {
					var row = dt.row( idx );

					if ( row.child.isShown() ) {
						var info = that.c.details.renderer( dt, idx );
						row.child( info, 'child' ).show();
					}

					//Tribal modification - child row access needs to be keyboard accessible (default is to use :before style which isn't)
					that._tribalBuildDetailsAccess(dt,details.type,"",row);
				} );
			} );

			$(dt.table().node()).addClass( 'dtr-'+details.type );
		}

		//Tribal modification - keep track of any defined initial inline width, so we can reset it if we resize the table so it's no longer responsive
		var m_tableNode = dt.table().node();
		if(!dt.settings()[0].tribalDisableInitialWidth){
			this._tribalInitialWidth = m_tableNode.style.width;

			//if there is no initial width, then set it to 100% or we run in to problems during the initial responsive calculations (the table doesn't fit on screen)
			if(typeof this._tribalInitialWidth==="undefined"||this._tribalInitialWidth===""){
				this._tribalInitialWidth = "100%";
				m_tableNode.style.width = this._tribalInitialWidth;
			}
		}

		//Tribal modification - determine the padding value to use in any auto resize calls
		if(!dt.settings()[0].tribalDisableAutoResize) {
			var m_padding = dt.settings()[0].tribalAutoResizePadding;
			if(typeof m_padding!=="number") {
				m_padding = 5; //assume +-5px as the default
			}
			this._tribalAutoResizePadding = m_padding;
		}

		// First pass - draw the table for the current viewport size
		this._resize();

		//Tribal modification - keep track of how wide the table is after the initial sizing so we can determine whether it has changed after a draw (for when a particular cell value is longer than the equivalent one for a previous draw - which could cause overlap)
		this._tribalTableWidth = m_tableNode.offsetWidth;
	},


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	//Tribal modification - child row access needs to be keyboard accessible (default is to use :before style which isn't)
	_tribalBuildDetailsAccess: function(dt,type,cell,row){
		//we only use the "inline" type, so don't run our processing otherwise (just use the defaults)
		if(type!=="inline") return;

		//if we've got a cell then we only process that cell
		if(typeof cell!=="undefined"&&cell!=""){
			this._tribalBuildDetailsAccessContent(dt,cell);
		}
		else{
			//if we've got a row then we only process that row, otherwise we process all rows on the current page (everything the user can see)
			if(typeof row!=="undefined"&&row!=""){
				this._tribalBuildDetailsAccessContent(dt,$(row.node()).find("td:first"));
			}
			else{
				var that = this; //we need reference to the same "this" in the iterator, so keep a reference
				dt.rows( {page: 'current'} ).iterator( 'row', function ( settings, idx ) {
					row = dt.row( idx );
					that._tribalBuildDetailsAccessContent(dt,$(row.node()).find("td:first"));
				});
			}
		}
	},

	//Tribal modification - amend the first table cell in a row to include child row access (which is then shown/hidden by the stylesheet)
	_tribalBuildDetailsAccessContent: function(dt,cell){
		if(!cell) return; //no cell, so nothing to build against

		var m_td = $(cell);
		var m_label;

		//include our anchor if it doesn't already exist
		var m_anchor = m_td.find("a.sv-dt-access");
		if(m_anchor.length==0){
			//get the label text to use
			m_label = this._tribalGetAccessContentText(dt,"OPEN",m_td.text());

			//build the content
			m_td.prepend("<a class=\"sv-dt-access\" href=\"javascript:void(0)\" title=\""+m_label+"\">&#160;</a>");
		}
		else{
			var m_tr = m_td.parent();

			//anchor exists, so update the title based on whether the child row is open or closed (i.e. row has parent class or not)
			if(!m_tr.hasClass("parent")) m_label = this._tribalGetAccessContentText(dt,"OPEN",m_td.text());
			else m_label = this._tribalGetAccessContentText(dt,"CLOSE",m_td.text());

			//update the title
			m_anchor.prop("title",m_label);
		}
	},

	//Tribal modification - return the accessibility link title/aria text
	_tribalGetAccessContentText: function(dt,mode,data){
		if(typeof data==="undefined"){
			data = "";
		}
		else{
			if(typeof sits_white_trim==="function") data = sits_white_trim(data);
			else if(typeof String.prototype.trim==="function") data = data.trim();
		}

		var m_label;
		if(data===""){ //use different message if data is blank or unknown
			if(mode!=="CLOSE") m_label = dt.i18n("tribal.detailsLabelOpen","Activate to show additional details for this row");
			else m_label = dt.i18n("tribal.detailsLabelClose","Activate to hide additional details for this row");
		}
		else{
			if(mode!=="CLOSE") m_label = dt.i18n("tribal.detailsLabelDataOpen","Activate to show additional details for _DATA_");
			else m_label = dt.i18n("tribal.detailsLabelDataClose","Activate to hide additional details for _DATA_");

			//update the ARIA label for use with screenreaders (replacing any placeholder text) using data from the first field
			m_label = m_label.replace(/_DATA_/g,data);
		}

		//escape the attribute using standard function if available
		if(typeof sits_escape_attr==="function") return sits_escape_attr(m_label);
		else return m_label.replace(/\"/g,"&quot;");
	},

	/**
	 * Calculate the visibility for the columns in a table for a given
	 * breakpoint. The result is pre-determined based on the class logic if
	 * class names are used to control all columns, but the width of the table
	 * is also used if there are columns which are to be automatically shown
	 * and hidden.
	 *
	 * @param  {string} breakpoint Breakpoint name to use for the calculation
	 * @return {array} Array of boolean values initiating the visibility of each
	 *   column.
	 *  @private
	 */
	_columnsVisiblity: function ( breakpoint )
	{
		var dt = this.s.dt;
		var columns = this.s.columns;
		var i, ien;

		// Class logic - determine which columns are in this breakpoint based
		// on the classes. If no class control (i.e. `auto`) then `-` is used
		// to indicate this to the rest of the function
		var display = $.map( columns, function ( col ) {
			return col.auto && col.minWidth === null ?
				false :
				col.auto === true ?
					'-' :
					$.inArray( breakpoint, col.includeIn ) !== -1;
		} );

		// Auto column control - first pass: how much width is taken by the
		// ones that must be included from the non-auto columns
		var requiredWidth = 0;
		for ( i=0, ien=display.length ; i<ien ; i++ ) {
			if ( display[i] === true ) {
				requiredWidth += columns[i].minWidth;
			}
		}

		// Second pass, use up any remaining width for other columns. For
		// scrolling tables we need to subtract the width of the scrollbar. It
		// may not be requires which makes this sub-optimal, but it would
		// require another full redraw to make complete use of those extra few
		// pixels
		var scrolling = dt.settings()[0].oScroll;
		var bar = scrolling.sY || scrolling.sX ? scrolling.iBarWidth : 0;
		var widthAvailable = dt.table().container().offsetWidth - bar;
		var usedWidth = widthAvailable - requiredWidth;

		// Control column needs to always be included. This makes it sub-
		// optimal in terms of using the available with, but to stop layout
		// thrashing or overflow. Also we need to account for the control column
		// width first so we know how much width is available for the other
		// columns, since the control column might not be the first one shown
		for ( i=0, ien=display.length ; i<ien ; i++ ) {
			if ( columns[i].control ) {
				usedWidth -= columns[i].minWidth;
			}
		}

		// Allow columns to be shown (counting from the left) until we run out
		// of room
		var empty = false;
		for ( i=0, ien=display.length ; i<ien ; i++ ) {
			if ( display[i] === '-' && ! columns[i].control ) {
				// Once we've found a column that won't fit we don't let any
				// others display either, or columns might disappear in the
				// middle of the table
				if ( empty || usedWidth - columns[i].minWidth < 0 ) {
					empty = true;
					display[i] = false;
				}
				else {
					display[i] = true;
				}

				usedWidth -= columns[i].minWidth;
			}
		}

		// Determine if the 'control' column should be shown (if there is one).
		// This is the case when there is a hidden column (that is not the
		// control column). The two loops look inefficient here, but they are
		// trivial and will fly through. We need to know the outcome from the
		// first , before the action in the second can be taken
		var showControl = false;

		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			if ( ! columns[i].control && ! columns[i].never && ! display[i] ) {
				showControl = true;
				break;
			}
		}

		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			if ( columns[i].control ) {
				display[i] = showControl;
			}
		}

		// Finally we need to make sure that there is at least one column that
		// is visible
		if ( $.inArray( true, display ) === -1 ) {
			display[0] = true;
		}

		return display;
	},


	/**
	 * Create the internal `columns` array with information about the columns
	 * for the table. This includes determining which breakpoints the column
	 * will appear in, based upon class names in the column, which makes up the
	 * vast majority of this method.
	 *
	 * @private
	 */
	_classLogic: function ()
	{
		var that = this;
		var calc = {};
		var breakpoints = this.c.breakpoints;

		var columns = this.s.dt.columns().eq(0).map( function (i) {
			var className = this.column(i).header().className;

			return {
				className: className,
				includeIn: [],
				auto:      false,
				control:   false,
				never:     className.match(/\bnever\b/) ? true : false
			};
		} );

		// Simply add a breakpoint to `includeIn` array, ensuring that there are
		// no duplicates
		var add = function ( colIdx, name ) {
			var includeIn = columns[ colIdx ].includeIn;

			if ( $.inArray( name, includeIn ) === -1 ) {
				includeIn.push( name );
			}
		};

		var column = function ( colIdx, name, operator, matched ) {
			var size, i, ien;

			if ( ! operator ) {
				columns[ colIdx ].includeIn.push( name );
			}
			else if ( operator === 'max-' ) {
				// Add this breakpoint and all smaller
				size = that._find( name ).width;

				for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
					if ( breakpoints[i].width <= size ) {
						add( colIdx, breakpoints[i].name );
					}
				}
			}
			else if ( operator === 'min-' ) {
				// Add this breakpoint and all larger
				size = that._find( name ).width;

				for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
					if ( breakpoints[i].width >= size ) {
						add( colIdx, breakpoints[i].name );
					}
				}
			}
			else if ( operator === 'not-' ) {
				// Add all but this breakpoint (xxx need extra information)

				for ( i=0, ien=breakpoints.length ; i<ien ; i++ ) {
					if ( breakpoints[i].name.indexOf( matched ) === -1 ) {
						add( colIdx, breakpoints[i].name );
					}
				}
			}
		};

		// Loop over each column and determine if it has a responsive control
		// class
		columns.each( function ( col, i ) {
			var classNames = col.className.split(' ');
			var hasClass = false;

			// Split the class name up so multiple rules can be applied if needed
			for ( var k=0, ken=classNames.length ; k<ken ; k++ ) {
				var className = $.trim( classNames[k] );

				if ( className === 'all' ) {
					// Include in all
					hasClass = true;
					col.includeIn = $.map( breakpoints, function (a) {
						return a.name;
					} );
					return;
				}
				else if ( className === 'none' || className === 'never' ) {
					// Include in none (default) and no auto
					hasClass = true;
					return;
				}
				else if ( className === 'control' ) {
					// Special column that is only visible, when one of the other
					// columns is hidden. This is used for the details control
					hasClass = true;
					col.control = true;
					return;
				}

				$.each( breakpoints, function ( j, breakpoint ) {
					// Does this column have a class that matches this breakpoint?
					var brokenPoint = breakpoint.name.split('-');
					var re = new RegExp( '(min\\-|max\\-|not\\-)?('+brokenPoint[0]+')(\\-[_a-zA-Z0-9])?' );
					var match = className.match( re );

					if ( match ) {
						hasClass = true;

						if ( match[2] === brokenPoint[0] && match[3] === '-'+brokenPoint[1] ) {
							// Class name matches breakpoint name fully
							column( i, breakpoint.name, match[1], match[2]+match[3] );
						}
						else if ( match[2] === brokenPoint[0] && ! match[3] ) {
							// Class name matched primary breakpoint name with no qualifier
							column( i, breakpoint.name, match[1], match[2] );
						}
					}
				} );
			}

			// If there was no control class, then automatic sizing is used
			if ( ! hasClass ) {
				col.auto = true;
			}
		} );

		this.s.columns = columns;
	},


	/**
	 * Initialisation for the details handler
	 *
	 * @private
	 */
	_detailsInit: function ()
	{
		var that    = this;
		var dt      = this.s.dt;
		var details = this.c.details;

		// The inline type always uses the first child as the target
		if ( details.type === 'inline' ) {
			//Tribal modification - we need to activate the child row if we click on the accessibility link too
			details.target = 'td:first-child,a.sv-dt-access';
		}

		// type.target can be a string jQuery selector or a column index
		var target   = details.target;
		var selector = typeof target === 'string' ? target : 'td';

		// Click handler to show / hide the details rows when they are available
		$( dt.table().body() ).on( 'click', selector, function (e) {
			// If the table is not collapsed (i.e. there is no hidden columns)
			// then take no action
			if ( ! $(dt.table().node()).hasClass('collapsed' ) ) {
				return;
			}

			// Check that the row is actually a DataTable's controlled node
			if ( ! dt.row( $(this).closest('tr') ).length ) {
				return;
			}

			// For column index, we determine if we should act or not in the
			// handler - otherwise it is already okay
			if ( typeof target === 'number' ) {
				var targetIdx = target < 0 ?
					dt.columns().eq(0).length + target :
					target;

				if ( dt.cell( this ).index().column !== targetIdx ) {
					return;
				}
			}

			// $().closest() includes itself in its check
			var row = dt.row( $(this).closest('tr') );

			if ( row.child.isShown() ) {
				row.child( false );
				$( row.node() ).removeClass( 'parent' );
			}
			else {
				var info = that.c.details.renderer( dt, row[0] );
				row.child( info, 'child' ).show();
				$( row.node() ).addClass( 'parent' );
			}

			//Tribal modification - update the label on the accessibility link
			that._tribalBuildDetailsAccess(dt,details.type,"",row);

			//Tribal modification - prevent bubbling up so clicking on the accessibility link only fires one event
			if(this.tagName=="A"&&$(this).hasClass("sv-dt-access")) return false;
		} );
	},


	/**
	 * Update the child rows in the table whenever the column visibility changes
	 *
	 * @private
	 */
	_detailsVis: function ()
	{
		var that = this;
		var dt = this.s.dt;

		// Find how many columns are hidden
		var hiddenColumns = dt.columns().indexes().filter( function ( idx ) {
			var col = dt.column( idx );

			if ( col.visible() ) {
				return null;
			}

			// Only counts as hidden if it doesn't have the `never` class
			return $( col.header() ).hasClass( 'never' ) ? null : idx;
		} );
		var haveHidden = true;

		if ( hiddenColumns.length === 0 || ( hiddenColumns.length === 1 && this.s.columns[ hiddenColumns[0] ].control ) ) {
			haveHidden = false;
		}

		if ( haveHidden ) {
			// Show all existing child rows
			dt.rows( { page: 'current' } ).eq(0).each( function (idx) {
				var row = dt.row( idx );

				if ( row.child() ) {
					var info = that.c.details.renderer( dt, row[0] );

					// The renderer can return false to have no child row
					if ( info === false ) {
						row.child.hide();
					}
					else {
						row.child( info, 'child' ).show();
					}
				}
			} );
		}
		else {
			// Hide all existing child rows
			dt.rows( { page: 'current' } ).eq(0).each( function (idx) {
				dt.row( idx ).child.hide();
			} );
		}
	},


	/**
	 * Find a breakpoint object from a name
	 * @param  {string} name Breakpoint name to find
	 * @return {object}      Breakpoint description object
	 */
	_find: function ( name )
	{
		var breakpoints = this.c.breakpoints;

		for ( var i=0, ien=breakpoints.length ; i<ien ; i++ ) {
			if ( breakpoints[i].name === name ) {
				return breakpoints[i];
			}
		}
	},


	/**
	 * Alter the table display for a resized viewport. This involves first
	 * determining what breakpoint the window currently is in, getting the
	 * column visibilities to apply and then setting them.
	 *
	 * @private
	 */
	_resize: function ()
	{
		var dt = this.s.dt;
		var width = $(window).width();
		var breakpoints = this.c.breakpoints;
		var breakpoint = breakpoints[0].name;
		var columns = this.s.columns;
		var that = this;
		var i, ien;

		// Determine what breakpoint we are currently at
		for ( i=breakpoints.length-1 ; i>=0 ; i-- ) {
			if ( width <= breakpoints[i].width ) {
				breakpoint = breakpoints[i].name;
				break;
			}
		}

		// Show the columns for that break point
		var columnsVis = this._columnsVisiblity( breakpoint );

		// Set the class before the column visibility is changed so event
		// listeners know what the state is. Need to determine if there are
		// any columns that are not visible but can be shown
		var collapsedClass = false;
		for ( i=0, ien=columns.length ; i<ien ; i++ ) {
			if ( columnsVis[i] === false && ! columns[i].never ) {
				collapsedClass = true;
				break;
			}
		}

		//Tribal modification - REED1 - when we switch from collapsed to uncollapsed we didn't revert the inline width style on the table, which affects the e:Vision layout, so revert it
		var m_tableNode = $(dt.table().node());
		if(!collapsedClass&&typeof this._tribalInitialWidth!=="undefined"){
			m_tableNode.css("width",this._tribalInitialWidth);
		}

		m_tableNode.toggleClass('collapsed', collapsedClass );

		//Tribal modification - determine whether we're changing the display (i.e. showing different columns) and, if so, whether the first visible column is different (which may mean we need to rebuild the child row access)
		var firstVisCol = -1;
		for( i=0; firstVisCol<0 && i<columnsVis.length; i++ ) {
			if ( columnsVis[i] ){
				firstVisCol = i; //found the first visible column
			}
		}

		var rebuildAccess = false;
		if ( typeof this._tribalFirstVisCol !== "number" || this._tribalFirstVisCol !== firstVisCol ) {
			//Tribal modification - the first visible column has changed, so may need to rebuild the child access link
			rebuildAccess = true;
			this._tribalFirstVisCol = firstVisCol;
		}

		var details = this.c.details;
		var col, nodes, hasChildAccess, action, j;
		dt.columns().eq(0).each( function ( colIdx, i ) {
			col = dt.column( colIdx );

			//Tribal modification - if we need to rebuild/check child access then do so now
			if ( rebuildAccess ){
				//test the first node in the column (i.e. the one from the first row) to see whether we need to create or remove the child access link
				nodes = col.nodes();
				if(nodes.length>0){
					hasChildAccess = ($(nodes[0]).find("a.sv-dt-access").length > 0)?true:false;

					action = ""
					if ( hasChildAccess && i !== firstVisCol ) { //not the first visible column, but does have child access, so we need to remove it
						action = "REMOVE";
					}
					else{
						if ( !hasChildAccess && i === firstVisCol ) { //is first column, and doesn't have child access, so we need to add it
							action = "ADD";
						}
					}

					if ( action !== "" ){
						//loop through the nodes in the column (i.e. the TDs) and add or remove the child access link
						for ( j=0; j<nodes.length; j++ ){
							if ( action === "ADD" ){
								that._tribalBuildDetailsAccess(dt,details.type,nodes[j]);
							}
							else{
								$(nodes[j]).find("a.sv-dt-access").remove();
							}
						}
					}
				}
				else{
					rebuildAccess = false; //no rows in table, so no need to keep processing
				}
			}

			//show or hide the column as required
			col.visible( columnsVis[i], true, false ); //Tribal modification - added parameters to disable responsive rebuild when setting column visibility
		} );
	},


	/**
	 * Determine the width of each column in the table so the auto column hiding
	 * has that information to work with. This method is never going to be 100%
	 * perfect since column widths can change slightly per page, but without
	 * seriously compromising performance this is quite effective.
	 *
	 * @private
	 */
	_resizeAuto: function ()
	{
		var dt = this.s.dt;
		var columns = this.s.columns;

		// Are we allowed to do auto sizing?
		if ( ! this.c.auto ) {
			return;
		}

		// Are there any columns that actually need auto-sizing, or do they all
		// have classes defined
		if ( $.inArray( true, $.map( columns, function (c) { return c.auto; } ) ) === -1 ) {
			return;
		}

		// Clone the table with the current data in it
		var tableWidth   = dt.table().node().offsetWidth;
		var columnWidths = dt.columns;

		var clonedTable  = $(dt.table().node()).clone( false ); //Tribal modification - switch to jQuery clone of table, thead and tbody to workaround IE8 issue
		var clonedHeader = $(dt.table().header()).clone( false );
		var clonedBody   = $(dt.table().body()).clone( false );

		clonedHeader.appendTo( clonedTable );
		clonedBody.appendTo( clonedTable );

		$( dt.table().footer() ).clone( false ).appendTo( clonedTable );

		// This is a bit slow, but we need to get a clone of each row that
		// includes all columns. As such, try to do this as little as possible.
		dt.rows( { page: 'current' } ).indexes().flatten().each( function ( idx ) {
			var clone = dt.row( idx ).node().cloneNode( true );

			if ( dt.columns( ':hidden' ).flatten().length ) {
				$(clone).append( dt.cells( idx, ':hidden' ).nodes().to$().clone() );
			}

			$(clone).appendTo( clonedBody );
		} );

		var cells = dt.columns().header().to$().clone( false );
		$('<tr/>')
			.append( cells )
			.appendTo( clonedHeader );

		// In the inline case extra padding is applied to the first column to
		// give space for the show / hide icon. We need to use this in the
		// calculation
		if ( this.c.details.type === 'inline' ) {
			$(clonedTable).addClass( 'dtr-inline collapsed' );
		}

		var inserted = $('<div/>')
			.css( {
				width: 1,
				height: 1,
				overflow: 'hidden'
			} )
			.append( clonedTable );

		// Remove columns which are not to be included
		inserted.find('th.never, td.never').remove();

		inserted.insertBefore( dt.table().node() );

		// The cloned header now contains the smallest that each column can be
		dt.columns().eq(0).each( function ( idx ) {
			columns[idx].minWidth = cells[ idx ].offsetWidth || 0;
		} );

		inserted.remove();
	}
};


/**
 * List of default breakpoints. Each item in the array is an object with two
 * properties:
 *
 * * `name` - the breakpoint name.
 * * `width` - the breakpoint width
 *
 * @name Responsive.breakpoints
 * @static
 */
Responsive.breakpoints = [
	{ name: 'desktop',  width: Infinity },
	{ name: 'tablet-l', width: 1024 },
	{ name: 'tablet-p', width: 768 },
	{ name: 'mobile-l', width: 480 },
	{ name: 'mobile-p', width: 320 }
];


/**
 * Responsive default settings for initialisation
 *
 * @namespace
 * @name Responsive.defaults
 * @static
 */
Responsive.defaults = {
	/**
	 * List of breakpoints for the instance. Note that this means that each
	 * instance can have its own breakpoints. Additionally, the breakpoints
	 * cannot be changed once an instance has been creased.
	 *
	 * @type {Array}
	 * @default Takes the value of `Responsive.breakpoints`
	 */
	breakpoints: Responsive.breakpoints,

	/**
	 * Enable / disable auto hiding calculations. It can help to increase
	 * performance slightly if you disable this option, but all columns would
	 * need to have breakpoint classes assigned to them
	 *
	 * @type {Boolean}
	 * @default  `true`
	 */
	auto: true,

	/**
	 * Details control. If given as a string value, the `type` property of the
	 * default object is set to that value, and the defaults used for the rest
	 * of the object - this is for ease of implementation.
	 *
	 * The object consists of the following properties:
	 *
	 * * `renderer` - function that is called for display of the child row data.
	 *   The default function will show the data from the hidden columns
	 * * `target` - Used as the selector for what objects to attach the child
	 *   open / close to
	 * * `type` - `false` to disable the details display, `inline` or `column`
	 *   for the two control types
	 *
	 * @type {Object|string}
	 */
	details: {
		renderer: function ( api, rowIdx ) {
			var data = api.cells( rowIdx, ':hidden' ).eq(0).map( function ( cell ) {
				var header = $( api.column( cell.column ).header() );
				var idx = api.cell( cell ).index();

				if ( header.hasClass( 'control' ) || header.hasClass( 'never' ) ) {
					return '';
				}

				// Use a non-public DT API method to render the data for display
				// This needs to be updated when DT adds a suitable method for
				// this type of data retrieval
				var dtPrivate = api.settings()[0];
				var cellData = dtPrivate.oApi._fnGetCellData(
					dtPrivate, idx.row, idx.column, 'display'
				);
				var title = header.text();
				if ( title ) {
					title = title + ':';
				}

				return '<li data-dtr-index="'+idx.column+'">'+
						'<span class="dtr-title">'+
							title+
						'</span> '+
						'<span class="dtr-data">'+
							cellData+
						'</span>'+
					'</li>';
			} ).toArray().join('');

			return data ?
				$('<ul data-dtr-index="'+rowIdx+'"/>').append( data ) :
				false;
		},

		target: 0,

		type: 'inline'
	}
};


/*
 * API
 */
var Api = $.fn.dataTable.Api;

// Doesn't do anything - work around for a bug in DT... Not documented
Api.register( 'responsive()', function () {
	return this;
} );

Api.register( 'responsive.index()', function ( li ) {
	li = $(li);

	return {
		column: li.data('dtr-index'),
		row:    li.parent().data('dtr-index')
	};
} );

Api.register( 'responsive.rebuild()', function () {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx._responsive ) {
			ctx._responsive._classLogic();
		}
	} );
} );

Api.register( 'responsive.recalc()', function () {
	return this.iterator( 'table', function ( ctx ) {
		if ( ctx._responsive ) {
			ctx._responsive._resizeAuto();
			ctx._responsive._resize();

			//Tribal modification - keep track of the current table width (for possible use in auto resize calculations later)
			var dt = ctx._responsive.s.dt;
			if(typeof dt==="object") {
				ctx._responsive._tribalTableWidth = $(dt.table().node()).width();
			}
		}
	} );
} );


/**
 * Version information
 *
 * @name Responsive.version
 * @static
 */
Responsive.version = '1.0.6';


$.fn.dataTable.Responsive = Responsive;
$.fn.DataTable.Responsive = Responsive;

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
$(document).on( 'init.dt.dtr', function (e, settings, json) {
	if ( e.namespace !== 'dt' ) {
		return;
	}

	if ( $(settings.nTable).hasClass( 'responsive' ) ||
		 $(settings.nTable).hasClass( 'dt-responsive' ) ||
		 settings.oInit.responsive ||
		 DataTable.defaults.responsive
	) {
		var init = settings.oInit.responsive;

		if ( init !== false ) {
			new Responsive( settings, $.isPlainObject( init ) ? init : {}  );
		}
	}
} );

return Responsive;
}; // /factory


// Define as an AMD module if possible
if ( typeof define === 'function' && define.amd ) {
	define( ['jquery', 'datatables'], factory );
}
else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    factory( require('jquery'), require('datatables') );
}
else if ( jQuery && !jQuery.fn.dataTable.Responsive ) {
	// Otherwise simply initialise as normal, stopping multiple evaluation
	factory( jQuery, jQuery.fn.dataTable );
}


})(window, document);

/**Tribal modification - Include any custom sort plugins for use when sorting "unusual" columns*/

/**
 * Read information from a column of checkboxes (input elements with type
 * checkbox) and return an array to use as a basis for sorting.
 *
 *  @summary Sort based on the checked state of checkboxes in a column
 *  @name Checkbox data source
 *  @author [Allan Jardine](http://sprymedia.co.uk)
 */

$.fn.dataTable.ext.order['dom-checkbox'] = function  ( settings, col ) {
	return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		return $('input', td).prop('checked') ? '1' : '0';
	} );
};

/**
 * Read information from a column of select (drop down) menus and return an
 * array to use as a basis for sorting.
 *
 *  @summary Sort based on the value of the `dt-tag select` options in a column
 *  @name Select menu data source
 *  @requires DataTables 1.10+
 *  @author [Allan Jardine](http://sprymedia.co.uk)
 */

$.fn.dataTable.ext.order['dom-select'] = function  ( settings, col ) {
	return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		return $('select', td).val();
	} );
};

/**
 * Read information from a column of input (type text) elements and return an
 * array to use as a basis for sorting.
 *
 *  @summary Sorting based on the values of `dt-tag input` elements in a column.
 *  @name Input element data source
 *  @requires DataTables 1.10+
 *  @author [Allan Jardine](http://sprymedia.co.uk)
 */

$.fn.dataTable.ext.order['dom-text'] = function  ( settings, col ) {
	return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		return $('input', td).val();
	} );
};

/**
 * Read information from a column of input (type text) elements and return an
 * array to use as a basis for sorting - treat values as dates.
 *
 *  @summary Sorting based on the values of `dt-tag input` elements in a column.
 *  @name Input element data source - treat values as dates
 *  @requires DataTables 1.10+
 *  @author [Rik Lewis](http://www.tribalgroup.com)
 */

$.fn.dataTable.ext.order['dom-text-date'] = function  ( settings, col ) {
	return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		return sits_date_to_atom($('input', td).val());
	} );
};

/**
 * Read information from a column of text nodes and return an
 * array to use as a basis for sorting - treat text as dates.
 *
 *  @summary Sorting based on the values of text nodes in a column.
 *  @name Text node data source - treat text as dates
 *  @requires DataTables 1.10+
 *  @author [Rik Lewis](http://www.tribalgroup.com)
 */

$.fn.dataTable.ext.order['date'] = function  ( settings, col ) {
	return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
		return sits_date_to_atom($(td).text());
	} );
};