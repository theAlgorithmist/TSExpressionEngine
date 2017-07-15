/**
 * Copyright 2016 Jim Armstrong (www.algorithmist.net)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
var TSMT$ExpressionEngine = (function () {
    /**
     * Create a new expression engine
     *
     * @param variables : Array<string> Optional array of independent variables, i.e. ['x'], ['x', 'y'], ['s', 't']  Setting the
     * variables array may be deferred to post-construction.  Use the class-supplied mutator to assign the list of independent
     * variables before expression evaluation.
     *
     * @return Nothing
     */
    function TSMT$ExpressionEngine(variables) {
        // symbolic names for operators converted to stack functions
        this.ADD = "add";
        this.DIVIDE = "div";
        this.MAX = "max";
        this.MIN = "min";
        this.MULTIPLY = "mul";
        this.SUBTRACT = "sub";
        this.LESS_THAN = "lt";
        this.LESS_THAN_EQUAL = "le";
        this.EQUAL = "eq";
        this.NOT_EQUAL = "ne";
        this.GREATER_THAN = "gt";
        this.GREATER_THAN_EQUAL = "ge";
        this.AND = "and";
        this.OR = "or";
        this.CONTAINS = "contains";
        this.NEGATE = "negate";
        // sort of a grammar ... sort of
        this.CHARACTERS = "abcdefghijklmnopqrstuwvxzyABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.NUMBERS = "0123456789.";
        this.MATH_OPERATORS = "+-/^*";
        this.OPERATORS = this.MATH_OPERATORS + "(),|&<>=~!"; // anything we will allow to follow a variable or precede in the case of negation
        this.BOOLEAN = ['&&', '||'];
        this.COMPARE = ['<', '>', '<=', '>=', '=', '!='];
        this.TWO_CHAR_OPS = ['&&', '||', '<=', '>=', '!='];
        this.UNARY = "+-*/^,(";
        this.OP_LIST_1 = "^*+,/)";
        this.OP_LIST_2 = "^*+-,/)";
        this.OP_LIST_3 = "^*+-,/(";
        this.OP_LIST_4 = "^*+,/(";
        // single- and two-argument functions
        this.ONE_ARG_FUNCTIONS = ["abs", "ceil", "floor", "round", this.NEGATE];
        this.TWO_ARG_FUNCTIONS = [this.ADD, this.DIVIDE, this.MAX, this.MIN, this.MULTIPLY, this.SUBTRACT, this.LESS_THAN, this.LESS_THAN_EQUAL,
            this.EQUAL, this.NOT_EQUAL, this.GREATER_THAN, this.GREATER_THAN_EQUAL, this.AND, this.OR, this.CONTAINS];
        // token types
        this.NONE = "none";
        this.IS_ONE_ARG_FUNCTION = "fun1";
        this.IS_TWO_ARG_FUNCTION = "fun2";
        this.IS_LETTER = "let";
        this.IS_NUMBER = "num";
        this.IS_VARIABLE = "var";
        this.IS_OPERATOR = "op";
        this.IS_CONSTANT = "c";
        this.IS_COMPARE = "comp";
        this.IS_BOOLEAN = "bool";
        this.IS_QUOTE = "quote";
        this.IS_STR_LITERAL = "str";
        this.IS_ARRAY = "arr";
        this.IS_BRACKET = "bracket";
        this.IS_NONE = "n";
        // for parsing
        this.LEFT_PAREN = "(";
        this.RIGHT_PAREN = ")";
        this.LEFT_BRACKET = "[";
        this.RIGHT_BRACKET = "]";
        this.COMMA = ",";
        this.MINUS = "-";
        this.PLUS = "+";
        this.MULTIPLICATION = "*";
        this.DIVISION = "/";
        this.QUOTE = "'";
        this.BOOLEAN_AND = "&&";
        this.BOOLEAN_OR = "||";
        this.COMPARE_LT = "<";
        this.COMPARE_GT = ">";
        this.COMPARE_LE = "<=";
        this.COMPARE_GE = ">=";
        this.COMPARE_EQ = "=";
        this.COMPARE_NE = "!=";
        this.CONTAINED_IN = "~";
        this.NEGATION = "!";
        this._variables = variables == null || variables.length == 0 ? ["x"] : variables.slice();
        this._tokenValue = this.NONE;
        this._tokenType = this.NONE;
        this._tokenLength = 0;
        this._expressionStack = new Array();
    }
    // stack functions
    TSMT$ExpressionEngine.prototype.abs = function (x) {
        return typeof x === "number" ? Math.abs(x) : false;
    };
    TSMT$ExpressionEngine.prototype.add = function (x, y) {
        // addition is a bit more complicated because of the mix of argument types
        if (typeof x === "number" && typeof y === "number") {
            return x + y;
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x + y;
        }
        else if (typeof x === "string" && typeof y === "number") {
            return x + y.toString();
        }
        else if (typeof x === "number" && typeof y === "string") {
            return x.toString() + y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.ceil = function (x) {
        return typeof x === "number" ? Math.ceil(x) : false;
    };
    TSMT$ExpressionEngine.prototype.div = function (x, y) {
        return typeof x === "number" && typeof y === "number" ? x / y : false;
    };
    TSMT$ExpressionEngine.prototype.floor = function (x) {
        return typeof x === "number" ? Math.floor(x) : false;
    };
    TSMT$ExpressionEngine.prototype.max = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return Math.max(x, y);
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x < y ? y : x;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.min = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return Math.min(x, y);
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x < y ? x : y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.mul = function (x, y) {
        return typeof x === "number" && typeof y === "number" ? x * y : false;
    };
    TSMT$ExpressionEngine.prototype.round = function (x) {
        return typeof x === "number" ? Math.round(x) : false;
    };
    TSMT$ExpressionEngine.prototype.sub = function (x, y) {
        return typeof x === "number" && typeof y === "number" ? x - y : false;
    };
    TSMT$ExpressionEngine.prototype.lt = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return x < y;
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x < y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.le = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return x <= y;
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x <= y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.eq = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return x == y;
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x == y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.ne = function (x, y) {
        if (typeof x === "number" && typeof y === "number") {
            return x != y;
        }
        else if (typeof x === "string" && typeof y === "string") {
            return x != y;
        }
        else {
            return false;
        }
    };
    TSMT$ExpressionEngine.prototype.gt = function (x, y) {
        if (typeof x === "number" && typeof y === "number")
            return x > y;
        else if (typeof x === "string" && typeof y === "string")
            return x > y;
        else
            return false;
    };
    TSMT$ExpressionEngine.prototype.ge = function (x, y) {
        if (typeof x === "number" && typeof y === "number")
            return x >= y;
        else if (typeof x === "string" && typeof y === "string")
            return x >= y;
        else
            return false;
    };
    TSMT$ExpressionEngine.prototype.and = function (x, y) {
        return typeof x === "boolean" && typeof y === "boolean" ? x && y : false;
    };
    TSMT$ExpressionEngine.prototype.or = function (x, y) {
        return typeof x === "boolean" && typeof y === "boolean" ? x || y : false;
    };
    TSMT$ExpressionEngine.prototype.contains = function (x, y) {
        // a comma should only be used as a delimiter, so searching the second argument is faster than breaking into an array
        return y.indexOf(x) != -1 ? true : false;
    };
    TSMT$ExpressionEngine.prototype.negate = function (x) {
        if (typeof x === "number") {
            return x == 0 ? true : false;
        }
        else if (typeof x === "string") {
            return x == "" ? true : false;
        }
        else {
            return !x;
        }
    };
    Object.defineProperty(TSMT$ExpressionEngine.prototype, "variables", {
        /**
         * Assign independent variables
         *
         * @param vars: Array<string> New independent variables names (single names with no spaces)
         *
         * @return Nothing.
         */
        set: function (vars) {
            this._variables = vars == null || vars.length == 0 ? ["x"] : vars.slice();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clear the parser and prepare for new data
     *
     * @return Nothing.  Call parse() to parse a new function followed by evaluate() for one or more function evaluations.  This is only truly necessary if making
     * a change in the function's independent variable list before a parse.
     */
    TSMT$ExpressionEngine.prototype.clear = function () {
        this._variables.length = 0;
        this._expressionStack.length = 0;
        // restore the default 'x' variable
        this._variables.push('x');
    };
    /**
     * Parse an expression and prepare it for evaluation
     *
     * @param str : String - Representation of expression such as "x || (y < 2)" .
     *
     * @return Boolean - True if parsing was successful.  The expression must be parsed before evaluation.  Input errors result in no parsed result and the
     * expression may not be evaluated.
     *
     * Note:  Any prior function stack is overwritten
     */
    TSMT$ExpressionEngine.prototype.parse = function (str) {
        var trimStr = this.__trim(str);
        // check basic errors
        if (trimStr == "") {
            return false;
        }
        if (!this.__validateChars(trimStr)) {
            return false;
        }
        if (!this.__validateParentheses(trimStr)) {
            return false;
        }
        if (!this.__validateTokens(trimStr)) {
            return false;
        }
        var processed = this.__processTokens(trimStr);
        if (processed == "") {
            return false;
        }
        this._expressionStack.length = 0;
        // cache expression stack for future evaluations
        this.__createExpressionStack(processed);
        return true;
    };
    Object.defineProperty(TSMT$ExpressionEngine.prototype, "stack", {
        /**
         * Access the expression stack
         *
         * @return Array<string> Copy of the expression stack (call after parsing) for advanced applications
         */
        get: function () {
            return this._expressionStack.slice();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Evaluate an expression from a variable list and a pre-parsed expression stack.  This is often used for caching of
     * multiple expression stacks for simultaneous evaluations in rules engines.
     *
     * @param variableList: Array<string> Array of independent variable names
     *
     * @param variables: Array<expressionOperand> Corresponding values of each independent variable
     *
     * @param stack: Array<string> Pre-parsed expression stack
     *
     * @returns expressionValue Value of the evaluated expression based on input variable values
     */
    TSMT$ExpressionEngine.prototype.eval = function (variableList, variables, stack) {
        if (stack.length == 0) {
            return false;
        }
        if (variables.length != variableList.length) {
            return false;
        }
        var len = variables.length;
        var j;
        for (j = 0; j < len; ++j) {
            if (!this.__isValidOperand(variables[j]))
                return false;
        }
        var token = "";
        var tokenType = "";
        var opStack = new Array();
        var arg1;
        var arg2;
        var i;
        var f;
        i = 0;
        while (i < stack.length) {
            // in reverse order, type is before value
            tokenType = stack[i];
            token = stack[i + 1];
            switch (tokenType) {
                case this.IS_NUMBER:
                    opStack.push(parseFloat(token));
                    break;
                case this.IS_ONE_ARG_FUNCTION:
                    arg1 = opStack.pop();
                    f = this[token]; // access the function with the provided name, i.e. abs()
                    if (f == undefined) {
                        return false; // unsupported function
                    }
                    opStack.push(f(arg1));
                    break;
                case this.IS_TWO_ARG_FUNCTION:
                    arg1 = opStack.pop();
                    arg2 = opStack.pop();
                    f = this[token];
                    if (f == undefined) {
                        return false;
                    }
                    opStack.push(f(arg1, arg2));
                    break;
                case this.IS_VARIABLE:
                    for (j = 0; j < len; ++j) {
                        if (token == variableList[j]) {
                            opStack.push(variables[j]);
                        }
                    }
                    break;
                case this.IS_STR_LITERAL:
                    opStack.push(token.toString());
                    break;
                case this.IS_ARRAY:
                    opStack.push(token.toString());
                    break;
                default:
                    return false; // invalid token
            }
            i += 2;
        }
        return opStack[0];
    };
    /**
     * Evaluate previously parsed expression
     *
     * @param variables : Array<expressionOperand> Independent variable values. Example: Independent variables are 's' and 't'.
     * evaluate( [1.7, 2.5] ) evaluates the numerical expression at s = 1.7 and t = 2.5.
     *
     * @return expressionValue - Expression value of false if there is an error during function evaluation.  Most common errors
     * are not parsing an expression before evaluation and mismatch between variable list and input values.
     */
    TSMT$ExpressionEngine.prototype.evaluate = function (variables) {
        if (this._expressionStack.length == 0) {
            return false;
        }
        if (variables.length != this._variables.length) {
            return false;
        }
        var len = variables.length;
        var j;
        for (j = 0; j < len; ++j) {
            if (!this.__isValidOperand(variables[j]))
                return false;
        }
        var token = "";
        var tokenType = "";
        var opStack = new Array();
        var arg1;
        var arg2;
        var i;
        var f;
        i = 0;
        while (i < this._expressionStack.length) {
            // in reverse order, type is before value
            tokenType = this._expressionStack[i];
            token = this._expressionStack[i + 1];
            switch (tokenType) {
                case this.IS_NUMBER:
                    opStack.push(parseFloat(token));
                    break;
                case this.IS_ONE_ARG_FUNCTION:
                    arg1 = opStack.pop();
                    f = this[token]; // access the function with the provided name, i.e. abs()
                    if (f == undefined) {
                        return false; // unsupported function
                    }
                    opStack.push(f(arg1));
                    break;
                case this.IS_TWO_ARG_FUNCTION:
                    arg1 = opStack.pop();
                    arg2 = opStack.pop();
                    f = this[token];
                    if (f == undefined) {
                        return false;
                    }
                    opStack.push(f(arg1, arg2));
                    break;
                case this.IS_VARIABLE:
                    for (j = 0; j < len; ++j) {
                        if (token == this._variables[j]) {
                            opStack.push(variables[j]);
                        }
                    }
                    break;
                case this.IS_STR_LITERAL:
                    opStack.push(token.toString());
                    break;
                case this.IS_ARRAY:
                    opStack.push(token.toString());
                    break;
                default:
                    return false; // invalid token
            }
            i += 2;
        }
        return opStack[0];
    };
    /**
     * Type guard for an expression operand
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isValidOperand = function (x) {
        if (x == null || x == undefined) {
            return false;
        }
        if (typeof x === "number") {
            // allowable number?
            return !isNaN(x) && isFinite(x);
        }
        else {
            // only thing left are strings and booleans
            return typeof x === "string" || typeof x === "boolean";
        }
    };
    /**
     * Create an expression stack for later processing
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__createExpressionStack = function (str) {
        // easier to process LTR and then reverse than process RTL
        var len = str.length;
        var position = 0;
        var token = "";
        var tokenType = "";
        var tokenLength = 0;
        var start;
        var end;
        this._expressionStack.length = 0;
        while (position < len) {
            token = this.__nextToken(str, position);
            tokenType = this.__getTokenType(token);
            tokenLength = token.length;
            if (!(tokenType == this.IS_NONE)) {
                if (tokenType == this.IS_CONSTANT ||
                    tokenType == this.IS_NUMBER ||
                    tokenType == this.IS_VARIABLE ||
                    tokenType == this.IS_STR_LITERAL ||
                    tokenType == this.IS_ONE_ARG_FUNCTION ||
                    tokenType == this.IS_TWO_ARG_FUNCTION) {
                    this._expressionStack.push(token);
                    this._expressionStack.push(tokenType);
                    // now, we have to hack - the code structure was already in place before contains was added.  in this case, push in the function and argument list before proceeding
                    if (token == this.CONTAINS) {
                        start = str.indexOf(this.LEFT_PAREN, position);
                        end = str.indexOf(this.RIGHT_PAREN, start);
                        var args = str.substring(start + 1, end);
                        var i = args.indexOf(",");
                        // first element is the variable name
                        this._expressionStack.push(args.substring(0, i));
                        this._expressionStack.push(this.IS_VARIABLE);
                        // remainder is the comma-delimited list for comparison
                        this._expressionStack.push(args.substr(i + 1, args.length));
                        this._expressionStack.push(this.IS_ARRAY);
                    }
                }
            }
            else {
                return;
            }
            if (token == this.CONTAINS) {
                position = end + 1;
            }
            else {
                position += tokenLength;
            }
        }
        // easier to process in reverse order
        this._expressionStack = this._expressionStack.reverse();
    };
    /**
     * process all tokens; errors cause blank string to be returned
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__processTokens = function (str) {
        // adding a negative is the same as subtracting, so +- is replaced with -
        var myStr = str;
        myStr = myStr.replace("/\+-/g", this.MINUS);
        // unary minus becomes SUBTRACT(0,argument)
        myStr = this.__processUnaryMinus(myStr);
        // remaining operators - process >= and <= before >, <, or =
        myStr = this.__processOperator(myStr, this.DIVISION);
        myStr = this.__processOperator(myStr, this.MULTIPLICATION);
        myStr = this.__processOperator(myStr, this.MINUS);
        myStr = this.__processOperator(myStr, this.PLUS);
        myStr = this.__processOperator(myStr, this.BOOLEAN_AND);
        myStr = this.__processOperator(myStr, this.BOOLEAN_OR);
        myStr = this.__processOperator(myStr, this.COMPARE_NE);
        myStr = this.__processOperator(myStr, this.COMPARE_LE);
        myStr = this.__processOperator(myStr, this.COMPARE_GE);
        myStr = this.__processOperator(myStr, this.COMPARE_EQ);
        myStr = this.__processOperator(myStr, this.COMPARE_GT);
        myStr = this.__processOperator(myStr, this.COMPARE_LT);
        myStr = this.__processOperator(myStr, this.CONTAINED_IN);
        myStr = this.__processOperator(myStr, this.NEGATION);
        if (!this.__validateParentheses(myStr)) {
            return "";
        }
        return myStr;
    };
    /**
     * process unary minus operator - same as a SUBTRACT operation with zero as the first argument
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__processUnaryMinus = function (str) {
        var myStr = str;
        // can't have no minus sign at all
        if (myStr.indexOf(this.MINUS) == -1) {
            return myStr;
        }
        // can't have it the very end, either
        if (myStr.charAt(str.length - 1) == this.MINUS) {
            return "";
        }
        var i = 0;
        var j = 0;
        var len = myStr.length;
        for (i = 0; i < len; ++i) {
            if (myStr.charAt(i) == this.MINUS && this.__isUnary(myStr.charAt(i - 1))) {
                j = this.__getForwardArgument(myStr, i);
                if (j == -1) {
                    return "";
                }
                myStr = myStr.substring(0, i) + this.SUBTRACT + "(0," + myStr.substring(i + 1, j) + this.RIGHT_PAREN + myStr.substring(j, myStr.length);
            }
        }
        return myStr;
    };
    /**
     * process operators with common logic
     */
    TSMT$ExpressionEngine.prototype.__processOperator = function (str, operator) {
        var myStr = str;
        var position = 0;
        var leftMarker = 0;
        var leftOperand = "";
        var rightMarker = 0;
        var rightOperand = "";
        if (myStr.indexOf(operator) == -1) {
            return myStr;
        }
        else if (myStr.indexOf(operator) == 0 && (operator != this.MINUS && operator != this.NEGATION)) {
            return "";
        }
        else if (myStr.charAt(myStr.length - 1) == operator) {
            return "";
        }
        else {
            while (myStr.indexOf(operator) != -1) {
                position = myStr.indexOf(operator);
                leftMarker = this.__getBackwardArgument(myStr, position);
                if (leftMarker == -1) {
                    // nothing to do
                    return "";
                }
                else {
                    // update left operand
                    leftOperand = myStr.substring(leftMarker, position);
                }
                // compensate for a two-character operator?
                if (this.TWO_CHAR_OPS.indexOf(operator) != -1) {
                    position++;
                }
                rightMarker = this.__getForwardArgument(myStr, position);
                if (rightMarker == -1) {
                    // nothing to do
                    return "";
                }
                else {
                    // update operand
                    rightOperand = myStr.substring(position + 1, rightMarker);
                }
                // check for string literal
                if (rightOperand.indexOf(this.QUOTE) != -1)
                    rightOperand = rightOperand.replace(/\'/g, "");
                // check for array list
                if (rightOperand.indexOf(this.LEFT_BRACKET) != -1) {
                    rightOperand = rightOperand.replace(this.LEFT_BRACKET, "");
                    rightOperand = rightOperand.replace(this.RIGHT_BRACKET, "");
                }
                // process arithmetic and boolean/compare operators
                switch (operator) {
                    case this.PLUS:
                        myStr = myStr.substring(0, leftMarker) + this.ADD + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.MINUS:
                        myStr = myStr.substring(0, leftMarker) + this.SUBTRACT + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.MULTIPLICATION:
                        myStr = myStr.substring(0, leftMarker) + this.MULTIPLY + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.DIVISION:
                        myStr = myStr.substring(0, leftMarker) + this.DIVIDE + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.BOOLEAN_AND:
                        myStr = myStr.substring(0, leftMarker) + this.AND + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.BOOLEAN_OR:
                        myStr = myStr.substring(0, leftMarker) + this.OR + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_EQ:
                        myStr = myStr.substring(0, leftMarker) + this.EQUAL + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_NE:
                        myStr = myStr.substring(0, leftMarker) + this.NOT_EQUAL + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_GE:
                        myStr = myStr.substring(0, leftMarker) + this.GREATER_THAN_EQUAL + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_GT:
                        myStr = myStr.substring(0, leftMarker) + this.GREATER_THAN + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_LE:
                        myStr = myStr.substring(0, leftMarker) + this.LESS_THAN_EQUAL + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.COMPARE_LT:
                        myStr = myStr.substring(0, leftMarker) + this.LESS_THAN + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.CONTAINED_IN:
                        myStr = myStr.substring(0, leftMarker) + this.CONTAINS + this.LEFT_PAREN + leftOperand + "," + rightOperand +
                            this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                    case this.NEGATION:
                        myStr = myStr.substring(0, leftMarker) + this.NEGATE + this.LEFT_PAREN + rightOperand + this.RIGHT_PAREN + myStr.substring(rightMarker, myStr.length + 1);
                        break;
                }
            }
            return myStr;
        }
    };
    /**
     * argument of something to the right of marked position
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__getForwardArgument = function (str, position) {
        var toRight = position + 1;
        var len = str.length;
        // character to immediate right of position marker
        var charToRight = str.charAt(position + 1);
        // compensate for leading minus
        if (charToRight == this.MINUS) {
            toRight++;
            if (toRight >= len) {
                // nothing left
                return -1;
            }
            else {
                charToRight = str.charAt(toRight);
            }
        }
        // check for [ indicating beginning of item list
        if (charToRight == this.LEFT_BRACKET) {
            return str.indexOf(this.RIGHT_BRACKET, toRight + 1) + 1;
        }
        // check for inline string literal
        if (charToRight == this.QUOTE) {
            return str.indexOf(this.QUOTE, toRight + 1) + 1;
        }
        // number?  If so, get next non-number
        if (this.__isNumber(charToRight)) {
            return this.__getNextNonNumber(str, toRight + 1);
        }
        else if (this.__isCharacter(charToRight)) {
            toRight = this.__getNextNonChar(str, toRight + 1);
            if (toRight == len - 1) {
                return toRight;
            }
            if (this.__isMathOperator(str.charAt(toRight))) {
                return toRight;
            }
            // open parent next?
            if (str.charAt(toRight) == this.LEFT_PAREN) {
                // find matching right paren
                toRight = this.__matchLeftParen(str, toRight);
            }
        }
        else if (charToRight == this.LEFT_PAREN) {
            // match the left paren
            toRight = this.__matchLeftParen(str, toRight);
        }
        else {
            return -1;
        }
        return toRight + 1;
    };
    /**
     * get the argument of something left of marked position
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__getBackwardArgument = function (str, position) {
        var charAtLeft = str.charAt(position - 1);
        var toLeft = position - 1;
        if (this.__isNumber(charAtLeft)) {
            while ((this.__isNumber(str.charAt(toLeft)) || str.charAt(toLeft) == ".") && toLeft >= 0) {
                toLeft--;
            }
        }
        else if (this.__isCharacter(charAtLeft)) {
            while (this.__isCharacter(str.charAt(toLeft)) && toLeft >= 0) {
                toLeft--;
            }
        }
        else if (charAtLeft == this.RIGHT_PAREN) {
            toLeft = this.__matchRightParen(str, toLeft);
            if (toLeft >= 0 && this.__isNumber(str.charAt(toLeft))) {
                return -1;
            }
            if (toLeft == 0 && str.charAt(toLeft) != this.MINUS && str.charAt(toLeft) != this.LEFT_PAREN) {
                return -1;
            }
            if (toLeft > 0 && this.__isCharacter(str.charAt(toLeft - 1))) {
                toLeft--;
                while (this.__isCharacter(str.charAt(toLeft)) && toLeft >= 0) {
                    toLeft--;
                }
            }
        }
        else {
            return -1;
        }
        return toLeft + 1;
    };
    /**
     * validate all tokens in a string
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__validateTokens = function (str) {
        var curPosition = 0;
        var count = 0;
        var len = str.length;
        // can't begin an expression with an operator, although a leading minus, negation, or open paren is okay
        var first = str.charAt(0);
        if (first != this.MINUS && first != this.LEFT_PAREN && first != this.NEGATION) {
            if (this.__isValidBeforeOrAfter(first)) {
                return false;
            }
        }
        var openParen = false; // identify an opening paren, (
        var openBracket = false; // identify an opening bracket, [
        var token;
        var tokenType;
        var tokenLength;
        var cp1;
        var prevChar;
        var firstAfterToken;
        var firstCharAfterToken;
        while (curPosition < len) {
            token = this.__nextToken(str, curPosition);
            tokenType = this.__getTokenType(token);
            tokenLength = token.length;
            if (tokenType != this.NONE) {
                cp1 = curPosition - 1;
                prevChar = curPosition == 0 ? "" : str.charAt(cp1);
                firstAfterToken = curPosition + tokenLength;
                firstCharAfterToken = str.charAt(firstAfterToken);
                if (tokenType == this.IS_ONE_ARG_FUNCTION) {
                    if (!(firstCharAfterToken == this.LEFT_PAREN)) {
                        return false;
                    }
                    if (curPosition > 0 && !(this.__isValidBeforeOrAfter(prevChar))) {
                        return false;
                    }
                    if (curPosition > 0 && prevChar == ")") {
                        return false;
                    }
                }
                if (tokenType == this.IS_VARIABLE) {
                    if (curPosition > 0 && !(this.__isValidBeforeOrAfter(prevChar))) {
                        return false;
                    }
                    if (curPosition > 0 && prevChar == ")") {
                        return false;
                    }
                    if (firstAfterToken < len && !(this.__isValidBeforeOrAfter(firstCharAfterToken))) {
                        return false;
                    }
                    if (firstAfterToken < len && firstCharAfterToken == "(") {
                        return false;
                    }
                }
                if (tokenType == this.IS_NUMBER) {
                    if (curPosition > 0 && !(this.__isValidBeforeOrAfter(prevChar))) {
                        return false;
                    }
                    if (curPosition > 0 && prevChar == ")") {
                        return false;
                    }
                    if (firstAfterToken < len && !(this.__isValidBeforeOrAfter(firstCharAfterToken))) {
                        return false;
                    }
                    if (firstAfterToken < len && firstCharAfterToken == this.LEFT_PAREN) {
                        return false;
                    }
                }
                if (token == this.LEFT_PAREN) {
                    if (firstAfterToken < len && this.OP_LIST_1.indexOf(firstCharAfterToken) != -1) {
                        return false;
                    }
                }
                if (token == this.RIGHT_PAREN) {
                    // if right paren does not close out complete expression ...
                    if (curPosition < len - 1) {
                        if (firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) == -1) {
                            // comparisons and booleans are allowed to follow the right paren
                            if (firstCharAfterToken != "|" && firstCharAfterToken != "&" && this.COMPARE.indexOf(firstCharAfterToken) == -1) {
                                return false;
                            }
                        }
                        if (cp1 >= 0 && this.OP_LIST_3.indexOf(prevChar) != -1) {
                            return false;
                        }
                    }
                }
                if (token == this.COMMA) {
                    if (curPosition == 0 || curPosition == len - 1) {
                        return false;
                    }
                    if (firstAfterToken < len && this.OP_LIST_2.indexOf(firstCharAfterToken) >= 0) {
                        return false;
                    }
                    if (cp1 >= 0 && this.OP_LIST_3.indexOf(prevChar) >= 0) {
                        return false;
                    }
                }
                if (this.MATH_OPERATORS.indexOf(token) != -1) {
                    if (this.OP_LIST_1.indexOf(firstCharAfterToken) != -1) {
                        return false;
                    }
                    if (this.OP_LIST_4.indexOf(prevChar) >= 0 && token != "-") {
                        return false;
                    }
                }
                if (token == this.QUOTE) {
                    // check end-quote for str. literal
                    openParen = !openParen;
                    if (openParen && str.indexOf(this.QUOTE, cp1) == -1) {
                        return false;
                    }
                }
                if (token == this.LEFT_BRACKET) {
                    // check closing bracket
                    openBracket = !openBracket;
                    if (openBracket && str.indexOf(this.RIGHT_BRACKET) == -1) {
                        return false;
                    }
                }
                if (token == this.NEGATION) {
                    // must have a variable (which starts with a valid character) after the negation operator or open paren
                    if (this.CHARACTERS.indexOf(firstCharAfterToken) == -1 && firstCharAfterToken != this.LEFT_PAREN)
                        return false;
                }
            }
            else {
                return false;
            }
            // the prior valuation was written before insertion of list-contain, so skip over everything inside brackets
            if (token == this.LEFT_BRACKET) {
                curPosition = str.indexOf(this.RIGHT_BRACKET) + 1;
            }
            else {
                // skip
                curPosition += tokenLength;
            }
            count++;
        }
        return true;
    };
    /**
     * get the token type
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__getTokenType = function (token) {
        if (this.__isOneArgFunction(token)) {
            return this.IS_ONE_ARG_FUNCTION;
        }
        if (this.__isValidBeforeOrAfter(token)) {
            return this.IS_OPERATOR;
        }
        if (this.__isVariable(token)) {
            return this.IS_VARIABLE;
        }
        if (this.__isNumber(token)) {
            return this.IS_NUMBER;
        }
        if (this.__isTwoArgFunction(token)) {
            return this.IS_TWO_ARG_FUNCTION;
        }
        if (this.COMPARE.indexOf(token) != -1) {
            return this.IS_COMPARE;
        }
        if (this.BOOLEAN.indexOf(token) != -1) {
            return this.IS_BOOLEAN;
        }
        if (token == this.QUOTE) {
            return this.IS_QUOTE;
        }
        if (token == this.LEFT_BRACKET || token == this.RIGHT_BRACKET) {
            return this.IS_BRACKET;
        }
        if (this.CHARACTERS.indexOf(token.charAt(0)) != -1) {
            return this.IS_STR_LITERAL;
        }
        return this.NONE;
    };
    // internal method - validate characters as expected by the parser
    TSMT$ExpressionEngine.prototype.__validateChars = function (str) {
        var i;
        var char;
        var legalCount;
        var l = str.length;
        for (i = 0; i < l; ++i) {
            char = str.charAt(i);
            // each char must contain number, letter, operator, or special character
            legalCount = this.NUMBERS.indexOf(char);
            legalCount += this.CHARACTERS.indexOf(char);
            legalCount += this.OPERATORS.indexOf(char);
            if (legalCount == -3) {
                // this is a bit of a hack and will be overhauled during the upcoming refactor
                if (char != "'" && char != '[' && char != ']') {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * validate parentheses for balance
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__validateParentheses = function (str) {
        var i;
        var char;
        var leftCount = 0;
        var rightCount = 0;
        var l = str.length;
        for (i = 0; i < l; ++i) {
            char = str.charAt(i);
            if (char == this.LEFT_PAREN) {
                leftCount++;
            }
            else if (char == this.RIGHT_PAREN) {
                rightCount++;
            }
        }
        return leftCount == rightCount;
    };
    // internal method - get next token in sequence
    TSMT$ExpressionEngine.prototype.__nextToken = function (str, position) {
        var len = str.length;
        var end;
        if (position >= len) {
            // nothing left to do
            return this.NONE;
        }
        else {
            var char = str.charAt(position);
            // check open bracket (list)
            if (char == this.LEFT_BRACKET) {
                return char;
            }
            // comparison?
            var tmp = str.substr(position, 2);
            if (this.COMPARE.indexOf(tmp) != -1) {
                return tmp;
            }
            // boolean?
            if (this.BOOLEAN.indexOf(tmp) != -1) {
                return tmp;
            }
            if (char == this.QUOTE)
                return char;
            if (this.__isCharacter(char)) {
                end = this.__getNextNonChar(str, position + 1);
                return str.substring(position, end);
            }
            if (this.__isNumber(char)) {
                end = this.__getNextNonNumber(str, position + 1);
                return str.substring(position, end);
            }
            // basic (single-char) operator check
            if (this.__isValidBeforeOrAfter(char)) {
                return char;
            }
            // game over ...
            return this.NONE;
        }
    };
    /**
     * is the supplied string a one-argument function?
     */
    TSMT$ExpressionEngine.prototype.__isOneArgFunction = function (str) {
        var i;
        var len = this.ONE_ARG_FUNCTIONS.length;
        for (i = 0; i < len; ++i) {
            if (str == this.ONE_ARG_FUNCTIONS[i]) {
                return true;
            }
        }
        return false;
    };
    /**
     *  is the supplied string a two-argument function?
     */
    TSMT$ExpressionEngine.prototype.__isTwoArgFunction = function (str) {
        var i;
        var len = this.TWO_ARG_FUNCTIONS.length;
        for (i = 0; i < len; ++i) {
            if (str == this.TWO_ARG_FUNCTIONS[i]) {
                return true;
            }
        }
        return false;
    };
    /**
     * is the supplied string a variable?
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isVariable = function (str) {
        var i;
        var len = this._variables.length;
        for (i = 0; i < len; ++i) {
            if (str == this._variables[i]) {
                return true;
            }
        }
        return false;
    };
    /**
     * is the supplied string a valid character?
     */
    TSMT$ExpressionEngine.prototype.__isCharacter = function (str) {
        return this.CHARACTERS.indexOf(str) != -1;
    };
    /**
     * is the supplied string a number
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isNumber = function (str) {
        var x = parseFloat(str);
        return !isNaN(x) && isFinite(x);
    };
    /**
     * is the supplied single character an operator or valid follow-on?
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isValidBeforeOrAfter = function (str) {
        // this should be refactored - too loose with definition
        return this.OPERATORS.indexOf(str) != -1;
    };
    /**
     * is the supplied string a math operator?
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isMathOperator = function (str) {
        return this.MATH_OPERATORS.indexOf(str) != -1;
    };
    /**
     * trim the input string for specific purposes of the this parser
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__trim = function (str) {
        var myStr = "";
        var len = str.length;
        var i;
        for (i = 0; i < len; ++i) {
            if (str.charCodeAt(i) > 32)
                myStr += str.charAt(i);
        }
        return myStr;
    };
    /**
     * get the next non-character position in a string, starting at the supplied position
     * @private
     */
    TSMT$ExpressionEngine.prototype.__getNextNonChar = function (str, position) {
        var c = str.charAt(position);
        var i = position;
        var l = str.length;
        while (this.CHARACTERS.indexOf(c) != -1 && i < l) {
            i++;
            c = str.charAt(i);
        }
        return i;
    };
    /**
     *  get the next non-number position, starting at the supplied position, and going in the specified direction - note that 2.5, for example, is a number
     *
     *  @private
     */
    TSMT$ExpressionEngine.prototype.__getNextNonNumber = function (str, position, dir) {
        // tbd, make 'dir' an enum
        if (dir === void 0) { dir = 1; }
        var c = str.charAt(position);
        var i = position;
        var l = str.length;
        if (dir == 1) {
            while (this.NUMBERS.indexOf(c) != -1 && i < l) {
                i++;
                c = str.charAt(i);
            }
        }
        else {
            while (this.NUMBERS.indexOf(c) != -1 && i >= 0) {
                i--;
                c = str.charAt(i);
            }
        }
        return i;
    };
    /**
     * get the next non-operator position, starting at the supplied position
     * @private
     */
    TSMT$ExpressionEngine.prototype.__getNextNonOperator = function (str, position) {
        var c = str.charAt(position);
        var i = position;
        var l = str.length;
        while (this.OPERATORS.indexOf(c) != -1 && i < l) {
            i++;
            c = str.charAt(i);
        }
        return i;
    };
    /**
     * is this character unary
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__isUnary = function (char) {
        return this.UNARY.indexOf(char) != -1;
    };
    /**
     * from starting position of a left paren, find the matching right paren taking nested parens into account
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__matchLeftParen = function (str, start) {
        // str.charAt(start) should be "("
        var leftCount = 1;
        var rightCount = 0;
        var len = str.length;
        var index = -1;
        var i;
        var char;
        for (i = start + 1; i < len; ++i) {
            char = str.charAt(i);
            if (char == this.LEFT_PAREN)
                leftCount++;
            if (char == this.RIGHT_PAREN) {
                rightCount++;
                if (rightCount == leftCount) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };
    /**
     * from the starting position of a right paren, find the matching left paren taking nested paren into account
     *
     * @private
     */
    TSMT$ExpressionEngine.prototype.__matchRightParen = function (str, start) {
        // str.charAt(start) should be ")"
        var leftCount = 0;
        var rightCount = 1;
        var index = -1;
        var i;
        var char;
        for (i = start - 1; i >= 0; i--) {
            char = str.charAt(i);
            if (char == this.RIGHT_PAREN)
                rightCount++;
            if (char == this.LEFT_PAREN) {
                leftCount++;
                if (rightCount == leftCount) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    };
    return TSMT$ExpressionEngine;
}());
exports.TSMT$ExpressionEngine = TSMT$ExpressionEngine;
