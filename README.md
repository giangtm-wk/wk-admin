# WkAdmin

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.9.

## Development
src/
├── app/
│   ├── core/                # Cấu hình, guard, interceptor, base services
│   ├── shared/              # Component, pipe, directive tái sử dụng
│   ├── features/            # Các module tính năng (lazy-load)
│   ├── layouts/             # MainLayout, AuthLayout
│   ├── app.config.ts        # Config cho App
│   └── app.routes.ts        # Config route
├── assets/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── main.ts

### Develop with AI
```text
https://angular.dev/ai/develop-with-ai
```

### Getting Started with ESLint
```shell
npm init @eslint/config@latest
```
```text
✔ What do you want to lint? · javascript
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · none
✔ Does your project use TypeScript? · Yes
✔ Where does your code run? · browser
✔ Which language do you want your configuration file be written in? · ts
ℹ Jiti is required for Node.js <24.3.0 to read TypeScript configuration files.
✔ Would you like to add Jiti as a devDependency? · Yes
ℹ The config that you've selected requires the following dependencies:

eslint, @eslint/js, globals, typescript-eslint, jiti
✔ Would you like to install them now? · Yes
✔ Which package manager do you want to use? · npm
```
```shell
npm install -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @angular-eslint/template-parser
```

### Pre-commit with Husky, Lint-staged, Prettier
```shell
npm install --save-dev husky #https://typicode.github.io/husky/get-started.html
npm install --save-dev lint-staged #https://github.com/lint-staged/lint-staged
npm install --save-dev --save-exact prettier #https://prettier.io/
```

#### Husky init
```shell
npx husky init
```
#### Note
```text
If a .editorconfig file is in your project, Prettier will parse it and convert its properties to the corresponding Prettier configuration. This configuration will be overridden by .prettierrc, etc.
```

