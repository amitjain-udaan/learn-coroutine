# Project Rules

## Stack

- This repository contains two projects:
  - `frontend/`: Angular frontend project.
  - `kotlin-app/`: Kotlin backend or library project.
- Use Node.js 22.
- Prefer Node.js `22.22.3` or newer in the Node 22 line for Angular 22 compatibility.
- Use Angular 21.x and PrimeNG 21.x as the current stable frontend pair.
- Use Angular 22.x as the next target Angular version when PrimeNG 22 has a stable release.
- Use PrimeNG 22.x when a stable PrimeNG 22 release is available.
- Until PrimeNG 22 is stable, use Angular 21.x with PrimeNG 21.x for a stable matching pair.
- Use TypeScript and RxJS versions from Angular's official compatibility table for the chosen Angular major.
- Use PrimeNG for UI components.
- Prefer Angular standalone components unless the project is explicitly structured with NgModules.
- Keep implementation component-focused first.
- Use Java 21 for the Kotlin project.
- Use Maven for Kotlin project package/dependency management and builds.
- Use Kotlin 2.4.x for the Maven Kotlin project.
- Use JUnit Jupiter 5.12.x for Kotlin tests unless Maven Surefire is upgraded with it.

## Project Boundaries

- Keep Angular frontend code and Kotlin code in separate project directories.
- Keep Angular frontend code in `frontend/`.
- Keep Kotlin code in `kotlin-app/`.
- Do not mix frontend dependencies into the Kotlin Maven project.
- Do not mix Kotlin, Java, or Maven build files into the Angular project.
- Run project-specific build, test, and dependency commands from the relevant project directory.

## Layout

- The application should include a persistent sidebar and top bar.
- Navigation, page shell, and repeated chrome should be built as reusable Angular components.
- Keep the first screen as the usable application interface, not a marketing landing page.

## UI Rules

- Use PrimeNG components for controls, menus, overlays, tables, forms, buttons, and layout primitives where available.
- Do not hand-roll UI controls when PrimeNG already provides an appropriate component.
- Use PrimeIcons for iconography.
- Keep styling consistent, restrained, and application-focused.
- Avoid nested cards and decorative-only layout elements.

## Component Rules

- Build reusable components before adding page-specific duplication.
- Keep component APIs small and explicit with `@Input()` and `@Output()` where needed.
- Keep business logic out of templates when it belongs in TypeScript.
- Keep CSS scoped to the component unless a style is truly global.

## Code Quality

- Follow existing project conventions once the Angular app is scaffolded.
- Use typed TypeScript and avoid `any` unless there is a clear reason.
- Prefer Angular reactive forms for non-trivial forms.
- Add focused tests when behavior is shared, complex, or user-facing.

## Workflow

- Before changing implementation files, inspect the existing project structure.
- Preserve unrelated user changes.
- Verify changes with the project’s available build, lint, or test commands when possible.
- Re-check Angular and PrimeNG compatibility before installing dependencies or upgrading versions.
- Whenever code changes introduce or modify project conventions, architecture, dependencies, layout patterns, or workflow expectations, update this `AGENTS.md` file in the same change.
- If the user requests a change that contradicts rules in this `AGENTS.md` file, explain the contradiction, suggest the closest rule-compatible approach, and get the user's consent before making the change.
