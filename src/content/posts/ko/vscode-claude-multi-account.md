---
title: "VS Code에서 Claude Code 계정 여러 개 쓰기 (Windows)"
description: "VS Code 프로필 하나에 Claude 계정 하나를 짝지어, 프로젝트 폴더마다 계정을 자동으로 나눠 쓰는 방법이에요. 설정을 한 번에 끝내는 .bat 스크립트도 올려뒀어요."
date: 2026-10-29T15:19:00+09:00
lang: ko
category: devlog
tags: [ClaudeCode, VSCode, Windows, 개발환경]
---

VS Code에서 Claude Code 계정을 여러 개 쓰는 방법이에요. 매번 `/logout`, `/login`을 반복하지 않아도 **프로젝트 폴더를 열면 알아서 맞는 계정으로 동작해요.**

핵심은 **VS Code 프로필 하나에 Claude 계정 하나**를 짝짓는 거예요. 계정 수에는 제한이 없고, 여러 창을 동시에 열어 둬도 각 창이 자기 계정으로 동작해요.

| 계정 | VS Code 프로필 | Claude 설정 폴더 |
|---|---|---|
| A계정 | Default | `%USERPROFILE%\.claude` (기본값, 설정 없음) |
| B계정 | `b` | `%USERPROFILE%\.claude-b` |
| C계정 | `c` | `%USERPROFILE%\.claude-c` |

가장 많이 쓰는 계정은 Default 프로필에 그대로 두고, 나머지 계정만 프로필을 추가하면 돼요.

## 원리

- Claude Code는 로그인 정보, 설정, 메모리를 **설정 폴더**에 저장해요. 기본 폴더는 `%USERPROFILE%\.claude`예요.
- 환경변수 `CLAUDE_CONFIG_DIR`로 이 폴더를 바꿀 수 있어요. 폴더가 다르면 계정도 달라요.
- VS Code 확장은 `claudeCode.environmentVariables` 설정으로 이 환경변수를 넘겨줘요.
- 사용자 설정은 모든 창에 적용되니까 **VS Code 프로필**로 나눠요. 프로필마다 사용자 설정이 따로 있고, VS Code는 폴더마다 어느 프로필로 열었는지 기억해요.

```
프로젝트 폴더 → VS Code 프로필 → 프로필 사용자 설정 → CLAUDE_CONFIG_DIR → Claude 계정
```

### 주의: 워크스페이스 설정은 무시돼요

이 설정은 `"scope": "machine"`이라서 프로젝트의 `.vscode/settings.json`에 넣으면 **오류도 없이 그냥 무시돼요.** 반드시 사용자 설정에 넣어야 적용돼요. 그래서 프로필로 나누는 방식을 써요.

이 방식에는 이런 특징이 있어요.

- **어떤 계정을 쓸지는 그 창의 프로필이 정해요.** 같은 폴더도 다른 프로필로 열면 다른 계정이 돼요.
- 프로젝트 파일에는 아무것도 남지 않아서 git에 올라갈 걱정이 없어요.
- 대신 설정이 그 컴퓨터의 VS Code에만 있어서, 다른 컴퓨터에서는 다시 설정해야 해요.

## 빠른 설정 (스크립트)

아래 스크립트를 실행하면 설정이 한 번에 끝나요.

**[claude-multi-account.zip 다운로드](/blog/files/claude-multi-account.zip)** (`setup-claude-account.bat`, `setup-claude-account.ps1`)

> `.bat`은 같은 폴더의 `.ps1`을 실행하는 껍데기라서, 압축을 푼 폴더 그대로 두고 실행해야 해요. 실행 전에 메모장으로 열어서 내용을 한 번 확인해보시는 걸 추천해요.

미리 필요한 건 VS Code 설치뿐이고, VS Code는 열려 있어도 돼요.

