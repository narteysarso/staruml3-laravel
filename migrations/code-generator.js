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

const fs = require('fs');
const path = require('path');
const codegen = require('../utils/codegen-utils');
const fileUtils = require('../utils/file-utils');
const codeClassGen = require('../code-class-generator');
const classGenerator = require('../class-generator');
const MIGRATION_METHOD_TYPE_MAP = require('./migration-methods-types-map');

/**
 *  Code Generator
 */
class MigrationCodeGenerator {

    /**
     * @constructor
     *
     * @param {type.UMLPackage} baseModel
     * @param {type.FileManager}
     * @param {type.CodeWriter}
     */
    constructor(baseModel, fileManager, writer) {
        /** @member {type.Model} */
        this.baseModel = baseModel;

        /** @member {type.FileManager} */
        this.fileManager = fileManager;

        /** @member {type.CodeWriter} */
        this.writer = writer;
    }

    /**
     * Generate the file name. In Laravel the file name
     * is based on the following components.
     *
     * - Current date
     * - Table name
     *
     * Those components are used in the following
     * format:
     *
     * yyyy_mm_dd_hhmmss_create_[table_name]_table.php
     *
     * @param elem
     *
     * @returns {*}
     */
    generateFileName(elem) {
        let now = new Date();
        let terms = [];
        let extension = '.php';
        let tableName = elem.model.name;

        terms.push(now.getFullYear());
        terms.push(('0' + (now.getMonth() + 1)).slice(-2));
        terms.push(('0' + now.getDate()).slice(-2));
        let time = ('0' + now.getHours()).slice(-2) +
            ('0' + now.getMinutes()).slice(-2) +
            ('0' + now.getSeconds()).slice(-2);
        terms.push(time);
        terms.push('create');
        terms.push(tableName);
        terms.push('table');

        return terms.join('_') + extension;
    }

    /**
     * Generates the main code of the class
     *
     * @param elem
     */
    generateClassCode(elem) {
        let tableName = elem.model.name;
        var classCodeGenerator = this;

        let className = 'Create' + (tableName.charAt(0).toUpperCase() + tableName.slice(1)) + 'Table';

        let generator = new classGenerator.ClassGenerator(className);
        generator.addImport('Illuminate\\Support\\Facades\\Schema;');
        generator.addImport('Illuminate\\Database\\Schema\\Blueprint;');
        generator.addImport('Illuminate\\Database\\Migrations\\Migration;');
        generator.addExtend('Migration');

        let upMethodGenerator = new classGenerator.ClassMethodGenerator('up', 'public', 'Run the migrations.');
        upMethodGenerator.addReturn({ "type": "void" });
        upMethodGenerator.setBody(function () {
            classCodeGenerator.generateUpBody(tableName, elem);
        });

        let downMethodGenerator = new classGenerator.ClassMethodGenerator('down', 'public', 'Reverse the migrations.');
        downMethodGenerator.addReturn({ "type": "void" });
        downMethodGenerator.setBody(function () {
            classCodeGenerator.generateDownBody(tableName);
        });

        generator.addMethodGenerator(upMethodGenerator);
        generator.addMethodGenerator(downMethodGenerator);

        (new codeClassGen.CodeBaseClassGenerator(generator, this.writer)).generate();
    }

    generateUpBody(tableName, elem) {
        this.writer.indent();

        this.writer.writeLine("Schema::create('" + tableName + "', function (Blueprint $table) {");
        this.generateTableSchema(elem);
        this.writer.writeLine('});');

        this.writer.outdent();
    }

    generateDownBody(tableName) {
        this.writer.indent();

        this.writer.writeLine("Schema::dropIfExists('" + tableName + "');");

        this.writer.outdent();
    }

    getMigrationMethodFromType(columnType) {
        const command = MIGRATION_METHOD_TYPE_MAP[columnType];
        if (!MIGRATION_METHOD_TYPE_MAP[columnType]) {
            app.dialogs.showErrorDialog(`Column type (${columnType}) is not defined in laravel`)
            return null;
        }

        return command;

    }

