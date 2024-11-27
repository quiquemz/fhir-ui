# DfPdmsUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.8.

## Prerequisites

Before you can run the application, you must have the following installed on your machine:

- [Node.js](https://nodejs.org/en/download/)
- [Angular CLI](https://angular.io/cli)
- [QUiquemz Cortex](https://cortex-web-angular.quiquemz.io/readme)

## Development Server

To start the development server, run `ng serve`. Once started, navigate to `http://localhost:4200/` to view the application. The server will automatically reload when any changes are made to the source files.

By default, the application runs with the `--configuration=local` setting, which connects to the local PDMS API (typically hosted at `http://localhost:8081/api`). Other available configurations include `dev`, `qa`, `sbx`, and `fhir`. To use a different configuration, add the `--configuration` flag to the command.

The `dev`, `qa`, and `sbx` configurations use their respective deployed versions of the PDMS API. However, the `fhir` configuration requires a local FHIR infrastructure to be running.

For example:

- To run the application with the `dev` configuration:
    ```bash
    ng serve --configuration=dev
    ```

- To run the application with the `qa` configuration:
    ```bash
    ng serve --configuration=qa
    ```

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