1. `setup-claude-account.bat`을 더블클릭해요.
   - 그 계정으로 쓸 프로젝트 폴더를 `.bat` 위로 끌어다 놓으면 폴더 연결까지 같이 해줘요. 여러 개를 놓아도 돼요.
2. **프로필 영문명**을 입력해요. 예: `b`
   - 영문, 숫자, `-`, `_`만 쓸 수 있어요.
   - VS Code 프로필 `b`와 Claude 설정 폴더 `%USERPROFILE%\.claude-b`가 짝지어져요.
3. 그 프로필 창에서 Claude 패널을 열고 `/login`으로 해당 계정에 로그인해요.
4. `/status`로 계정을 확인해요.

계정을 더 추가하려면 같은 `.bat`을 다시 실행해서 다른 이름을 입력하면 돼요.

### 스크립트가 하는 일

1. 입력한 이름의 VS Code 프로필이 없으면 만들어요. 이때 새 창이 열려요.
2. 그 프로필에 Claude Code 확장을 설치해요.
3. 프로필 **사용자 설정**에 `CLAUDE_CONFIG_DIR`를 넣어요. 기존 파일은 `settings.json.bak`으로 백업해요.
4. 넘겨받은 폴더를 그 프로필로 열어요. VS Code가 이 연결을 기억해요.

여러 번 실행해도 안전해요. 이미 된 단계는 건너뛰어요.

> 스크립트로 새로 만든 프로필에는 **Claude Code 확장만** 들어가요. 다른 확장이나 설정까지 Default에서 가져오고 싶다면, 먼저 VS Code에서 `Profiles: New Profile` → **Copy from: Default**로 같은 이름의 프로필을 만든 다음 스크립트를 실행하세요.

PowerShell에서 직접 실행할 수도 있어요. 이 경우 이름을 묻지 않고 바로 진행해요.

```powershell
.\setup-claude-account.ps1 -ProfileName b "D:\project\foo" "D:\project\bar"
# 설정 폴더를 다른 곳에 두려면
.\setup-claude-account.ps1 -ProfileName b -ConfigDir "D:\claude-cfg\b"
```

## 수동 설정

스크립트를 쓰지 않고 직접 하려면 이렇게 하면 돼요.

1. **A계정**: Default 프로필에서 평소처럼 로그인해요. 따로 설정할 건 없어요.
2. **프로필 만들기**: 그 계정으로 쓸 프로젝트를 열고 `Ctrl+Shift+P` → `Profiles: New Profile`을 실행해요. 이름은 예를 들어 `b`, **Copy from: Default**를 선택해요.
3. **설정 넣기**: 그 프로필 상태에서 `Ctrl+Shift+P` → `Preferences: Open User Settings (JSON)`을 실행하고 아래 항목을 추가해요.
   ```json
   "claudeCode.environmentVariables": [
       { "name": "CLAUDE_CONFIG_DIR", "value": "C:\\Users\\<윈도우사용자명>\\.claude-b" }
   ]
   ```
   - 사용자명은 PowerShell에서 `$HOME`을 입력하면 확인할 수 있어요.
   - JSON 안에서 백슬래시는 `\\`로 두 번 써야 해요.
   - 실제 파일 위치는 `%APPDATA%\Code\User\profiles\<프로필ID>\settings.json`이에요.
4. **적용**: `Developer: Reload Window` → `/login` → `/status`로 확인해요.
5. **다른 프로젝트 연결**: 폴더를 열고 좌측 하단 톱니바퀴 → 프로필 → `b`를 선택해요. 폴더마다 한 번만 하면 돼요.

## 주의할 점

- `/logout`은 **그 창의 계정만** 로그아웃해요. 엉뚱한 계정을 로그아웃하지 않도록 창의 프로필을 확인하고 실행하세요.
- 설정 폴더는 계정마다 완전히 별개예요. 메모리, 전역 `CLAUDE.md`, `settings.json`, MCP 설정이 계정마다 따로 관리돼요.
