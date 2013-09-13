'use strict';

var path = require('path')
, basename = path.basename(path.dirname(__filename))
, debug = require('debug')('mill:contrib:' + basename)
, Transform = require("stream").Transform
, CSV = require('csv-string')
;

function quotes(str) {
  return str;
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
  this.title = options.title;
  this.method = (options.method || 'INSERT').toUpperCase();
  this.numrows = options.numrows || 1;
  this.delimiter = options.delimiter === null ? "\n" : options.delimiter;
  this.rows = 0;
}

Command.prototype = Object.create(
  Transform.prototype, { constructor: { value: Command }});

Command.prototype._transform = function (chunk, encoding, done) {
  var self = this;

  self.buffer += chunk;

  if (self.begin) {
    self.begin = false;
    self.separator = CSV.detect(self.buffer);
    self.emit('begin');
  }

  var r, s = 0, ret = '';

  while (r = CSV.read(self.buffer.slice(s), this.separator, function (row) {
        if (row[0] === '' && row.length === 1) {
          return;
        }
        if (self.counter === 0 && self.title) {
          self.titles = row.slice(0).map(quotes);
        }
        else {
          self.rows++;
          if (self.rows === 1) {
            ret += self.method + ' INTO ' + self.tablename + ' ';
            if (self.title) {
              ret += '(' + self.titles.join(',') + ') ';
            }
            ret += 'VALUES ';
          }
          else {
            ret += ',';
          }
          ret += '(' + row.map(quotes).join(',') + ')';
          if (self.rows >= self.numrows) {
            ret += ';' + self.delimiter;
            self.rows = 0;
          }
        }
        self.counter++;
      }
    )
  ) {
    s += r;
  }
  self.push(ret);
  self.buffer = self.buffer.slice(s);
}
Command.prototype._flush = function (done) {
  var self = this;
  self.push(';');
  self.rows = 0;
  done();
};
Command.prototype.end = function () {
  var self = this;
  self.emit('end');
};

module.exports = function (options, si) {
  var cmd = new Command(options);
  return si.pipe(cmd);
}
