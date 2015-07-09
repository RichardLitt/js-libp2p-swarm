/*
 * Identify is one of the protocols swarms speaks in order to broadcast and learn about the ip:port
 * pairs a specific peer is available through
 */

var Interactive = require('multistream-select').Interactive
var EventEmmiter = require('events').EventEmitter
var util = require('util')

exports = module.exports = Identify

util.inherits(Identify, EventEmmiter)

function Identify (swarm, peerSelf) {
  var self = this

  swarm.registerHandle('/ipfs/identify/1.0.0', function (stream) {
    var identifyMsg = {}
    identifyMsg = {}
    identifyMsg.sender = exportPeer(peerSelf)
    // TODO (daviddias) populate with the way I see the other peer
    // identifyMsg.receiver =

    stream.write(JSON.stringify(identifyMsg))

    var answer = ''

    stream.on('data', function (chunk) {
      answer += chunk.toString()
    })

    stream.on('end', function () {
      console.log(JSON.prse(answer))
      self.emit('thenews', answer)
    })

    stream.end()

    // receive their info and how they see us
    // send back our stuff
  })

  swarm.on('connection', function (spdyConnection) {
    spdyConnection.request({
      path: '/',
      method: 'GET'
    }, function (err, stream) {
      if (err) {
        return console.log(err)
      }
      var msi = new Interactive()
      msi.handle(stream, function () {
        msi.select('/ipfs/identify/1.0.0', function (err, ds) {
          if (err) {
            return console.log('err')
          }

          var identifyMsg = {}
          identifyMsg = {}
          identifyMsg.sender = exportPeer(peerSelf)
          // TODO (daviddias) populate with the way I see the other peer
          // identifyMsg.receiver =

          stream.write(JSON.stringify(identifyMsg))

          var answer = ''

          stream.on('data', function (chunk) {
            answer += chunk.toString()
          })

          stream.on('end', function () {
            console.log(JSON.parse(answer))
            // TODO (daviddias), push to the connections list on swarm that we have a new known connection
            self.emit('thenews', answer)
          })

          stream.end()
        })
      })
    })
    // open a spdy stream
    // do the multistream handshake
    // send them our data
  })

  function exportPeer (peer) {
    return {
      id: peer.id.toB58String(),
      multiaddrs: peer.multiaddrs.map(function (mh) {
        return mh.toString()
      })
    }
  }
}