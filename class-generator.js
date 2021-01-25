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

class ClassMethodGenerator {

    constructor(name, scope, description, type) {
        this.name = name;

        this.scope = scope;

        this.type = type;

        this.description = description;

        this.params = [];

        this.returns = [];

        this.body = null;
    }

    getName() {
        return this.name;
    }

    getScope() {
        return this.scope;
    }

    getDescription() {
        return this.description;
    }

    addParam(param) {
        this.params.push(param);
    }

    getParams() {
        return this.params;
    }

    getType() {
        return this.type;
    }

    addReturn(singleReturn) {
        this.returns.push(singleReturn);
    }

    getReturns() {
        return this.returns;
    }

    setBody(body) {
        this.body = body;
    }

    getBody() {
        return this.body;
    }
}

class ClassVariableGenerator {
    constructor(name, scope, values, description) {
        this.name = name;

        this.scope = scope;

        this.description = description;

        this.values = values;
        this.returns = [];
    }

    getName(){
        return this.name;
    }

    getReturns(){
        return this.returns;
    }

    getScope(){
        return this.scope;
    }

    getDescription(){
        return this.description;
    }

    getValues(){
        return this.values;
    }

}

class ClassGenerator {

    constructor(name) {
        this.name = name;

        this.imports = [];

        this.methods = [];

        this.extends = [];

        this.variables = [];

        this.implements = [];

        this.traits = [];
    }

    getName() {
        return this.name;
    }

    addImport(singleImport) {
        this.imports.push(singleImport);
    }

    getImports() {
        return this.imports;
    }

    addMethodGenerator(singleMethodGenerator) {
        this.methods.push(singleMethodGenerator)
    }

    addVariableGenerator(singleVariableGenerator){
        this.variables.push(singleVariableGenerator);
    }

    addExtend(singleExtend) {
        this.extends.push(singleExtend);
    }

    addTrait(trait){
        this.traits.push(trait);
    }

    addImplement(singleImplement) {
        this.implements.push(singleImplement);
    }

    getExtends() {
        return this.extends;
    }

    getTraits(){
        return this.traits;
    }

    getImplements() {
        return this.implements;
    }

    getMethodGenerators() {
        return this.methods;
    }

    getVariableGenerators(){
        return this.variables;
    }
}

module.exports = {
    ClassGenerator,
    ClassMethodGenerator,
    ClassVariableGenerator
}
