var parallaxjs = function parallaxjs(options) {
  this.options = options;
};

parallaxjs.prototype = {
  items: [],
  active: true,

  setStyle: function setStyle(item, value) {
    if (item.modifiers.centerX) value += ' translateX(-50%)';

    var el = item.el;
    var prop = 'Transform';
    el.style["webkit" + prop] = value;
    el.style["moz" + prop] = value;
    el.style["ms" + prop] = value;
  },
  add: function add(el, binding) {
    var values = binding.expression.split(',');
    var speed = values[0];
    var minvalue = values.length > 1 ? parseFloat(values[1]) : undefined;
    var up = values.length > 2 ? values[2] : undefined;
    var arg = binding.arg;
    var style = el.currentStyle || window.getComputedStyle(el);

    if (style.display === 'none') return;

    var height = binding.modifiers.absY ? window.innerHeight : el.clientHeight || el.offsetHeight || el.scrollHeight;
    this.items.push({
      el: el,
      initialOffsetTop: el.offsetTop + el.offsetParent.offsetTop - parseInt(style.marginTop),
      style: style,
      speed: speed,
      arg: arg,
      up: up,
      minvalue: minvalue,
      modifiers: binding.modifiers,
      clientHeight: height,
      count: 0
    });
  },
  move: function move() {
    var _this = this;

    if (!this.active) return;
    if (window.innerWidth < this.options.minWidth || 0) {
      this.items.map(function (item) {
        _this.setStyle(item, 'translateY(' + 0 + 'px) translateZ(0px)');
      });

      return;
    }

    var scrollTop = window.scrollY || window.pageYOffset;
    var windowHeight = window.innerHeight;
    var windowWidth = window.innerWidth;

    this.items.map(function (item) {
      if (item && item.minvalue > scrollTop) 
        return;
      var pos = scrollTop + windowHeight;
      var elH = item.clientHeight;

      pos = pos - elH / 2;
      pos = pos - windowHeight / 2;
      pos = pos * item.speed;

      var offset = item.initialOffsetTop;
      offset = offset * -1;
      offset = offset * item.speed;
      pos = pos + offset;

      pos = pos.toFixed(2);

      var direction = item.up === "'up'" ? -1 : 1;
      // item.count++
      _this.setStyle(item, 'translateY(' + direction*pos + 'px)');
    });
  }
};

export default {
  install: function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var p = new parallaxjs(options);

    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        p.move(p);
      });
    }, { passive: true });
    window.addEventListener('resize', function () {
      requestAnimationFrame(function () {
        p.move(p);
      });
    }, { passive: true });

    Vue.prototype.$parallaxjs = p;
    window.$parallaxjs = p;
    Vue.directive('parallax', {
      bind: function bind(el, binding) {},
      inserted: function inserted(el, binding) {
        p.add(el, binding);
        p.move(p);
      }
    });
  }
};
