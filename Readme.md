# Typescript Math Toolkit Expression Engine

The Typescript function parser provided elsewhere in my repos dates back to some old C++ code.  A JS version, btw, is also available in the Javascript Math Toolkit.  In 2016, I had need to parse and evaluate more general expressions across a mix of numeric, string, and boolean values.  So, I stared working on an extension of the function parser code base.

The TSMT expression engine allows general expressions to be parsed and then evaluated with either numeric, string, and/or boolean values for the independent variables.  The expression returns either a number, string, or boolean (although the latter is by far the most common).

My initial use case for an expression engine was a lightweight rules engine.  Expressions may also be used to dynamically evaluate what parts of a UI to show, for example, based on either formulas returned from a server (and independent variables from a data object) or those computed on-the-fly as a user interacts with an application.

This version of the engine was created by extending the function parser code base.  My current belief is that a refactor is in order before a formal release to the toolkit.  The current implementation, however, is useful as I have already built a lightweight rules engine on top of a modified version of this code for a client.

And, just for completeness, I will mention that there really isn't anything new under the sun; the fundamentals of how this and similar codes work [are described here].


Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

Typescript: 2.3.2

Version: 1.0


## Installation

Installation involves all the usual suspects

  - npm and gulp installed globally
  - Clone the repository
  - npm install
  - get coffee (this is the most important step)


### Building and running the tests

1. gulp compile

2. gulp test

The test suite is in Mocha/Chai and specs reside in the _test_ folder.

### Overview

Consider a very simple expression, _x + 1_.  This could be interpreted as a math formula and evaluated for numerical values of the independent variable, _x_.  So, the expression for an input, _x = 1_, evaluates to a value of 2.0.  But, what if _x_ is a _string_?  We would expect a value of _x = 'abc'_ to result in an evaluation of _'abc1'_.

Now, what about _x + 1 < y_ where both _x_ and _y_ are independent variables that could take on either _string_ and/or numeric values?  The result would depend on the input type as coercion to string invokes a lexicographic comparison vs. a simpler numeric comparison for inputs of type _number_.

The first principle of the TSMT Expression Engine is that independent variables and the output of an expression may be a _number_, _string_, or _boolean_ value.  The engine attempts to evaluate the expression to a reasonable result based in input type(s).

The following numeric and boolean operations are supported in the engine: _+, -, *, /, <=, >=, <, >, and =_

The following math functions are supported: _abs_, _ceil_, _floor_, _max_, _min_, _round_

It is possible to check if a _string_ is contained in a list (array) of _strings_, i.e.

"x ~ [ab, cd, efg]" or "x ~ [1, 2, 3]"

The independent variable, _x_ should be a _string_ and the list of strings to check against should be inside brackets and without quotes.  This expression evaluates to a boolean.

It is possible to check against a string literal.  Currently, the literal should be to the right of a comparison operator, i.e. "x = 'abc'".  This checks _string_ values of the independent variable, _x_ agains the literal, 'abc' and returns a boolean.

There is currently no enforcement of order of operations, so make liberal use of parentheses to make expressions unambiguous, especially when using combinations of numeric and boolean operations. For example, "(2\*x) < (3\*y - 2)". Refer to the specs in the _test_ folder for more examples.

In applications, I tend to enforce some order of operations when building expressions, since it is easier to insert proper parentheses at that time.  This requirement may be relaxed in a future release.


### Public API

The _TSMT$ExpressionEngine_ class contains the following public methods.


```
set variables(vars: Array<string>)
clear(): void
parse(str: string): boolean
get stack(): Array<string>
eval(variableList: Array<string>, variables: Array<expressionOperand>, stack: Array<string>): expressionValue
evaluate(variables: Array<expressionOperand>): expressionValue
```

### Usage

Typical usage of the _TSMT$ExpressionEngine_ class involves:

1 - Define the list of independent variable, i.e. ['X', 'COLOR', 'LIMIT']

2 - Input an expression involving these variables into the parser (check the return for success)

3 - Evaluate the expression for a list of actual values for each independent variable (in the order defined)

The list of independent variables may be provided at construction or input later with a mutator.

Always call the _clear()_ method before parsing a new expression.

It is possible to access a copy of the expression stack after parsing and then evaluate an expression using the saved stack at a later point in an application.  I have personally found this feature very useful in rule engines.


**Examples**

Evaluate the expression, "x + y" where both _x_ and _y_ are _string_ variables.

```
const expression: TSMT$ExpressionEngine = new TSMT$ExpressionEngine()
expression.variables = ["x", "y"];

let success: boolean = expression.parse( "x + y" );
expect(success).to.be.true;

let value: expressionValue = expression.evaluate(['a', 'b']);

expect(<string> value).to.equal('ab');

value = expression.evaluate(['DFW', 'SFO'])
expect(<string> value).to.equal('DFWSFO');
```

Evaluate the expression,  "(2\*x + 1) - (3\*y - 2)" after having evaluated the expression in the above example.  _x_ and _y_ are _number_ variables.

```
expression.clear();
expression.variables = ["x", "y"];

success = expression.parse( "(2*x + 1) - (3*y - 2)" );
expect(success).to.be.true;

value = expression.evaluate([0, 0]);
expect(<number> value).to.equal(3);

value = expression.evaluate([1, 1])
expect(<number> value).to.equal(2);

value = expression.evaluate([-2, 3])
expect(<number> value).to.equal(-10);
```

Refer to the specs in the _test_ folder for more usage examples.


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <http://algorithmist.net>
[are described here]: <https://en.wikipedia.org/wiki/Binary_expression_tree>

