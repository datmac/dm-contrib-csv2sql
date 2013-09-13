'use strict';
var  path = require('path')
, basename = path.basename(path.dirname(__filename))
, util = require('util')
, should = require('should')
, tester = require('mill-core').tester
, command = require('./index.js')
;


describe(basename, function () {

    describe('#1', function () {
        it('should return json', function (done) {
            tester(command, {tablename: 'test', title: true, delimiter: '/'})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal('INSERT INTO test (xxx,yyy,zzz) VALUES (A,B,C);/INSERT INTO test (xxx,yyy,zzz) VALUES (D,E,F);/')
                done();
              }
            );
          }
        )
      }
    )
    describe('#2', function () {
        it('should return json', function (done) {
            tester(command, {tablename: 'test', title: false})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal('INSERT INTO test VALUES (xxx,yyy,zzz);\nINSERT INTO test VALUES (A,B,C);\nINSERT INTO test VALUES (D,E,F);\n')
                done();
              }
            );
          }
        )
      }
    )
    describe('#3', function () {
        it('should return json', function (done) {
            tester(command, {tablename: 'test', title: false, numrows: 2, method: 'replace'})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\nG,H,I\n')
            .end(function (err, res) {
                res.should.equal('REPLACE INTO test VALUES (xxx,yyy,zzz),(A,B,C);\nREPLACE INTO test VALUES (D,E,F),(G,H,I);\n')
                done();
              }
            );
          }
        )
      }
    )
    describe('#4', function () {
            it('should return json', function (done) {
            tester(command, {tablename: 'test', title: false, numrows: 3})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\nG,H,I\n')
            .end(function (err, res) {
                res.should.equal('INSERT INTO test VALUES (xxx,yyy,zzz),(A,B,C),(D,E,F);\nINSERT INTO test VALUES (G,H,I)')
                done();
              }
            );
          }
        )
      }
    )
  }
);
