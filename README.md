# figdash

CSS `border-style: dashed`가 Figma 디자인과 다르게 렌더링될 때,  
SVG + pseudo element 방식으로 정확하게 구현하는 경량 플러그인입니다.

---

## CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/유저명/figdash@latest/dashedBorder.css">
<script src="https://cdn.jsdelivr.net/gh/유저명/figdash@latest/dashedBorder.js"></script>
```

---

## 사용법

### A. data attribute 자동 감지 (권장)

```html
<div data-dashed="#EA0A2A" data-dash="2 2" data-stroke="2">
    ...
</div>

<script>
DashedBorder.auto();
</script>
```

| attribute | 설명 | 기본값 |
|---|---|---|
| `data-dashed` | stroke 색상 (HEX) | `#000000` |
| `data-dash` | dashArray | `2 2` |
| `data-stroke` | stroke 두께 | `2` |

---

### B. 선택자 직접 지정

```html
<script>
DashedBorder.init([
    {
        selector: '.target_wrap',
        color: '#EA0A2A',
        options: { strokeWidth: 2, dashArray: '2 2' }
    },
    {
        selector: '.another_wrap',
        color: '#797979',
        options: { strokeWidth: 1, dashArray: '4 3' }
    }
]);
</script>
```

---

## API

| 메서드 | 설명 |
|---|---|
| `DashedBorder.auto()` | `data-dashed` 요소 자동 감지 및 적용 |
| `DashedBorder.init(targets)` | 선택자 직접 지정 방식 |
| `DashedBorder.refresh()` | 수동 재실행 (탭/아코디언 등 display:none 요소 대응) |
| `DashedBorder.destroy()` | 이벤트 정리 (SPA/ajax 환경) |

---

## 주의사항

- `border-radius` 단위(px, rem, vw 등)는 자동으로 px 변환되어 처리됩니다.
- 4방향 radius가 다른 경우 자동으로 SVG `<path>`로 처리됩니다.
- 내부에 swiper / canvas / 직접 z-index 설계가 있는 경우  
  `dashedBorder.css`의 `[data-dashed] > *` 규칙을 제거하고 해당 요소에 z-index를 직접 지정하세요.
- IE 대응 필요 시 `Object.assign` / `forEach` / CSS variable 폴리필을 추가하세요.

---

## License

MIT
