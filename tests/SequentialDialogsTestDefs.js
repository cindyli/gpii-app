/*
 * GPII Sequential Dialogs Integration Test Definitions
 *
 * Copyright 2017 OCAD University
 *
 * Licensed under the New BSD license. You may not use this file except in
 * compliance with this License.
 *
 * The research leading to these results has received funding from the European Union's
 * Seventh Framework Programme (FP7/2007-2013)
 * under grant agreement no. 289016.
 *
 * You may obtain a copy of the License at
 * https://github.com/GPII/universal/blob/master/LICENSE.txt
 */

"use strict";

var fluid = require("infusion"),
    jqUnit = fluid.require("node-jqunit", require, "jqUnit"),
    gpii = fluid.registerNamespace("gpii");

require("../src/main/app.js");

fluid.registerNamespace("gpii.tests.sequentialDialogs.testDefs");

var noInternetErrorFixture = {
    title:   "No Internet connection",
    subhead: "There seem to be a problem your Internet connectivity",
    details: "Have you tried turning it off and on again? If the problem is still present, contact GPII Technical Support.",
    btnLabel1: "Ok",
    fatal: false
};

var keyInErrorFixture = {
    title:   "Cannot Key In",
    subhead: "There might be a problem with the user you are trying to use",
    details: "You can try keying in again. If the problem is still present, contact GPII Technical Support.",
    btnLabel1: "Ok",
    fatal: false
};

var surveyDialogFixture = {
    url: "https://fluidproject.org/",
    window: {
        width: 500,
        height: 700,
        resizable: true,
        closable: true,
        minimizable: false,
        maximizable: true
    }
};

gpii.tests.sequentialDialogs.testNoQueuedDialogs = function (dialogManager) {
    jqUnit.assertEquals("There are no dialogs in the queue",
        0,
        dialogManager.errorQueue.queue.length);
};

gpii.tests.sequentialDialogs.testDefs = {
    name: "Sequential dialogs integration tests",
    expect: 5,
    config: {
        configName: "gpii.tests.dev.config",
        configPath: "tests/configs"
    },
    gradeNames: ["gpii.test.common.testCaseHolder"],
    sequence: [{
        func: "{that}.app.dialogManager.show",
        args: ["error", noInternetErrorFixture]
    }, { // The error dialog is shown automatically as it is the only one.
        event: "{that gpii.app.errorDialog}.events.onDialogShown",
        listener: "jqUnit.assertLeftHand",
        args: [
            "The no internet error dialog is now shown",
            noInternetErrorFixture,
            "{that}.app.dialogManager.errorQueue.queue.0"
        ]
    }, { // Try to show a second error dialog.
        func: "{that}.app.dialogManager.show",
        args: ["error", keyInErrorFixture]
    }, {
        func: "jqUnit.assertLeftHand",
        args: [
            "The currently displayed dialog is not changed",
            noInternetErrorFixture,
            "{that}.app.dialogManager.error.dialog.options.config.params"
        ]
    }, { // It will not be shown immediately.
        func: "jqUnit.assertLeftHand",
        args: [
            "The key in error dialog options were added to the queue",
            keyInErrorFixture,
            "{that}.app.dialogManager.errorQueue.queue.1"
        ]
    }, { // Only after the first error dialog is hidden...
        func: "{that}.app.dialogManager.error.dialog.hide"
    }, { // ...will the second be eligible for showing.
        event: "{that gpii.app.error}.events.onDialogCreate",
        listener: "jqUnit.assertLeftHand",
        args: [
            "The key in error dialog is now the first element in the queue",
            keyInErrorFixture,
            "{arguments}.0"
        ]
    }, { // Then try to show a survey dialog.
        func: "{that}.app.dialogManager.show",
        args: ["survey", surveyDialogFixture]
    }, { // It will be shown immediately.
        event: "{that gpii.app.surveyDialog}.events.onSurveyCreated",
        listener: "jqUnit.assert",
        args: ["Both the survey dialog and the key-in error dialogs are shown"]
    }]
};
