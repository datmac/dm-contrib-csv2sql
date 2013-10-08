'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('dm:contrib:' + basename)
, util = require('util')
, Transform = require("stream").Transform
, CSV = require('csv-string')
, SqlString = require('./SqlString.js')
;

function escape(str) {
  return SqlString.escape(str, true);
}
function escapeID(str) {
  return SqlString.escapeId(str);
}

function Sniffer()
{
  this.begin = true
}
util.inherits(Sniffer, Transform);

Sniffer.prototype._transform = function (chunk, encoding, done) {
  if (this.begin) {
    this.begin = false;
    this.separator = CSV.detect(chunk);
  }
  this.push(chunk, encoding);
  done()
}



function Command(options)
{
  Transform.call(this, options);
  this.options = options || {}
  this.begin = true;
  this.separator = ',';
  this.buffer = '';
  this.titles = [];
  this.counter = 0;
  this.tablename = options.tablename || '{{tablename}}';
  this.createtable = !options.createtable ? false : true;
  this.title = !options.title ? false : true;
  this.method = (options.method || 'INSERT').toUpperCase();
  this.numrows = options.numrows || 1;
  this.delimiter = !options.delimiter ? ";\n" : options.delimiter;
  this.countrows = 0;
  this.query = '';
  this.buffer = '';
  
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype.parse = function (rows) {
  var self = this;
  rows.forEach(function (row) {
      if (self.counter === 0 && self.title) {
        self.titles = row.slice(0).map(escapeID);
        if (self.createtable) {
          self.query = 'CREATE TABLE IF NOT EXISTS ' + self.tablename + '(';
          self.query += self.titles.map(function (item) {
              return item + ' varchar(255)';
            }
          ).join(',');
          self.query += ') ENGINE=MyISAM DEFAULT CHARSET=utf8'
          self.query = self.query.concat(self.delimiter);
          self.push(self.query);
          self.query = '';
        }
      }
      else {
        self.countrows++;
        if (self.countrows == 1) {
          self.query = self.query.concat(self.method, ' INTO ', self.tablename, ' ');
          if (self.title) {
            self.query = self.query.concat('(', self.titles.join(','), ') ');
          }
          self.query = self.query.concat('VALUES ');
        }
        else {
          self.query = self.query.concat(',');
        }
        self.query = self.query.concat('(', row.map(escape).join(','), ')');
        if (self.countrows >= self.numrows) {
          self.query = self.query.concat(self.delimiter);
          self.push(self.query);
          self.query = '';
          self.countrows = 0;
        }
      }
      self.counter++;
    }
  );
}
Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(chunk.toString());
    self.emit('begin');

  }
  self.buffer = self.buffer.concat(chunk.toString());
  var x = CSV.readChunk(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  done();
  self.buffer = self.buffer.slice(x);
}
Command.prototype.end = function () {
  var self = this;
  CSV.readAll(self.buffer, self.separator, function (rows) {
      self.parse(rows);
    }
  );
  if (self.countrows !== 0) {
    self.query = self.query.concat(self.delimiter);
    self.push(self.query);
  }
  self.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
