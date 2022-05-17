const { Sonos } = require('sonos');
let {AsyncDeviceDiscovery} = require('sonos');
let DeviceTunnel = require('./tunnel');

class AirSonos {

  constructor(options) {
    this.tunnels = {};
    this.options = options || {};
  }

  start() {
    return new AsyncDeviceDiscovery().start().then((devices) => {
      let promises = devices.map((device) => {
        return DeviceTunnel.createFor(device, this.options).then((tunnel) => {

          tunnel.on('error', function(err) {
            if (err.code === 415) {
              console.error('Warning!', err.message);
              console.error('AirSonos currently does not support codecs used by applications such as iTunes or AirFoil.');
              console.error('Progress on this issue: https://github.com/stephen/nodetunes/issues/1');
            } else {
              console.error('Unknown error:');
              console.error(err);
            }
          });

          tunnel.start();
          this.tunnels[tunnel.device.groupId] = tunnel;

          return tunnel;
        });
      });

      return Promise.all(promises);
    });
  }

  refresh() {
    return new AsyncDeviceDiscovery().start().then((devices) => {
      // remove old groups
      // add new groups
      // update existing groups with new configurations
    });
  }

  stop() {
    return Promise.all(this.tunnels.map(tunnel.stop));
  }
}

module.exports = AirSonos;
