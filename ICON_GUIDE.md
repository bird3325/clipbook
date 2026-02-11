# ClipBook AI 아이콘 관리 가이드

이 문서는 ClipBook AI 익스텐션의 아이콘을 관리하고 교체하는 방법을 설명합니다.

## 1. 아이콘 위치
모든 아이콘 파일은 `public/icons/` 폴더 내에 위치해야 합니다.

## 2. 권장 규격 (PNG 형식)
익스텐션의 정상적인 표시를 위해 다음 세 가지 크기의 아이콘이 필요합니다.

| 파일명 | 크기 (px) | 용도 |
| :--- | :--- | :--- |
| `icon16.png` | 16 x 16 | 확장 프로그램 페이지의 파비콘 |
| `icon48.png` | 48 x 48 | 확장 프로그램 관리 페이지 표시 |
| `icon128.png` | 128 x 128 | 크롬 웹스토어 및 설치 중 표시 |

## 3. 아이콘 교체 방법
1. 새로운 아이콘 파일들을 준비합니다.
2. `public/icons/` 폴더에 기존 파일들을 덮어씁니다.
3. 크롬 브라우저의 `chrome://extensions` 페이지에서 ClipBook AI 익스텐션의 **새로고침(↻)** 아이콘을 클릭합니다.

## 4. Manifest 설정 정보
`manifest.json`에서 아이콘 경로는 다음과 같이 설정되어 있습니다.

```json
"icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
},
"action": {
    "default_icon": "icons/icon48.png"
}
```