    /**
     * Generates table schema based on the 
     * column definition.
     *
     * @param {type.Model} elem
     */
    generateTableSchema(elem) {

        this.writer.indent();

        this.generateTableColumns(elem.model.columns);

        const tableTags = this.extractTags(elem.model.tags);

        this.generateTableIndexes(tableTags);

        this.writer.outdent();
    }

    /**
     * Generate code for a given column
     * @param {type.ERDEntityColumn} columns 
     */
    generateTableColumns(columns) {
        if (!columns) {
            return
        }
        columns.forEach((singleColumn) => {
            const type = this.getMigrationMethodFromType(singleColumn.type);
            if (!type) {
                return;
            }
            
            const columnTags = this.extractTags(singleColumn.tags);
            const args = (singleColumn.length > 0) ? `"${singleColumn.name}", ${singleColumn.length}` : `'${singleColumn.name}'`;
            const nullable = (singleColumn.nullable) ? `->nullable()`: "";
            const unique = (singleColumn.unique) ? `->unique()`: "";
            const defaults = (columnTags.default) ? `->default(${columnTags.default})`: "";
            const columnDefinition = `$table->${type}(${args})${unique}${nullable}${defaults}`;

            this.writer.writeLine(columnDefinition);

            this.generateColumnRelation(singleColumn, columnTags['onDelete']);

        });
    }

    /**
     * Generates foreign key relation for column
     * @param {type.Model.ERDEntityColumn} column 
     * @param {String} onDelete 
     */
    generateColumnRelation(column, onDelete="cascade") {
        if(!column.foreignKey){
            return;
        }

        if(!column.referenceTo){
            return;
        }

        const referenceColumn = column.referenceTo.name;
        const referenceModel = column.referenceTo._parent.name;

        const referenceDefinition = `$table->foreign('${column.name}')->references('${referenceColumn}')->on('${referenceModel}')->onDelete('${onDelete}')`
        this.writer.writeLine(referenceDefinition);
    }

    /**
     * 
     * @param {type.ERDEntityTag} tags 
     * @returns {Object} newTags
     */
    extractTags(tags){
        const newTags = tags.reduce((previousValue, tag) => {
            const {name, ...otherParams} = tag;
            return  {...previousValue, [ name ]: otherParams};
        },{});
        return newTags;
    }

    /**
     * Generate indexes for table
     * @param {Object} tags 
     */
    generateTableIndexes(tags){
        const indexes = require('./migration-indexes');
        const indexKeys = Object.keys(indexes);
        indexKeys.forEach((indexName) => {
            const indexType = tags[indexName];
            if(!indexType){
                return;
            }

            this.writer.writeLine(`$table->${indexes[indexName]}(${indexType['value']})`);
        })
    }

    /**
     * Generate codes from a given element
     *
     * @param {type.Model} elem
     * @param {string} path
     * @param {Object} options
     */
    generate(elem) {
        let result = new $.Deferred();
        let filePath;

        if (elem instanceof type.ERDEntityView) {
            this.generateClassCode(elem);

            filePath = this.fileManager.getMigrationsFullPath() + '/' + this.generateFileName(elem);
            fs.writeFileSync(filePath, this.writer.getData());
        } else {
            result.resolve();
        }

        return result.promise();
    }
}

/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate(baseModel, basePath, options) {
    var fileManager = new fileUtils.FileManager(basePath, options);
    fileManager.prepareMigrationsFolder(
        function () {
            baseModel.ownedViews.forEach(child => {
                let writer = new codegen.CodeWriter('\t');
                let codeGenerator = new MigrationCodeGenerator(baseModel, fileManager, writer);

                codeGenerator.generate(child);
            });
        },
        function () {
            app.dialogs.showErrorDialog("Canceled operation by user.");

            return;
        }
    );
}

exports.generate = generate;