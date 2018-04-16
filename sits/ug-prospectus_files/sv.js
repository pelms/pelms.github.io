/* ========================================================================
 * Bootstrap: alert.js v3.3.0
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-sv-dismiss="sv-alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.0'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-sv-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.sv-alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('sv-in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('sv-fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.0
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $(this.options.trigger).filter('[href="#' + element.id + '"], [data-sv-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.0'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true,
    trigger: '[data-sv-toggle="sv-collapse"]'
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('sv-width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('sv-in')) return

    var activesData
    var actives = this.$parent && this.$parent.find('> .sv-panel').children('.sv-in, .sv-collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('sv-collapse')
      .addClass('sv-collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('sv-collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('sv-collapsing')
        .addClass('sv-collapse sv-in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('sv-in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('sv-collapsing')
      .removeClass('sv-collapse sv-in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('sv-collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('sv-collapsing')
        .addClass('sv-collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('sv-in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-sv-toggle="sv-collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('sv-in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('sv-collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-sv-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-sv-toggle="sv-collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-sv-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $.extend({}, $this.data(), { trigger: this })

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.0
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.sv-dropdown-backdrop'
  var toggle   = '[data-sv-toggle="sv-dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.0'

  Dropdown.prototype.toggle = function (e) {

    var $this = $(this)

    if ($this.is('.sv-disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('sv-open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.sv-navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="sv-dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return
      
      var docWidth = $(document).width();

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('sv-open')
        .trigger('shown.bs.dropdown', relatedTarget)
        
      var $menu = $parent.children("ul");
      if($menu.length==1 && $menu.hasClass("sv-dropdown-menu")) {
        var menuWidth = $menu.offset().left+$menu.outerWidth();
        if(docWidth<menuWidth) { //check if space not available
          $menu.css("left",(docWidth-menuWidth)+"px"); //move left to fit
        }
      }
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.sv-disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('sv-open')

    if ((!isActive && e.which != 27) || (isActive && e.which == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' > li:not(.sv-divider):visible > a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)
    if (!$items.length) return

    var index = $items.index(e.target)
    if (e.which == 38 && index > 0)                 index--                        // up
    if (e.which == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('sv-open')) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('sv-open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-sv-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }

  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.sv-dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="menu"]', Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '[role="listbox"]', Dropdown.prototype.keydown)

    // SUBMENUS
    .on("click","li.sv-dropdown-submenu",function(evt) { //stop click on submenu parents...
      return evt.target.closest("li")!==this; //...but not the rest of the submenu items
    })
    .on("mouseenter","li.sv-dropdown-submenu",function(evt) { //position submenu to left or right
      var par = $(this).addClass("sv-open");
      par.children("a").attr("aria-expanded",true);
      var men = par.find("ul");
      var pos = (men.offset().left+men.width() > $(window).width() ? -men.width() : $(this).closest("ul").width());
      men.css({left:pos});
    })
    .on("mouseleave","li.sv-dropdown-submenu",function(evt) { //position submenu reset
      var par = $(this).removeClass("sv-open");
      par.children("a").attr("aria-expanded",false);
      par.find("ul").css({left:""});
    })
    .on("keydown","li.sv-dropdown-submenu a",function(evt) { //keyboard navigation
      if(!/(38|40|27|32|39|37)/.test(evt.which)) { //up|down|escape|space|right|left
        return;
      }
      var $this = $(this);
      evt.preventDefault();
      evt.stopPropagation();
      if($this.is(".sv-disabled,:disabled")) { //check if menu item is disabled
        return;
      }
      var $parent = $this.closest("li.sv-dropdown"); //find parent menu item
      var isActive = $parent.hasClass("sv-open");
      if((!isActive && evt.which!=27) || (isActive && evt.which==27)) { //inactive and not escape, or active and escape
        if(evt.which==27) {
          var $submenu = $this.closest("ul"); //find menu
          var $subparent = $submenu.closest("li"); //find parent menu item
          if($subparent.length==1) {
            $subparent.removeClass("sv-open"); //hide submenu
            $subparent.children("a").attr("aria-expanded",false).trigger("focus"); //focus on parent menu item
            $submenu.css({left:""}); //position submenu reset
            return;
          }
        }
        return $this.trigger("click"); //trigger click event
      }
      if(evt.which==39) { //move right
        var $subparent = $this.closest("li"); //find current menu item
        var $submenu = $subparent.find("ul"); //find submenu
        if($submenu.length==1) {
          $subparent.addClass("sv-open"); //show submenu
          $subparent.children("a").attr("aria-expanded",true);
          var pos = ($submenu.offset().left+$submenu.width() > $(window).width() ? -$submenu.width() : $this.closest("ul").width());
          $submenu.css({left:pos}); //position submenu to left or right
          var $subitems = $submenu.children("li:not(.sv-divider):visible").children("a"); //get submenu items
          if($subitems.length>0) {
            $subitems.eq(0).trigger("focus"); //focus on first submenu item
          }
          return;
        }
      }
      if(evt.which==37) { //move left
        var $submenu = $this.closest("ul"); //find menu
        var $subparent = $submenu.closest("li"); //find parent menu item
        if($subparent.length==1 && $subparent.hasClass("sv-dropdown-submenu")) { //check if submenu
          $subparent.removeClass("sv-open"); //hide submenu
          $subparent.children("a").attr("aria-expanded",false).trigger("focus"); //focus on parent menu item
          $submenu.css({left:""}); //position submenu reset
          return;
        }
      }
      var $items = $this.closest("ul").children("li:not(.sv-divider):visible").children("a"); //get all menu items
      if($items.length<1) {
        return; //no menu items
      }
      var index = $items.index(evt.target); //position of menu item which triggered event
      if(evt.which==38 && index>0) {
        index--; //up
      }
      if(evt.which==40 && index<$items.length-1) {
        index++; //down
      }
      if(!~index) {
        index = 0; //first
      }
      $items.eq(index).trigger("focus"); //focus on menu item
    })
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.0
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

// Copyright 2014-2015 Twitter, Inc.
// Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
// Fix viewport issues in IE10 for Windows 8 and Windows Phone 8 - as detailed http://getbootstrap.com/getting-started/#support-ie10-width
+function () {
  'use strict';
	if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
  	var msViewportStyle = document.createElement('style')
  	msViewportStyle.appendChild(
    	document.createTextNode(
      	'@-ms-viewport{width:auto!important}'
    	)
  	)
  	document.querySelector('head').appendChild(msViewportStyle)
	}
}();
