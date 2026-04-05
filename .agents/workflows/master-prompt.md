---
description: Master Prompt - Step-by-step workflow for complex tasks in Antigravity
---
# Master Prompt for Google Antigravity

Follow this systematic approach for executing complex developer tasks.

## 1. Analyze & Plan
- Review the current workspace and file structure using `ls -R` or `list_dir`.
- Understand the existing code patterns to ensure consistency.
- **Create an Implementation Plan Artifact**: Detail your findings, proposed approach, and clear TODOs. Use `request_feedback = true` to get approval before execution.

## 2. Execute (Iterative Implementation)
- Break down the task into logical components.
- Implement file-by-file with precision, using either `write_to_file` for new files or `replace_file_content` for existing ones.
- **Update Task Artifact**: Track progress as each component is finished.
- Ensure all imports and dependencies are correctly referenced.

## 3. Verify & Refine
- Verify the code against the requested tech stack (e.g., React, Tailwind, Spring Boot).
- Ensure UI elements are responsive across mobile and desktop.
- Run necessary tests or build commands (if available) to check for errors.

## 4. Final Review
- **Generate a Walkthrough Artifact**: Summarize all changes, new dependencies, and provide clear instructions on how the user can test the new functionality.
- Include media or screenshots/recordings if the task involved UI changes.
