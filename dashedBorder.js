/*!
 * figdash - DashedBorder.js v2.0
 * CSS border-style:dashed가 Figma 디자인과 다를 때
 * SVG + pseudo element 방식으로 dashed border를 정확하게 구현하는 플러그인
 *
 * GitHub  : https://github.com/유저명/figdash
 * CDN CSS : https://cdn.jsdelivr.net/gh/유저명/figdash@latest/dashedBorder.css
 * CDN JS  : https://cdn.jsdelivr.net/gh/유저명/figdash@latest/dashedBorder.js
 *
 * -------------------------------------------------------
 * [사전 준비] dashedBorder.css를 함께 include
 *
 * -------------------------------------------------------
 * [사용법 A] data attribute 자동 감지 (권장)
 *
 *    HTML:
 *    <div data-dashed="#EA0A2A" data-dash="2 2" data-stroke="2">...</div>
 *
 *    JS:
 *    <script src="dashedBorder.js"></script>
 *    <script>
 *    DashedBorder.auto();
 *    </script>
 *
 * -------------------------------------------------------
 * [사용법 B] 선택자 직접 지정
 *
 *    <script src="dashedBorder.js"></script>
 *    <script>
 *    DashedBorder.init([
 *        {
 *            selector: '.target_wrap',
 *            color: '#EA0A2A',
 *            options: { strokeWidth: 2, dashArray: '2 2' }
 *        }
 *    ]);
 *    </script>
 *
 * -------------------------------------------------------
 * [탭/아코디언 등 display:none 요소 대응]
 *    DashedBorder.refresh();
 *
 * [정리 - SPA/ajax 환경]
 *    DashedBorder.destroy();
 *
 * -------------------------------------------------------
 * [주의사항]
 * - IE 대응 필요 시 Object.assign / forEach / CSS variable 폴리필 추가 필요
 * - 내부에 swiper / canvas / 직접 z-index 설계가 있는 경우
 *   dashedBorder.css의 [data-dashed] > * 규칙 제거 후 해당 요소에 직접 지정
 * -------------------------------------------------------
 */

(function(global) {

    var _targets       = [];
    var _resizeHandler = null;

    function parseBorderRadius(el) {
        var style = window.getComputedStyle(el);
        return {
            tl: parseFloat(style.borderTopLeftRadius)     || 0,
            tr: parseFloat(style.borderTopRightRadius)    || 0,
            br: parseFloat(style.borderBottomRightRadius) || 0,
            bl: parseFloat(style.borderBottomLeftRadius)  || 0
        };
    }

    function buildRoundedRectSVG(w, h, radius, color, strokeWidth, dashArray) {
        var tl = radius.tl, tr = radius.tr, br = radius.br, bl = radius.bl;
        var sw = strokeWidth;
        var o  = sw / 2;
        var isSame = (tl === tr && tr === br && br === bl);
        var shapeTag;

        if (isSame) {
            shapeTag = [
                "<rect",
                    " x='" + o + "'",
                    " y='" + o + "'",
                    " width='"  + (w - sw) + "'",
                    " height='" + (h - sw) + "'",
                    " rx='" + tl + "'",
                    " fill='none'",
                    " stroke='" + color + "'",
                    " stroke-width='" + sw + "'",
                    " stroke-dasharray='" + dashArray + "'",
                "/>"
            ].join('');
        } else {
            var x1 = o,     y1 = o;
            var x2 = w - o, y2 = h - o;
            var d = [
                "M", (x1 + tl), y1,
                "L", (x2 - tr), y1,
                "Q", x2, y1, x2, (y1 + tr),
                "L", x2, (y2 - br),
                "Q", x2, y2, (x2 - br), y2,
                "L", (x1 + bl), y2,
                "Q", x1, y2, x1, (y2 - bl),
                "L", x1, (y1 + tl),
                "Q", x1, y1, (x1 + tl), y1,
                "Z"
            ].join(' ');

            shapeTag = [
                "<path",
                    " d='" + d + "'",
                    " fill='none'",
                    " stroke='" + color + "'",
                    " stroke-width='" + sw + "'",
                    " stroke-dasharray='" + dashArray + "'",
                "/>"
            ].join('');
        }

        return "<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'>"
            + shapeTag
            + "</svg>";
    }

    function applyToElement(el, color, opts) {
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        if (w === 0 || h === 0) return;

        var radius = parseBorderRadius(el);
        var svg    = buildRoundedRectSVG(w, h, radius, color, opts.strokeWidth, opts.dashArray);

        el.style.setProperty(
            '--dashed-border-svg',
            "url(\"data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg) + "\")"
        );
    }

    function applyDashedBorder(selector, color, options) {
        var opts     = Object.assign({ strokeWidth: 2, dashArray: '2 2' }, options);
        var elements = document.querySelectorAll(selector);
        if (!elements.length) return;

        elements.forEach(function(el) {
            applyToElement(el, color, opts);
        });
    }

    function update() {
        _targets.forEach(function(target) {
            applyDashedBorder(target.selector, target.color, target.options);
        });
    }

    function debounce(fn, delay) {
        var timer;
        return function() {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        };
    }

    function registerResize() {
        if (_resizeHandler) {
            window.removeEventListener('resize', _resizeHandler);
        }
        _resizeHandler = debounce(update, 100);
        window.addEventListener('resize', _resizeHandler);
    }

    // [사용법 B] 선택자 직접 지정
    function init(targets) {
        _targets = targets;
        registerResize();
        update();
    }

    // [사용법 A] data attribute 자동 감지
    // <div data-dashed="#EA0A2A" data-dash="2 2" data-stroke="2">
    function auto() {
        var elements = document.querySelectorAll('[data-dashed]');
        if (!elements.length) return;

        var targets = [];
        elements.forEach(function(el) {
            var color  = el.getAttribute('data-dashed') || '#000000';
            var dash   = el.getAttribute('data-dash')   || '2 2';
            var stroke = el.getAttribute('data-stroke') || '2';

            var dashedId = el.getAttribute('data-dashed-id');
            if (!dashedId) {
                dashedId = 'db_' + Math.random().toString(36).slice(2, 7);
                el.setAttribute('data-dashed-id', dashedId);
            }

            applyToElement(el, color, {
                strokeWidth: parseFloat(stroke),
                dashArray: dash
            });

            targets.push({
                selector: '[data-dashed-id="' + dashedId + '"]',
                color: color,
                options: { strokeWidth: parseFloat(stroke), dashArray: dash }
            });
        });

        _targets = targets;
        registerResize();
    }

    // 수동 재실행 (탭/아코디언 등 display:none 요소 대응)
    function refresh() {
        update();
    }

    // 정리 (SPA/ajax 환경)
    function destroy() {
        if (_resizeHandler) {
            window.removeEventListener('resize', _resizeHandler);
            _resizeHandler = null;
        }
        _targets = [];
    }

    global.DashedBorder = {
        init: init,
        auto: auto,
        refresh: refresh,
        destroy: destroy
    };

}(window));
