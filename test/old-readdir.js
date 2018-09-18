'use strict'

const fs = require('fs')
const readdir = fs.readdir
fs.readdir = (path, options, cb) => readdir(path, cb || options)
const readdirSync = fs.readdirSync
fs.readdirSync = (path, options) => readdirSync(path)

var chmodr = require("../")
, test = require("tap").test
, mkdirp = require("mkdirp")
, rimraf = require("rimraf")
, dirs = []

rimraf("/tmp/chmodr", function (er) {
  if (er) throw er
  var cnt = 5
  for (var i = 0; i < 5; i ++) {
    mkdirp(getDir(), then)
  }
  function then (er) {
    if (er) throw er
    if (-- cnt === 0) {
      runTest()
    }
  }
})

function getDir () {
  var dir = "/tmp/chmodr"

  dir += "/" + Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  dirs.push(dir)
  dir += "/" + Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  dirs.push(dir)
  dir += "/" + Math.floor(Math.random() * Math.pow(16,4)).toString(16)
  dirs.push(dir)
  return dir
}

function runTest () {
  test("should complete successfully", function (t) {
    chmodr("/tmp/chmodr", 0o700, function (er) {
      t.ifError(er)
      t.end()
    })
  })

  dirs.forEach(function (dir) {
    test("verify "+dir, function (t) {
      fs.stat(dir, function (er, st) {
        if (er) {
          t.ifError(er)
          return t.end()
        }
        t.equal(st.mode & 0o777, 0o700, "mode should be 0o700")
        t.end()
      })
    })
  })

  test("cleanup", function (t) {
    rimraf("/tmp/chmodr/", function (er) {
      t.ifError(er)
      t.end()
    })
  })
}

