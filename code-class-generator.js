/*
 * Copyright (c) 2018 @cesiztel All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

const { count } = require('console');
const fs = require('fs');
const path = require('path');
const codegen = require('./utils/codegen-utils');

/**
 * CodeWriter
 */
class CodeBaseClassGenerator {
    /**
     * @constructor
     */
    constructor(schema, writer) {
        /** @member {string} schema */
        this.schema = schema;

        /** @member {type.CodeWriter} */
        this.writer = writer;
    }

    generate() {
        this.header();
        this.imports();
        this.mainClassCode();
    }

    header() {
        this.writer.writeLine('<?php');
        this.writer.writeLine('');
    }

    imports() {
        let writer = this.writer;
        this.schema.getImports().forEach(function (singleImport) {
            writer.writeLine('use ' + singleImport);
        });

        this.writer.writeLine('');
    }

    mainClassCode() {
        this.classSignature();
        this.writer.writeLine('{');
        this.writer.indent();
        this.mainClassCodeBody();
        this.writer.outdent();
        this.writer.writeLine('}');
    }

    classSignature() {
        let classExtends = this.schema.getExtends().join(',');
        let classImplementation = this.schema.getImplements().join(',');

        let signatureExtras = '';
        if (classExtends.length > 0) {
            signatureExtras += ' extends ' + classExtends;
        }

        if (classImplementation.length > 0) {
            signatureExtras += ' implements ' + classImplementation;
        }

        this.writer.writeLine('class ' + this.schema.getName() + signatureExtras);
    }

    mainClassCodeBody() {
        let writer = this.writer;
        let codeGenerator = this;
        
        this.writeTrait(this.schema.getTraits());
        
        this.schema.getVariableGenerators().forEach((singleVariableGenerator) => {
            codeGenerator.blockDocs(singleVariableGenerator);
            codeGenerator.writeVariable(singleVariableGenerator);
            writer.writeLine('');
        })
        this.schema.getMethodGenerators().forEach(function (singleMethodGenerator) {
            codeGenerator.blockDocs(singleMethodGenerator);
            codeGenerator.writeMethod(singleMethodGenerator);

            writer.writeLine('');
        });
    }

    blockDocs(methodGenerator) {
        const description = methodGenerator.getDescription();
        if(!description){
            return;
        }
        this.writer.writeLine('/**');
        this.writer.writeLine(' * ' + description);
        this.writer.writeLine(' *');
        let writer = this.writer;
        methodGenerator.getReturns().forEach(function (singleReturn) {
            writer.writeLine(' * @return ' + singleReturn.type);
        });
        this.writer.writeLine(" */");
    }

    writeMethod(methodGenerator) {
        this.writer.writeLine(`${methodGenerator.getScope()} function ${methodGenerator.getName()}(${methodGenerator.getParams().join(',')})`);
        this.writer.writeLine('{');
        if (methodGenerator.getBody() === null) {
            this.writer.indent();
            this.writer.writeLine("// Your code goes here...");
            this.writer.outdent();
        } else {
            methodGenerator.getBody()();
        }
        this.writer.writeLine('}');
    }

    writeVariable(variableGenerator) {
        const values = variableGenerator.getValues();
        const prepareArrayValues = (values) => {
            return `[${values.reduce((previous, value) => {
                if (typeof value === 'string') {
                    return `\n\t\t"${value}",${previous}`;
                } else {
                    return `\n\t\t${value},${previous}`;
                }
            }, "")}\n\t];`
        }

        const prepareSingleValue = (value) => {
            return  `${typeof values === 'string' ? `"${values}"` : value}`;
        }
        const preparedValues = !Array.isArray(values) ?  prepareSingleValue(values): prepareArrayValues(values);
         
        this.writer.writeLine(`${variableGenerator.getScope()} $${variableGenerator.getName()} = ${preparedValues}`);
        this.writer.writeLine("");
    }

    writeTrait(traits){
        if(!traits){
            return; 
        }

        this.writer.writeLine(`use ${traits.join(', ')}; `);
        this.writer.writeLine("");
    }
}

exports.CodeBaseClassGenerator = CodeBaseClassGenerator;