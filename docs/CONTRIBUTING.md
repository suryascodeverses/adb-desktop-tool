# Contributing Guide

## Code Structure
- electron/ : Main & preload
- next/ : UI
- adb/ : Core logic
- shared/ : Types

## Rules
- Do not run ADB from renderer
- Keep IPC contracts typed
- Device is source of truth

## Workflow
- Create feature branch
- Commit with clear messages
- Open pull request
