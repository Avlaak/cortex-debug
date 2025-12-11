import * as assert from 'assert';
import { isEditableVariable } from '../../src/common/expression-utils';

suite('isEditableVariable Tests', () => {
    suite('Simple identifiers (should return true)', () => {
        test('simple variable name', () => {
            assert.strictEqual(isEditableVariable('myVar'), true);
        });

        test('variable with underscore', () => {
            assert.strictEqual(isEditableVariable('my_var'), true);
        });

        test('variable starting with underscore', () => {
            assert.strictEqual(isEditableVariable('_myVar'), true);
        });

        test('single letter variable', () => {
            assert.strictEqual(isEditableVariable('x'), true);
        });

        test('variable with numbers', () => {
            assert.strictEqual(isEditableVariable('var123'), true);
        });
    });

    suite('Struct/class members (should return true)', () => {
        test('dot notation member access', () => {
            assert.strictEqual(isEditableVariable('obj.member'), true);
        });

        test('arrow notation member access', () => {
            assert.strictEqual(isEditableVariable('ptr->member'), true);
        });

        test('nested member access', () => {
            assert.strictEqual(isEditableVariable('obj.inner.value'), true);
        });

        test('mixed dot and arrow access', () => {
            assert.strictEqual(isEditableVariable('obj->inner.value'), true);
        });
    });

    suite('Array elements (should return true)', () => {
        test('array with numeric index', () => {
            assert.strictEqual(isEditableVariable('arr[0]'), true);
        });

        test('array with variable index', () => {
            assert.strictEqual(isEditableVariable('arr[i]'), true);
        });

        test('multidimensional array', () => {
            assert.strictEqual(isEditableVariable('arr[0][1]'), true);
        });

        test('array element of struct member', () => {
            assert.strictEqual(isEditableVariable('obj.arr[0]'), true);
        });

        test('array with computed index (addition)', () => {
            // arr[i+1] is still an lvalue - the index is computed but result is addressable
            assert.strictEqual(isEditableVariable('arr[i+1]'), true);
        });

        test('array with computed index (subtraction)', () => {
            assert.strictEqual(isEditableVariable('arr[i-1]'), true);
        });

        test('array with computed index (multiplication)', () => {
            assert.strictEqual(isEditableVariable('arr[i*2]'), true);
        });

        test('array with complex index expression', () => {
            assert.strictEqual(isEditableVariable('arr[i + j * 2]'), true);
        });

        test('array with nested array index', () => {
            assert.strictEqual(isEditableVariable('arr[indices[i]]'), true);
        });

        test('2D array with computed indices', () => {
            assert.strictEqual(isEditableVariable('matrix[i+1][j-1]'), true);
        });

        test('struct member array with computed index', () => {
            assert.strictEqual(isEditableVariable('obj->arr[i+offset]'), true);
        });

        test('array with negative literal index', () => {
            assert.strictEqual(isEditableVariable('arr[-1]'), true);
        });

        test('array with pointer dereference in index', () => {
            assert.strictEqual(isEditableVariable('arr[*ptr]'), true);
        });
    });

    suite('Pointer dereferences (should return true)', () => {
        test('simple pointer dereference', () => {
            assert.strictEqual(isEditableVariable('*ptr'), true);
        });

        test('dereference with member access', () => {
            assert.strictEqual(isEditableVariable('*ptr.member'), true);
        });

        test('double dereference', () => {
            assert.strictEqual(isEditableVariable('**ptr'), true);
        });
    });

    suite('Format specifiers (should return true)', () => {
        test('variable with hex format', () => {
            assert.strictEqual(isEditableVariable('myVar,h'), true);
        });

        test('variable with binary format', () => {
            assert.strictEqual(isEditableVariable('myVar,b'), true);
        });

        test('variable with decimal format', () => {
            assert.strictEqual(isEditableVariable('myVar,d'), true);
        });

        test('variable with octal format', () => {
            assert.strictEqual(isEditableVariable('myVar,o'), true);
        });

        test('array element with format', () => {
            assert.strictEqual(isEditableVariable('arr[0],x'), true);
        });
    });

    suite('Arithmetic expressions (should return false)', () => {
        test('addition of identifiers', () => {
            assert.strictEqual(isEditableVariable('a+b'), false);
        });

        test('subtraction of identifiers', () => {
            assert.strictEqual(isEditableVariable('a-b'), false);
        });

        test('multiplication of identifiers', () => {
            assert.strictEqual(isEditableVariable('a*b'), false);
        });

        test('division of identifiers', () => {
            assert.strictEqual(isEditableVariable('a/b'), false);
        });

        test('modulo of identifiers', () => {
            assert.strictEqual(isEditableVariable('a%b'), false);
        });

        test('addition with spaces', () => {
            assert.strictEqual(isEditableVariable('a + b'), false);
        });

        test('numeric addition', () => {
            assert.strictEqual(isEditableVariable('3+4'), false);
        });

        test('numeric subtraction', () => {
            assert.strictEqual(isEditableVariable('10-5'), false);
        });

        test('numeric multiplication', () => {
            assert.strictEqual(isEditableVariable('2*3'), false);
        });

        test('numeric division', () => {
            assert.strictEqual(isEditableVariable('10/2'), false);
        });

        test('numeric with spaces', () => {
            assert.strictEqual(isEditableVariable('10 - 5'), false);
        });

        test('identifier plus number', () => {
            assert.strictEqual(isEditableVariable('a+1'), false);
        });

        test('number plus identifier', () => {
            assert.strictEqual(isEditableVariable('1+a'), false);
        });

        test('complex expression', () => {
            assert.strictEqual(isEditableVariable('a + b * c'), false);
        });
    });

    suite('Comparison expressions (should return false)', () => {
        test('equality', () => {
            assert.strictEqual(isEditableVariable('a==b'), false);
        });

        test('inequality', () => {
            assert.strictEqual(isEditableVariable('a!=b'), false);
        });

        test('less than or equal', () => {
            assert.strictEqual(isEditableVariable('a<=b'), false);
        });

        test('greater than or equal', () => {
            assert.strictEqual(isEditableVariable('a>=b'), false);
        });
    });

    suite('Logical expressions (should return false)', () => {
        test('logical AND', () => {
            assert.strictEqual(isEditableVariable('a&&b'), false);
        });

        test('logical OR', () => {
            assert.strictEqual(isEditableVariable('a||b'), false);
        });
    });

    suite('Bitwise expressions (should return false)', () => {
        test('left shift', () => {
            assert.strictEqual(isEditableVariable('a<<b'), false);
        });

        test('right shift', () => {
            assert.strictEqual(isEditableVariable('a>>b'), false);
        });

        test('bitwise XOR', () => {
            assert.strictEqual(isEditableVariable('a^b'), false);
        });

        test('bitwise NOT', () => {
            assert.strictEqual(isEditableVariable('~a'), false);
        });
    });

    suite('Ternary expressions (should return false)', () => {
        test('ternary operator', () => {
            assert.strictEqual(isEditableVariable('a?b:c'), false);
        });

        test('ternary with spaces', () => {
            assert.strictEqual(isEditableVariable('a ? b : c'), false);
        });
    });

    suite('Function calls (should return false)', () => {
        test('simple function call', () => {
            assert.strictEqual(isEditableVariable('func()'), false);
        });

        test('function call with arguments', () => {
            assert.strictEqual(isEditableVariable('func(a, b)'), false);
        });

        test('method call', () => {
            assert.strictEqual(isEditableVariable('obj.method()'), false);
        });

        test('nested function call', () => {
            assert.strictEqual(isEditableVariable('outer(inner())'), false);
        });
    });

    suite('Numeric literals (should return false)', () => {
        test('positive integer', () => {
            assert.strictEqual(isEditableVariable('42'), false);
        });

        test('negative integer', () => {
            assert.strictEqual(isEditableVariable('-42'), false);
        });

        test('zero', () => {
            assert.strictEqual(isEditableVariable('0'), false);
        });

        test('floating point', () => {
            assert.strictEqual(isEditableVariable('3.14'), false);
        });

        test('negative floating point', () => {
            assert.strictEqual(isEditableVariable('-3.14'), false);
        });

        test('hexadecimal', () => {
            assert.strictEqual(isEditableVariable('0x1234'), false);
        });

        test('hexadecimal uppercase', () => {
            assert.strictEqual(isEditableVariable('0xABCD'), false);
        });
    });

    suite('String literals (should return false)', () => {
        test('double quoted string', () => {
            assert.strictEqual(isEditableVariable('"hello"'), false);
        });

        test('single quoted string', () => {
            assert.strictEqual(isEditableVariable('\'hello\''), false);
        });
    });

    suite('Edge cases', () => {
        test('empty string', () => {
            assert.strictEqual(isEditableVariable(''), false);
        });

        test('whitespace only', () => {
            assert.strictEqual(isEditableVariable('   '), false);
        });

        test('variable with trailing spaces', () => {
            assert.strictEqual(isEditableVariable('myVar  '), true);
        });

        test('variable with leading spaces', () => {
            assert.strictEqual(isEditableVariable('  myVar'), true);
        });

        test('cast expression', () => {
            // This might be tricky - casts look like function calls
            assert.strictEqual(isEditableVariable('(int)ptr'), false);
        });

        test('sizeof expression', () => {
            assert.strictEqual(isEditableVariable('sizeof(int)'), false);
        });

        test('address-of operator', () => {
            // &var is not an lvalue itself, but the result can't be assigned to
            // However, this is context-dependent. For now, let's see what happens.
            assert.strictEqual(isEditableVariable('&var'), true); // debatable
        });

        test('parenthesized variable', () => {
            // (var) is still an lvalue
            assert.strictEqual(isEditableVariable('(var)'), false); // looks like function call
        });

        test('negative number as expression start', () => {
            // -5 alone is a literal, not assignable
            assert.strictEqual(isEditableVariable('-5'), false);
        });

        test('dereference of computed pointer', () => {
            // *(ptr+1) - pointer arithmetic then dereference - this IS an lvalue
            // but it looks like function call due to parentheses, so we reject it
            assert.strictEqual(isEditableVariable('*(ptr+1)'), false);
        });

        test('array subscript vs addition', () => {
            // Make sure arr[0]+1 is NOT lvalue (addition outside brackets)
            assert.strictEqual(isEditableVariable('arr[0]+1'), false);
        });

        test('addition result subscript', () => {
            // (a+b)[0] - not a simple variable (starts with parenthesis)
            assert.strictEqual(isEditableVariable('(a+b)[0]'), false);
        });
    });
});
