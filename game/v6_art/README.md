# HẠ LONG NGỮ TIÊN — Character art v6

**Output:** `/workspace/game/v6_art/`  
**Official look (3 heroes):** `/workspace/game/v6_characters_for_media.md`  
**Boss + BG:** art brief (Hỗn Ngữ · Vịnh Hạ Long 9:16)  
**Tool:** GenerateImage (cost 0) + rembg cutouts · style: tu tiên / xianxia anime of the media silhouettes

## Deliverables

| File | Notes |
|------|--------|
| `linh_ho_portrait.jpg` | Fox ears+tail · peach cut-vest · fan + reception bell |
| `linh_ho_battle.png` | Transparent · heal cast (fan/bell) |
| `kiem_khach_portrait.jpg` | Tour jacket · shades · «HL» bars flag · folding sword · red sash |
| `kiem_khach_battle.png` | Transparent · Z-slash combo |
| `thiet_ve_portrait.jpg` | Stocky tank · apron · hammer · welding-helmet shield |
| `thiet_ve_battle.png` | Transparent · shield counter + orange rim |
| `hon_ngu_portrait.jpg` | Boss · broken-glyph aura (kept pre-spec) |
| `hon_ngu_battle.png` | Transparent |
| `bg_ha_long.jpg` | Karst bay 9:16 |
| `preview_all.jpg` | Contact sheet |
| `*_battle_raw.jpg` | Pre-cutout sources |

Superseded drafts: `_superseded_pre_spec/`

## Spec alignment (heroes)

- **Linh Hồ:** peach `#FF8FB8` · cream · auburn · fox ears/tail · cut-vest + name-tag · pleated skirt · knee socks · silk fan + bell  
- **Kiếm Khách:** bay blue `#1E90C6` · gold `#FFD91F` · ink · red belt · tour jacket · cargo · sneakers · folding sword · shades on head  
- **Thiết Vệ:** steel · orange `#FF7A18` · oil green · apron · gloves · boots · welding-helmet shield + hammer  

## Assumptions / QA notes

1. Media spec is CSS/SVG geometry; art is **anime render** of those silhouettes (not literal SVG).  
2. Name-tags / flag bars are blank or abstract (no readable Latin/Hanzi gibberish).  
3. Linh Hồ battle raw briefly had `+HP` game-FX labels (matches skill visual); rembg may clip soft particles.  
4. Boss + BG not redefined in media character file → kept from art brief.  
5. rembg: Linh Hồ + Kiếm Khách via bria-rmbg; Thiết Vệ + Hỗn Ngữ via u2net (OOM safety).  

Deadline media note in spec: 06:30 30/10 Asia/Saigon · this pack for art handoff.

## Game pack copy
Also copied battle sprites → `/workspace/game/v6/art/{linh_ho,kiem_khach,thiet_ve}.png` (transparent).

## Director QA 30/10 ~04:36 Asia/Saigon
- **Thiết Vệ redrawn** as textile-mill worker: fabric-roll/beam shield, thread spools, factory uniform; no welding mask. Portrait + battle overwritten; welder drafts in `_superseded_pre_spec/`.
- **Linh Hồ battle** particles restored via rembg+alpha-matting + chroma particle composite from raw (mint leaves, gold ring, +HP, sparkles); pink-bg haze cleared.
- Game pack overwrite: `/workspace/game/v6/art/thiet_ve.png`, `linh_ho.png` (RGBA 720×1280).
