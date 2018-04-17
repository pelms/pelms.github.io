// Defines the speed of animations in milliseconds (ms).
// The strings "fast" (200ms) and "slow" (600ms) can also be used.
// Default value is 100.
var sits_anim_speed = 100;

// Defines the point at which the year "20" is treated as 1920 instead of 2020.
// This should be the same as the assignment file setting $CENTURY_BREAK.
// Default value is 20.
var sits_century_break = 20;

// Defines whether or not a Content Delivery Network (CDN) should be used (added in 870.1).
// Using one can speed up the performance, especially for users in other countries.
// Default value is 0.
// Valid values:
//   0 = Use local files (no CDN)
//   1 = jQuery CDN - provided by MaxCDN (the official jQuery one)
//   2 = Google API CDN - provided by Google (generally considered to be fastest and most popular)
//   3 = Microsoft Ajax CDN - provided by Microsoft
//   4 = Cloud Flare CDN - provided by Cloud Flare
var sits_jquery_cdn = 0;

// Defines the format of dates selected by a date picker (added in 870.1)
// This must be compatible with the system National Language Support (NLS) settings
// See jQuery UI website for syntax details - http://api.jqueryui.com/datepicker/#utility-formatDate
// Default value is "dd/M/yy", ie: "01/Jan/2001".
var sits_date_format = "dd/M/yy"
// GB / UK =
// var sits_date_format = "d M yy";
// CA (Canada) =
// var sits_date_format = "yy-mm-dd";
// US (USA) =
// var sits_date_format = "M d, yy";

// Defines the format of times using &D notation (added in 871.1)
// This must be compatible with the system National Language Support (NLS) settings
// Default value is "H2:N2", ie: 09:30
var sits_time_format = "H2:N2";

// Defines the alternative text for date picker buttons (added in 880.1)
// Default value is "..."
var sits_button_text = "...";

// Defines the maximum file size for a file being uploaded using the plupload plugin (added in 880.1)
// Default value is "10mb"
var sits_plupload_max_size = "10mb";

// Defines the chunk size for files being uploaded using the plupload plugin (added in 880.1)
// Default value is "2mb"
var sits_plupload_chunk_size = "2mb";

// Load minified Javascript plugin files where possible (added in 880.1)
// Used for plugins: datatables, migrate, menu, chosen and sitsjqtimetable
var sits_use_minified = true;

// Defines the year range available in the date picker (added in 880.1)
// See jQuery UI website for syntax details - http://api.jqueryui.com/datepicker/#option-yearRange
// Default value is "-100:+50", ie: 100 years before and 50 years after current year
var sits_year_range = "-100:+50";

// Defines the responsive breakpoints to use in e:Vision in situations where those defined in the stylesheet cannot be used (added in 910.1)
// This includes, for example, those used by the Responsive extension for Datatables (as used throughout e:Vision), and should normally match those maximums defined in sv.css.
// It takes the form of an object listing each breakpoint, and should include maximum values (in pixels) for the width that should apply for Large (lg), Medium (md), Small (sm) and Extra Small (xs) screensizes
var sits_breakpoints = {"lg": Infinity, "md": 1199, "sm": 991, "xs": 767};

// Defines whether to automatically apply e:Vision table widgets (Datatables and Tablesaw) to tables when the relevant HTML5 data attributes are specified
// Added in 910.1 - accepts true or false (to enable or disable respectively)
var sits_auto_table_widgets = true;

// Defines whether DataTables should use their responsive mode (if available) by default. This applies when the responsive mode isn't explicitly set for a particular table (if it was then it would override this setting)
// Added in 910.1 - accepts true or false (to enable or disable respectively)
var sits_datatable_responsive = true;

// Defines any scale factors to apply to dialogs (produced by sits_dialog) for each breakpoint. For example, if a dialog is normally 40% of the screen width for the Large (lg)
// breakpoint then we could use a scale factor of 2 to make it 80% at the medium breakpoint. It consists of an object listing factors for each breakpoint, but no dialog will ever be
// more than 100% of the screen-width. Added in 910.1.
var sits_dialog_scaling = {"lg": 1, "md": 1.1, "sm": 1.5, "xs": 3};

// Defined whether the height of a dialog should, by default, by limited to be no more than a certain percentage of the screen height at each breakpoint. For example, the default of
// 0.95 would mean that the dialogs will be initially shown at no more than 95% of the height of the page (i.e. will fit on screen), and 10 would mean that they can be 10 times the height of the screen. You can
// use "" to disable the limit for a particular breakpoint.
// It consists of an object listing maximum ratios for each breakpoint. Added in 910.1
var sits_dialog_height = {"lg": 0.95, "md": 0.95, "sm": "", "xs": ""};

// Defines whether certain actions should happen automatically on screen resize (including dialog re-positioning and rescaling). Added in 910.1 - accepts true (to always process as the screen resizes - default), and false (to disable)
var sits_auto_resize = true;

// Defines whether to use the sv-portal.css stylesheet when showing multiple columns in the portal. The stylesheet overrides certain breakpoints when showing container options in
// content mode, which can improve the look and feel of the content on some screen sizes, and will only be loaded when needed. Added in 910.1 - accepts true or false (to enable or disable respectively, with true the default)
var sits_use_portal_css = true;

// Defines the minimum size for tabs to be resized to in pixels (added in 920.1)
// Default value is 150.
var sits_min_tab_width = 150;