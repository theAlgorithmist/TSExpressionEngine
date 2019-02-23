/** Copyright 2016 Jim Armstrong (www.algorithmist.net)
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

// Expression Engine Specs
import {TSMT$ExpressionEngine} from '../../expression-engine/ExpressionEngine';

import {expressionValue} from '../../expression-engine/ExpressionEngine';

import * as Chai from 'chai';
const expect = Chai.expect;

// Test Suites
describe('Expression Parser Tests', () => {

  let __expression: TSMT$ExpressionEngine  = new TSMT$ExpressionEngine();
  let __expression2: TSMT$ExpressionEngine = new TSMT$ExpressionEngine(['x']);

  it('evaluates to false for no parsed expression', function() {
    let value: expressionValue = __expression.evaluate([0.0]);
    expect(value).to.be.false;
  });

  it('evaluates to false for empty independent variable list (no parse)', function() {
    let vars: Array<string> = new Array<string>();

    __expression.variables = vars;
    let value: expressionValue  = __expression.evaluate([0.0]);
    expect(value).to.be.false;
  });

  it('returns error for parse of invalid expression #1', function() {
    let parsed: boolean = __expression2.parse('x1');
    expect(parsed).to.be.false;
  });

  it('returns error for parse of invalid expression #2', function() {
    let parsed: boolean = __expression2.parse('5x + 1');
    expect(parsed).to.be.false;
  });

  it('returns success for parse of valid numerical expression', function() {
    let parsed: boolean = __expression.parse('x + 1');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid boolean expression #1', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x || y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid boolean expression #2', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x && y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid compare expression #1', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x < y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid compare expression #2', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x > y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid compare expression #3', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x >= y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid compare expression #4', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x <= y');
    expect(parsed).to.be.true;
  });

  it('returns success for parse of valid compare expression #5', function() {
    __expression.variables = ['x', 'y'];

    let parsed: boolean = __expression.parse('x = y');
    expect(parsed).to.be.true;
  });

  it('returns 2.0 for "x+1" evaluated at x=1', function() {
    __expression.variables     = ['x'];
    let parsed: boolean        = __expression.parse('x + 1');
    let value: expressionValue = __expression.evaluate([1.0]);

    expect(<number> value).to.equal(2.0);
  });

  it('returns faslse for "x+1" with no independent variable value', function() {
    __expression.variables     = ['x'];
    let parsed: boolean        = __expression.parse('x + 1');
    let value: expressionValue = __expression.evaluate([]);

    expect(value).to.be.false;
  });

  it('returns false for "x+1" with non-numeric independent variable value', function() {
    __expression.variables     = ['x'];
    let parsed: boolean        = __expression.parse('x + 1');
    let value: expressionValue = __expression.evaluate([NaN]);

    expect(value).to.be.false;
  });

  it('returns expected values for "x+1" with multiple calls to evaluate()', function() {
    __expression.variables     = ['x'];
    let parsed: boolean = __expression.parse('x + 1');

    let value: expressionValue = __expression.evaluate([0.0]);
    expect(<number> value).to.equal(1.0);

    value = __expression.evaluate([-1.0]);
    expect(<number> value).to.equal(0.0);

    value = __expression.evaluate([10.0]);
    expect(<number> value).to.equal(11.0);
  });

  it('properly clears and parses a numerical expression', function() {
    __expression.clear();
    __expression.variables = ["x"];

    let success: boolean = __expression.parse( "2*x + 1" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([-1.0]);
    expect(<number> value).to.equal(-1.0);
  });

  it('returns expected values for "2*x + 3" with multiple calls to evaluate()', function() {

    __expression.variables      = ['x'];
    let success: boolean       = __expression.parse('2*x + 3');
    let value: expressionValue = __expression.evaluate([0.0]);

    expect(<number> value).to.equal(3);

    value = __expression.evaluate([1.0]);
    expect(<number> value).to.equal(5);

    value = __expression.evaluate([2.0]);
    expect(<number> value).to.equal(7);

    value = __expression.evaluate([3.0]);
    expect(<number> value).to.equal(9);
  });

  it('properly clears and parses a numerical expression with two independent variables', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "-3*x + y/2" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0, 0]);

    expect(<number> value).to.equal(0);

    value = __expression.evaluate([1, 2])
    expect(<number> value).to.equal(-2);
  });

  it('properly constructs a single-variable expression', function() {
    let expression: TSMT$ExpressionEngine = new TSMT$ExpressionEngine(['y'])

    let success: boolean = expression.parse( "5*y + 7" );
    expect(success).to.be.true;

    let value: expressionValue = expression.evaluate([1]);

    expect(<number> value).to.equal(12);
  });

  it('properly clears/parses/evaluates a string expression with two independent variables', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x + y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<string> value).to.equal('ab');

    value = __expression.evaluate(['DFW', 'SFO'])
    expect(<string> value).to.equal('DFWSFO');
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #2', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x < y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['SFO', 'DFW'])
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #3', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x > y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.false;

    value = __expression.evaluate(['SFO', 'DFW'])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #4', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x = y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.false;

    value = __expression.evaluate(['SFO', 'sfo'])
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate(['SFO', 'SFO'])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #5', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x <= y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['sfo', 'SFO'])
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate(['SFO', 'SFO'])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #6', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x >= y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.false;

    value = __expression.evaluate(['sfo', 'SFO'])
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['SFO', 'SFO'])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a string expression with two independent variables #7', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x != y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['a', 'b']);

    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['sfo', 'SFO']);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['SFO', 'SFO']);
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([1.0, 0.0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([3.0, 3.0]);
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a boolean expression with two independent variables', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x || y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([true, false]);

    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([false, false])
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([false, true])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a boolean expression with two independent variables #2', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x && y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([true, false]);

    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([false, false])
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([true, true])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a complex numeric expression', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x + 1) - (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0, 0]);
    expect(<number> value).to.equal(3);

    value = __expression.evaluate([1, 1])
    expect(<number> value).to.equal(2);

    value = __expression.evaluate([-2, 3])
    expect(<number> value).to.equal(-10);
  });

  it('properly clears/parses/evaluates a mixed numeric and comparison expression #1', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x + 1) < (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0, 0]);
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([1, 1])
    expect(<boolean> value).to.false;

    value = __expression.evaluate([-2, 3])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a mixed numeric and comparison expression #2', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x + 1) > (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([1, 1])
    expect(<boolean> value).to.true;

    value = __expression.evaluate([-2, 3])
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a mixed numeric and comparison expression #3', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x) >= (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([-2, 0]);
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([1, 1])
    expect(<boolean> value).to.true;

    value = __expression.evaluate([2, 2])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a mixed numeric and comparison expression #4', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x) <= (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([-2, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([1, 1])
    expect(<boolean> value).to.false;

    value = __expression.evaluate([2, 2])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a mixed numeric and comparison expression #5', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(2*x) = (3*y - 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([-2, 0]);
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([1, 1])
    expect(<boolean> value).to.false;

    value = __expression.evaluate([2, 2])
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a numeric-> string coercion and string comparison', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(x + 1) < y" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['abc', 'abc2']);
    expect(<boolean> value).to.be.true;
  });

  it('properly clears/parses/evaluates a mixed comparison and boolean expression #1', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x && (y < 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([true, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([false, 1])
    expect(<boolean> value).to.false;

    value = __expression.evaluate([true, 2])
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a mixed comparison and boolean expression #2', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "x || (y < 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([true, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([false, 1]);
    expect(<boolean> value).to.true;

    value = __expression.evaluate([false, 2]);
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a complex comparison and boolean expression #1', function() {
    __expression.clear();
    __expression.variables = ["x", "y"];

    let success: boolean = __expression.parse( "(x > 3) || (y < 2)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([4, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([6, 1]);
    expect(<boolean> value).to.true;

    value = __expression.evaluate([0, 5]);
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a compound (nested) expression', function() {
    __expression.clear();
    __expression.variables = ["x", "y", "z"];

    let success: boolean = __expression.parse( "((x > 3) || (y < 2)) && (z >= 0)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([4, 0, 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate([6, 1, 10]);
    expect(<boolean> value).to.true;

    value = __expression.evaluate([0, 5, 0]);
    expect(<boolean> value).to.be.false;

    value = __expression.evaluate([0, 5, -2]);
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates a compound (nested) expression with inline string literal', function() {
    __expression.clear();
    __expression.variables = ["x", "y", "z"];

    let success: boolean = __expression.parse( "((x = 'xyz') || (y = 'abc')) && (z >= 0)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['abc', 'abc', 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['abc', 'xyz', 10]);
    expect(<boolean> value).to.false;

    value = __expression.evaluate(['xyz', 'xx', 0]);
    expect(<boolean> value).to.be.true;

    value = __expression.evaluate(['xyz', 'abc', -1]);
    expect(<boolean> value).to.be.false;
  });

  it('properly clears/parses/evaluates contained-in list expression #1', function() {
    __expression.clear();

    let success: boolean = __expression.parse( "x ~ [1, 2, 3]" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([1]);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate([0]);
    expect( <boolean> value ).to.be.false;
  });

  it('properly clears/parses/evaluates contained-in list expression #2', function() {
    __expression.clear();

    let success: boolean = __expression.parse( "x ~ [ab, cd, efg]" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['ab']);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate(['xyz']);
    expect( <boolean> value ).to.be.false;
  });

  it('properly clears/parses/evaluates complex contained-in list expression', function() {
    __expression.clear();
    __expression.variables = ['x', 'y'];

    let success: boolean = __expression.parse( "(x ~ [ab, cd, efg]) && (y > 0)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate(['ab', 2]);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate(['xyz', 1]);
    expect( <boolean> value ).to.be.false;
  });

  it('properly handles basic logical negation', function() {
    __expression.clear();
    __expression.variables = ['x'];

    let success: boolean = __expression.parse( "!x" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([true]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([false]);
    expect( <boolean> value ).to.be.true;

    // coercions to boolean
    value = __expression.evaluate([100]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([0]);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate([""]);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate(["abc"]);
    expect( <boolean> value ).to.be.false;
  });

  it('properly handles more complex logical negation', function() {
    __expression.clear();
    __expression.variables = ['x'];

    let success: boolean = __expression.parse( "!(x < 5)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([11]);
    expect( <boolean> value ).to.be.true;
  });

  it('properly handles more mixed logical negation with boolean expression', function() {
    __expression.clear();
    __expression.variables = ['x', 'y'];

    let success: boolean = __expression.parse( "!(x < 5) && (y > 0)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([0, 1]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([10, -1]);
    expect( <boolean> value ).to.be.false;
  });

  it('properly handles more mixed logical negation with boolean expression #2', function() {
    __expression.clear();
    __expression.variables = ['x', 'y'];

    let success: boolean = __expression.parse( "!x && (y < 68)" );
    expect(success).to.be.true;

    let value: expressionValue = __expression.evaluate([false, 59]);
    expect( <boolean> value ).to.be.true;

    value = __expression.evaluate([false, 68]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([true, 59]);
    expect( <boolean> value ).to.be.false;

    value = __expression.evaluate([true, 70]);
    expect( <boolean> value ).to.be.false;
  });
});
