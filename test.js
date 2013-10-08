'use strict';
var  path = require('path')
, basename = path.basename(path.dirname(__filename))
, util = require('util')
, should = require('should')
, tester = require('dm-core').tester
, command = require('./index.js')
;


describe(basename, function () {

    describe('#1', function () {
        it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: true, delimiter: '/'})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal("INSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('A','B','C')/INSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('D','E','F')/")
                done();
              }
            );
          }
        )
      }
    )
    describe('#2', function () {
        it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: false})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal("INSERT INTO test VALUES ('xxx','yyy','zzz');\nINSERT INTO test VALUES ('A','B','C');\nINSERT INTO test VALUES ('D','E','F');\n")
                done();
              }
            );
          }
        )
      }
    )
    describe('#3', function () {
        it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: false, numrows: 2, method: 'replace'})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\nG,H,I\n')
            .end(function (err, res) {
                res.should.equal("REPLACE INTO test VALUES ('xxx','yyy','zzz'),('A','B','C');\nREPLACE INTO test VALUES ('D','E','F'),('G','H','I');\n")
                done();
              }
            );
          }
        )
      }
    )
    describe('#4', function () {
            it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: false, numrows: 3})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\nG,H,I\n')
            .end(function (err, res) {
                res.should.equal("INSERT INTO test VALUES ('xxx','yyy','zzz'),('A','B','C'),('D','E','F');\nINSERT INTO test VALUES ('G','H','I');\n")
                done();
              }
            );
          }
        )
      }
    )
    describe('#5', function () {
            it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: true, numrows : 3, createtable: true})
            .send('xxx,yyy,zzz\nA,B,C\nD,E,F\nG,H,I\n')
            .end(function (err, res) {
                res.should.equal("CREATE TABLE IF NOT EXISTS test(`xxx` varchar(255),`yyy` varchar(255),`zzz` varchar(255)) ENGINE=MyISAM DEFAULT CHARSET=utf8;\nINSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('A','B','C'),('D','E','F'),('G','H','I');\n")
                done();
              }
            );
          }
        )
      }
    )
    describe('#6', function () {
        it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: true})
            .send('xxx,yyy,zzz\nA,"B\nB",C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal("INSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('A','B\\nB','C');\nINSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('D','E','F');\n")
                done();
              }
            );
          }
        )
      }
    )
    describe('#7', function () {
        it('should return sql', function (done) {
            tester(command, {tablename: 'test', title: true})
            .send('xxx,yyy,zzz\nA,"B;B",C\nD,E,F\n')
            .end(function (err, res) {
                res.should.equal("INSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('A','B;B','C');\nINSERT INTO test (`xxx`,`yyy`,`zzz`) VALUES ('D','E','F');\n")
                done();
              }
            );
          }
        )
      }
    )



  }
);
