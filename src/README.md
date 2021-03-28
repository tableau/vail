Source code directories:

* *api*: API to VAIL used by the outside world
    * *command*: instructions to the engine on how to work with the intent model
    * *dataSemantics*: metadata about a data source
    * *engine*: interface for editing intent, resolving ambiguity, and generating output
    * *spec*: VAIL specifications describing intent, output, etc.
* *app*: convenience routines for building an app around VAIL
* *converters*: conversion from a VAIL OutputSpec to something else
    * *vegaLite*: convert a VAIL OutputSpec to a vega-lite spec
* *engine*: the VAIL engine, where the interesting stuff happens
  * *edit*: editing intent; intent + command -> new intent
  * *infer*: infer missing or ambiguous intent; intent + data source semantics -> new intent
  * *output*: suggesting effective output; intent + data source semantics -> output spec
* *examples*: examples of VAIL specs and commands
* *test*: tests in a directory structure that matches the src directory
* *view*: specialized React widgets
    * *vegaLiteViz*: widget that displays a vega-lite spec
