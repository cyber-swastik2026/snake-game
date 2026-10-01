# Snake Quest

A colorful Snake game with 16 modes (Classic, Walls, No borders, Portal, Poison, Statue, Twin, Peaceful, Key, Sokoban, Light, Minesweeper, Magnet, Cheese, Shield, Arrow), a full settings panel (fruit, mode, apples, speed, board size, snake color, theme), sound, fullscreen and touch controls. Plain HTML/CSS/JS - no build step.

## Controls
| Action | Keys / input |
|---|---|
| Move | Arrow keys, W A S D, swipe, on-screen D-pad (🎮 button) |
| Play / Replay | SPACE |
| Pause / Resume | P or Esc |

## Run locally
`npx serve .` then open the shown URL (or just open `index.html` through any local server; ES modules need http).

## Push to GitHub (GitHub Desktop)
File -> Add Local Repository -> choose this folder (or "Create New Repository") -> Commit to main -> Publish repository.

## Deploy on Vercel
1. vercel.com -> Log in with GitHub.
2. Add New -> Project -> Import your repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty.
4. Deploy. Every `git push` redeploys automatically.
